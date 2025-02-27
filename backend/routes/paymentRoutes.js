const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Mock payment controller functions
// In a real app, you would import actual controller functions
const createCheckoutSession = (req, res) => {
  const { agentId, successUrl, cancelUrl } = req.body;
  
  if (agentId && successUrl && cancelUrl) {
    // In a real app, this would create a Stripe checkout session
    res.status(200).json({
      success: true,
      url: successUrl + '?session_id=mock_session_id',
      sessionId: 'mock_session_id'
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Please provide all required fields'
    });
  }
};

const getPaymentHistory = (req, res) => {
  res.status(200).json({
    success: true,
    data: [
      {
        _id: 'payment1',
        agentId: 'agent1',
        agentName: 'Data Analyst Pro',
        amount: 49.99,
        status: 'completed',
        createdAt: new Date(Date.now() - 2592000000).toISOString() // 30 days ago
      },
      {
        _id: 'payment2',
        agentId: 'agent2',
        agentName: 'Content Writer',
        amount: 29.99,
        status: 'completed',
        createdAt: new Date(Date.now() - 1296000000).toISOString() // 15 days ago
      }
    ]
  });
};

const getEarnings = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      totalEarnings: 1250.75,
      availableForWithdrawal: 750.25,
      pendingEarnings: 500.50,
      recentTransactions: [
        {
          _id: 'earning1',
          agentId: 'agent1',
          agentName: 'Data Analyst Pro',
          amount: 35.00,
          status: 'available',
          createdAt: new Date(Date.now() - 604800000).toISOString() // 7 days ago
        },
        {
          _id: 'earning2',
          agentId: 'agent1',
          agentName: 'Data Analyst Pro',
          amount: 35.00,
          status: 'pending',
          createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
      ]
    }
  });
};

const withdrawEarnings = (req, res) => {
  const { amount, paymentMethod } = req.body;
  
  if (amount && paymentMethod) {
    res.status(200).json({
      success: true,
      data: {
        withdrawalId: 'withdrawal1',
        amount: amount,
        status: 'processing',
        estimatedArrival: new Date(Date.now() + 259200000).toISOString() // 3 days later
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Please provide amount and payment method'
    });
  }
};

const updatePaymentMethod = (req, res) => {
  const { type, details } = req.body;
  
  if (type && details) {
    res.status(200).json({
      success: true,
      data: {
        type: type,
        last4: details.last4 || '1234',
        expiryMonth: details.expiryMonth || '12',
        expiryYear: details.expiryYear || '2025',
        isDefault: true
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Please provide payment method details'
    });
  }
};

// Define routes
router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/history', protect, getPaymentHistory);
router.get('/earnings', protect, getEarnings);
router.post('/withdraw', protect, withdrawEarnings);
router.put('/method', protect, updatePaymentMethod);

module.exports = router;
