const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use a local MongoDB instance for testing
    const localMongoURI = 'mongodb://localhost:27017/ai-saas-platform';
    
    const conn = await mongoose.connect(process.env.MONGO_URI || localMongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    
    // If we can't connect to the specified MongoDB, try connecting to a local instance
    try {
      console.log('Trying to connect to local MongoDB instance...');
      const localMongoURI = 'mongodb://localhost:27017/ai-saas-platform';
      const conn = await mongoose.connect(localMongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log(`MongoDB Connected (local): ${conn.connection.host}`);
      return conn;
    } catch (localError) {
      console.error(`Error connecting to local MongoDB: ${localError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
