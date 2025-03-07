const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const userRoutes = require('./routes/userRoutes');
const agentRoutes = require('./routes/agentRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const communityRoutes = require('./routes/communityRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security middleware
// Enable CORS for all environments
const corsOrigin = process.env.CORS_ORIGIN || '*';
const corsMethods = process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,PATCH,OPTIONS';
const corsHeaders = process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization,X-Requested-With';

console.log('CORS Configuration:');
console.log('- Origin:', corsOrigin);
console.log('- Methods:', corsMethods);
console.log('- Headers:', corsHeaders);

app.use(cors({
  origin: corsOrigin,
  methods: corsMethods.split(','),
  allowedHeaders: corsHeaders.split(','),
  credentials: true
}));

console.log('CORS enabled with configuration above');

// Add OPTIONS handling for preflight requests
app.options('*', cors({
  origin: corsOrigin,
  methods: corsMethods.split(','),
  allowedHeaders: corsHeaders.split(','),
  credentials: true
}));

// Add explicit CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', corsOrigin);
  res.header('Access-Control-Allow-Methods', corsMethods);
  res.header('Access-Control-Allow-Headers', corsHeaders);
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request from:', req.headers.origin);
    return res.status(200).end();
  }
  
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});

// Set security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Add healthcheck endpoint
app.get('/api/healthcheck', (req, res) => {
  console.log('Healthcheck endpoint called');
  res.status(200).json({ 
    status: 'success', 
    message: 'API is running',
    environment: process.env.NODE_ENV,
    cors: 'enabled for all origins',
    timestamp: new Date().toISOString()
  });
});

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/api', limiter);

// Prevent http param pollution
app.use(hpp());

// Sanitize data
app.use(mongoSanitize());

// Mount routers
app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/onboarding', onboardingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested from:', req.headers.origin || 'Unknown origin');
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    cors: {
      origin: corsOrigin,
      methods: corsMethods,
      headers: corsHeaders
    }
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Any route that is not an API route will be handled by the React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
