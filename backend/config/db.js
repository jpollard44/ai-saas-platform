const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    console.log('Attempting to connect to MongoDB...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGO_URI:', mongoURI ? 'Set (value hidden for security)' : 'Not set');
    
    if (!mongoURI) {
      console.error('MongoDB URI is not defined. Please check your environment variables.'.red);
      process.exit(1);
    }
    
    // Set strictQuery to suppress the deprecation warning
    mongoose.set('strictQuery', true);
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increased timeout to 30 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: 'majority', // Write concern
      retryReads: true
    };

    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    console.log(`MongoDB Database Name: ${conn.connection.name}`.cyan);
    console.log(`MongoDB Connection State: ${conn.connection.readyState}`.cyan);
    
    // List all collections
    try {
      const collections = await conn.connection.db.listCollections().toArray();
      console.log('Available collections:'.cyan, collections.map(c => c.name).join(', '));
    } catch (err) {
      console.warn('Could not list collections:'.yellow, err.message);
    }
    
    // Check if Agent model exists
    const modelNames = mongoose.modelNames();
    console.log('Registered models:'.cyan, modelNames.join(', ') || 'None');
    
    // Add connection event listeners
    mongoose.connection.on('error', err => {
      console.error(`MongoDB connection error: ${err}`.red);
      
      // Try to provide more specific error information
      if (err.name === 'MongoServerSelectionError') {
        console.error('Server selection error - check network connectivity and MongoDB Atlas settings'.red);
      } else if (err.name === 'MongoParseError') {
        console.error('MongoDB connection string parse error - check MONGO_URI format'.red);
      } else if (err.message.includes('authentication failed')) {
        console.error('Authentication failed - check username and password in connection string'.red);
      }
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected'.yellow);
      
      // Attempt to reconnect if disconnected, but only in production
      if (process.env.NODE_ENV === 'production') {
        console.log('Attempting to reconnect to MongoDB in 5 seconds...'.yellow);
        setTimeout(connectDB, 5000);
      }
    });
    
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected'.green);
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected'.green);
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination'.yellow);
      process.exit(0);
    });
    
    return conn;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`.red);
    console.error('Error details:'.red, err);
    
    // Try to provide more specific error information
    if (err.name === 'MongoServerSelectionError') {
      console.error('Server selection error - check network connectivity and MongoDB Atlas settings'.red);
      console.error('Make sure your IP address is whitelisted in MongoDB Atlas'.red);
    } else if (err.name === 'MongoParseError') {
      console.error('MongoDB connection string parse error - check MONGO_URI format'.red);
    } else if (err.message.includes('authentication failed')) {
      console.error('Authentication failed - check username and password in connection string'.red);
    }
    
    // Exit with failure in production, but keep running in development
    if (process.env.NODE_ENV === 'production') {
      console.error('Exiting process due to MongoDB connection failure in production'.red);
      process.exit(1);
    } else {
      console.warn('Continuing despite MongoDB connection failure (development mode)'.yellow);
      return null;
    }
  }
};

module.exports = connectDB;
