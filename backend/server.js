const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
const startServer = async () => {
  try {
    await connectDB();
    
    const app = express();

    // Middleware
    app.use(express.json());
    app.use(cors());
    
    // Only use morgan in development
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    });
    app.use(limiter);

    // Set static folder
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Import routes
    const userRoutes = require('./routes/userRoutes');
    const agentRoutes = require('./routes/agentRoutes');
    const marketplaceRoutes = require('./routes/marketplaceRoutes');
    const analyticsRoutes = require('./routes/analyticsRoutes');
    const communityRoutes = require('./routes/communityRoutes');

    // Health check route for deployment monitoring
    app.get('/api/healthcheck', (req, res) => {
      res.status(200).json({ status: 'ok', message: 'Server is running', environment: process.env.NODE_ENV });
    });

    // Mount routes
    app.use('/api/users', userRoutes);
    app.use('/api/agents', agentRoutes);
    app.use('/api/marketplace', marketplaceRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/community', communityRoutes);

    // Serve static assets in production
    if (process.env.NODE_ENV === 'production') {
      // Set static folder
      app.use(express.static(path.join(__dirname, '../frontend/build')));

      // Any route that is not an API route should be handled by React
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
      });
    } else {
      app.get('/', (req, res) => {
        res.send('API is running...');
      });
    }

    // Error handling middleware
    const { errorHandler } = require('./middleware/errorMiddleware');
    app.use(errorHandler);

    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
