const MarketplaceListing = require('../models/marketplaceModel');
const Agent = require('../models/agentModel');
const Review = require('../models/reviewModel');

// @desc    List an agent in the marketplace
// @route   POST /api/marketplace/list
// @access  Private
exports.listAgent = async (req, res, next) => {
  try {
    const { agentId, title, description, pricing, category, tags } = req.body;

    // Validate required fields
    if (!agentId || !description || !pricing || !pricing.type || !category) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Validate pricing
    if (pricing.type !== 'free' && (!pricing.amount || pricing.amount < 0)) {
      return res.status(400).json({
        success: false,
        error: 'For paid agents, please provide a valid price amount'
      });
    }

    // Check if the agent exists and belongs to the user
    const agent = await Agent.findById(agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    if (agent.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'You can only list agents that you own'
      });
    }

    // Check if agent is already listed
    const existingListing = await MarketplaceListing.findOne({ agentId });

    if (existingListing) {
      return res.status(400).json({
        success: false,
        error: 'This agent is already listed in the marketplace'
      });
    }

    // Create new listing
    const listing = await MarketplaceListing.create({
      agentId,
      sellerId: req.user.id,
      title: title || agent.name, // Use agent name if title is not provided
      description,
      pricing,
      category,
      tags: tags || []
    });

    // Update agent as published
    agent.isPublished = true;
    await agent.save();

    res.status(201).json({
      success: true,
      data: listing
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all marketplace listings
// @route   GET /api/marketplace/agents
// @access  Public
exports.getListings = async (req, res, next) => {
  try {
    let query = {};

    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by price type if provided
    if (req.query.pricingType) {
      query['pricing.type'] = req.query.pricingType;
    }

    // Search by keyword if provided
    if (req.query.keyword) {
      query.$text = { $search: req.query.keyword };
    }

    // Get all active listings
    query.isActive = true;

    const listings = await MarketplaceListing.find(query)
      .sort({ 'rating.average': -1 })
      .populate('sellerId', 'name')
      .populate('agentId', 'name modelType customizationOptions');

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single marketplace listing
// @route   GET /api/marketplace/agents/:id
// @access  Public
exports.getListing = async (req, res, next) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id)
      .populate('sellerId', 'name')
      .populate('agentId', 'name modelType');

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a marketplace listing
// @route   PUT /api/marketplace/agents/:id
// @access  Private
exports.updateListing = async (req, res, next) => {
  try {
    let listing = await MarketplaceListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    // Make sure user is the seller
    if (listing.sellerId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this listing'
      });
    }

    // Update the listing
    listing = await MarketplaceListing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a marketplace listing
// @route   DELETE /api/marketplace/agents/:id
// @access  Private
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    // Make sure user is the seller
    if (listing.sellerId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this listing'
      });
    }

    // Remove the listing
    await listing.remove();

    // Update agent status
    const agent = await Agent.findById(listing.agentId);
    if (agent) {
      agent.isPublished = false;
      await agent.save();
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a review for an agent
// @route   POST /api/marketplace/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { agentId, rating, comment } = req.body;

    // Validate input
    if (!agentId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Please provide agentId, rating and comment'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Find the listing for this agent
    const listing = await MarketplaceListing.findOne({ agentId });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found in marketplace'
      });
    }

    // Check if user already reviewed this agent
    const alreadyReviewed = await Review.findOne({
      userId: req.user.id,
      agentId,
      listingId: listing._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        error: 'Agent already reviewed'
      });
    }

    // Create review
    const review = await Review.create({
      userId: req.user.id,
      agentId,
      listingId: listing._id,
      rating,
      comment
    });

    // Update listing rating
    const reviews = await Review.find({ listingId: listing._id });
    const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / reviews.length;

    listing.rating.average = averageRating;
    listing.rating.count = reviews.length;
    await listing.save();

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for an agent
// @route   GET /api/marketplace/agents/:id/reviews
// @access  Public
exports.getAgentReviews = async (req, res, next) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    const reviews = await Review.find({ listingId: listing._id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Subscribe to an agent (mock implementation)
// @route   POST /api/marketplace/agents/:id/subscribe
// @access  Private
exports.subscribeToAgent = async (req, res, next) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    // Mock Stripe payment
    console.log(`User ${req.user.id} paid for agent ${listing.agentId}`);

    res.status(200).json({
      success: true,
      message: 'Subscription successful',
      apiKey: 'mock_api_key_for_subscription',
      endpointUrl: `/api/agents/${listing.agentId}/run`
    });
  } catch (err) {
    next(err);
  }
};
