const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const User = require('../models/userModel');
const MarketplaceListing = require('../models/marketplaceModel');

// @desc    Create a checkout session for an agent
// @route   POST /api/payments/create-checkout-session
// @access  Private
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { agentId, successUrl, cancelUrl } = req.body;

    if (!agentId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        error: 'Please provide agentId, successUrl, and cancelUrl'
      });
    }

    // Get the agent listing from the marketplace
    const listing = await MarketplaceListing.findOne({ agentId }).populate('agentId');

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Agent listing not found'
      });
    }

    // Check if the user already has access to this agent
    const user = await User.findById(req.user.id);
    if (user.acquiredAgents && user.acquiredAgents.includes(agentId)) {
      return res.status(400).json({
        success: false,
        error: 'You already have access to this agent'
      });
    }

    let session;

    // If the agent is free, grant access immediately
    if (listing.pricing.type === 'free') {
      // Add the agent to the user's acquired agents
      user.acquiredAgents = user.acquiredAgents || [];
      user.acquiredAgents.push(agentId);
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Agent acquired successfully',
        isFree: true
      });
    } else {
      // For paid agents, create a Stripe checkout session
      const priceInCents = Math.round(listing.pricing.amount * 100);
      
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: listing.pricing.currency.toLowerCase(),
              product_data: {
                name: listing.title,
                description: listing.description,
                images: [listing.imageUrl].filter(Boolean),
              },
              unit_amount: priceInCents,
            },
            quantity: 1,
          },
        ],
        mode: listing.pricing.type === 'subscription' ? 'subscription' : 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          agentId: agentId,
          userId: req.user.id,
          listingId: listing._id.toString()
        }
      });
    }

    res.status(200).json({
      success: true,
      url: session.url
    });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    next(err);
  }
};

// @desc    Handle Stripe webhook events
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Grant access to the agent
      if (session.metadata && session.metadata.userId && session.metadata.agentId) {
        try {
          const user = await User.findById(session.metadata.userId);
          
          if (!user) {
            console.error('User not found:', session.metadata.userId);
            break;
          }
          
          // Add the agent to the user's acquired agents if not already there
          user.acquiredAgents = user.acquiredAgents || [];
          if (!user.acquiredAgents.includes(session.metadata.agentId)) {
            user.acquiredAgents.push(session.metadata.agentId);
            await user.save();
          }
          
          // Update the listing's stats
          if (session.metadata.listingId) {
            const listing = await MarketplaceListing.findById(session.metadata.listingId);
            if (listing) {
              listing.stats = listing.stats || {};
              listing.stats.purchases = (listing.stats.purchases || 0) + 1;
              listing.stats.revenue = (listing.stats.revenue || 0) + (session.amount_total / 100);
              await listing.save();
            }
          }
        } catch (err) {
          console.error('Error processing checkout completion:', err);
        }
      }
      break;
      
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // Handle subscription events
      break;
      
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break;
      
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};

// @desc    Get user's payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res, next) => {
  try {
    // Get all payments for the user from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      customer: req.user.stripeCustomerId,
      limit: 100
    });

    res.status(200).json({
      success: true,
      data: paymentIntents.data
    });
  } catch (err) {
    next(err);
  }
};
