const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.error('MongoDB URI is not defined. Please check your environment variables.');
      process.exit(1);
    }
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    
    // Add connection event listeners
    mongoose.connection.on('error', err => {
      console.error(`MongoDB connection error: ${err}`.red);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected'.yellow);
      // Attempt to reconnect if disconnected
      setTimeout(connectDB, 5000);
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination'.yellow);
      process.exit(0);
    });
    
    return conn;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`.red);
    // Exit with failure
    process.exit(1);
  }
};

module.exports = connectDB;
