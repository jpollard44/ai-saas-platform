const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

const generateToken = async () => {
  try {
    await connectDB();
    
    // Find the test user
    const user = await mongoose.connection.db.collection('users').findOne({ email: 'test@example.com' });
    
    if (!user) {
      console.error('Test user not found');
      process.exit(1);
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });
    
    console.log('JWT Token for test user:');
    console.log(token);
    
    process.exit(0);
  } catch (err) {
    console.error('Error generating token:', err);
    process.exit(1);
  }
};

generateToken();
