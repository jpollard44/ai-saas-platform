const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;
  
  console.log('Auth middleware called');
  console.log('Headers:', JSON.stringify(req.headers));

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    console.log('Token extracted from Authorization header:', token ? `${token.substring(0, 10)}...` : 'none');
  } else {
    console.log('No Authorization header with Bearer token found');
  }

  // Make sure token exists
  if (!token) {
    console.log('No token provided, access denied');
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    console.log('Verifying token with JWT_SECRET');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully, decoded ID:', decoded.id);

    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found with ID:', decoded.id);
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    console.log('User found:', user.email);
    req.user = user;

    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
      details: err.message
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
