const User = require('../models/userModel');
const { ErrorResponse } = require('../middleware/errorMiddleware');

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate email & password
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      userId: user._id,
      message: 'Welcome aboard!',
      token
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      userId: user._id
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile/:userId
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    console.log('getUserProfile called with params:', req.params);
    console.log('Authenticated user:', req.user);
    
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Only allow the authenticated user to view their profile
    // Compare string representations of IDs
    const requestedId = userId.toString();
    const authenticatedId = req.user.id.toString();
    
    console.log('Comparing IDs:', { requestedId, authenticatedId });
    
    if (requestedId !== authenticatedId && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this profile'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        settings: user.settings
      }
    });
  } catch (err) {
    console.error('Error in getUserProfile:', err);
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name, settings } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (settings) updateFields.settings = settings;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        settings: user.settings
      }
    });
  } catch (err) {
    next(err);
  }
};
