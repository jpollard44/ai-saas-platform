const express = require('express');
const cors = require('cors');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

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

// Route to verify token validity
router.get('/verify-token', protect, (req, res) => {
  console.log('Token verification successful for user:', req.user.email);
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile/:userId', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
