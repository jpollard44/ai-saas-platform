const express = require('express');
const cors = require('cors');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// CORS options for all routes
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Apply CORS to all routes
router.use(cors(corsOptions));

// Handle OPTIONS preflight requests for all routes
router.options('*', cors(corsOptions));

// Mock auth controller functions
// In a real app, you would import actual controller functions
const login = (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email && password) {
    res.status(200).json({
      success: true,
      data: {
        id: 'user123',
        name: 'Test User',
        email: email,
        token: 'mock-jwt-token'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Please provide email and password'
    });
  }
};

const register = (req, res) => {
  const { name, email, password } = req.body;
  
  if (name && email && password) {
    res.status(201).json({
      success: true,
      data: {
        id: 'user123',
        name: name,
        email: email,
        token: 'mock-jwt-token'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Please provide all required fields'
    });
  }
};

const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com'
    }
  });
};

const forgotPassword = (req, res) => {
  const { email } = req.body;
  
  if (email) {
    res.status(200).json({
      success: true,
      data: 'Password reset email sent'
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Please provide an email address'
    });
  }
};

const resetPassword = (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  if (token && password) {
    res.status(200).json({
      success: true,
      data: 'Password reset successful'
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Invalid token or password not provided'
    });
  }
};

// Define routes
router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
