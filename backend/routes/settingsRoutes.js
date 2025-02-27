const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Mock settings controller functions
// In a real app, you would import actual controller functions
const getNotificationSettings = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      emailNotifications: {
        marketing: true,
        agentUpdates: true,
        subscriptionAlerts: true,
        paymentReceipts: true
      },
      pushNotifications: {
        newMessages: true,
        agentUpdates: false,
        subscriptionAlerts: true,
        paymentReceipts: false
      }
    }
  });
};

const updateNotificationSettings = (req, res) => {
  const { emailNotifications, pushNotifications } = req.body;
  
  if (emailNotifications || pushNotifications) {
    res.status(200).json({
      success: true,
      data: {
        emailNotifications: emailNotifications || {
          marketing: true,
          agentUpdates: true,
          subscriptionAlerts: true,
          paymentReceipts: true
        },
        pushNotifications: pushNotifications || {
          newMessages: true,
          agentUpdates: false,
          subscriptionAlerts: true,
          paymentReceipts: false
        }
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Please provide notification settings to update'
    });
  }
};

const getApiKeys = (req, res) => {
  res.status(200).json({
    success: true,
    data: [
      {
        _id: 'key1',
        name: 'Development API Key',
        key: 'sk_test_******************************1234',
        createdAt: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
        lastUsed: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        _id: 'key2',
        name: 'Production API Key',
        key: 'sk_live_******************************5678',
        createdAt: new Date(Date.now() - 1296000000).toISOString(), // 15 days ago
        lastUsed: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      }
    ]
  });
};

const createApiKey = (req, res) => {
  const { name } = req.body;
  
  if (name) {
    res.status(201).json({
      success: true,
      data: {
        _id: 'new-key-id',
        name: name,
        key: 'sk_test_' + Array(24).fill(0).map(() => Math.random().toString(36).charAt(2)).join('') + '9876',
        createdAt: new Date().toISOString(),
        lastUsed: null
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Please provide a name for the API key'
    });
  }
};

const deleteApiKey = (req, res) => {
  const { id } = req.params;
  
  res.status(200).json({
    success: true,
    data: {}
  });
};

// Define routes
router.get('/notifications', protect, getNotificationSettings);
router.put('/notifications', protect, updateNotificationSettings);
router.get('/api-keys', protect, getApiKeys);
router.post('/api-keys', protect, createApiKey);
router.delete('/api-keys/:id', protect, deleteApiKey);

module.exports = router;
