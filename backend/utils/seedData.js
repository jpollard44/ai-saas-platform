const mongoose = require('mongoose');
const User = require('../models/userModel');
const Agent = require('../models/agentModel');
const MarketplaceListing = require('../models/marketplaceModel');
const Review = require('../models/reviewModel');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    // Use MongoDB Memory Server for local development if MONGO_URI is not set
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<password>')) {
      console.log('Using MongoDB Memory Server for local development');
      const mongod = await MongoMemoryServer.create();
      process.env.MONGO_URI = mongod.getUri();
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    isAdmin: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
  },
];

const agents = [
  {
    name: 'Customer Support Pro',
    description: 'Advanced AI assistant for handling customer inquiries with empathy and precision.',
    modelId: 'gpt-3.5-turbo',
    instructions: 'You are a customer support assistant. Be helpful, empathetic, and provide accurate information to customer inquiries.',
    templateId: 'customer-support',
    temperature: 0.7,
    maxTokens: 1024,
    enableWebSearch: true,
    isPublished: true,
  },
  {
    name: 'Content Wizard',
    description: 'Generate blog posts, social media content, and marketing copy with a single prompt.',
    modelId: 'gpt-3.5-turbo',
    instructions: 'You are a content creation assistant. Help users generate creative, engaging, and well-structured content for various platforms.',
    templateId: 'content-writer',
    temperature: 0.8,
    maxTokens: 2048,
    enableWebSearch: true,
    isPublished: true,
  },
  {
    name: 'Data Insights',
    description: 'Transform raw data into actionable insights with natural language queries.',
    modelId: 'gpt-4',
    instructions: 'You are a data analysis assistant. Help users interpret data, generate insights, and create visualizations from their datasets.',
    templateId: 'data-analyst',
    temperature: 0.2,
    maxTokens: 1024,
    enableWebSearch: false,
    isPublished: true,
  },
  {
    name: 'Code Assistant',
    description: 'Help with coding tasks, debugging, and explaining complex code.',
    modelId: 'gpt-4',
    instructions: 'You are a coding assistant. Help users write, debug, and understand code across various programming languages.',
    templateId: 'coding-assistant',
    temperature: 0.3,
    maxTokens: 2048,
    enableWebSearch: true,
    isPublished: true,
  },
];

const marketplaceListings = [
  {
    title: 'Customer Support Pro',
    description: 'Advanced AI assistant for handling customer inquiries with empathy and precision. Perfect for businesses looking to improve their customer service experience.',
    pricing: {
      type: 'subscription',
      amount: 19.99,
      currency: 'USD',
    },
    category: 'Customer Support',
    tags: ['customer service', 'support', 'chatbot'],
    rating: {
      average: 4.8,
      count: 24,
    },
    isActive: true,
  },
  {
    title: 'Content Wizard',
    description: 'Generate blog posts, social media content, and marketing copy with a single prompt. Boost your content creation productivity and maintain a consistent brand voice.',
    pricing: {
      type: 'subscription',
      amount: 24.99,
      currency: 'USD',
    },
    category: 'Content Creation',
    tags: ['content', 'marketing', 'writing'],
    rating: {
      average: 4.7,
      count: 18,
    },
    isActive: true,
  },
  {
    title: 'Data Insights',
    description: 'Transform raw data into actionable insights with natural language queries. Perfect for business analysts and data scientists who want to quickly extract value from their data.',
    pricing: {
      type: 'subscription',
      amount: 39.99,
      currency: 'USD',
    },
    category: 'Data Analysis',
    tags: ['data', 'analytics', 'insights'],
    rating: {
      average: 4.9,
      count: 12,
    },
    isActive: true,
  },
  {
    title: 'Code Assistant',
    description: 'Help with coding tasks, debugging, and explaining complex code. Your AI pair programming partner that helps you write better code faster.',
    pricing: {
      type: 'free',
      currency: 'USD',
    },
    category: 'Productivity',
    tags: ['coding', 'programming', 'development'],
    rating: {
      average: 4.6,
      count: 30,
    },
    isActive: true,
  },
];

const reviews = [
  {
    rating: 5,
    comment: 'This agent has completely transformed our customer support operations. Response times are down and customer satisfaction is up!',
  },
  {
    rating: 4,
    comment: 'Very good at generating content ideas and drafts. Sometimes needs a bit of editing but overall a huge time saver.',
  },
  {
    rating: 5,
    comment: 'The data insights from this agent are incredible. It found patterns in our data that we had missed for months.',
  },
  {
    rating: 4,
    comment: 'Great coding assistant. Helps me debug issues quickly and explains complex concepts clearly.',
  },
];

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Agent.deleteMany();
    await MarketplaceListing.deleteMany();
    await Review.deleteMany();

    console.log('Data cleared...');

    // Create users
    const createdUsers = await User.insertMany(
      users.map((user) => {
        return {
          ...user,
          password: bcrypt.hashSync(user.password, 10),
        };
      })
    );

    const adminUser = createdUsers[0]._id;
    const regularUser = createdUsers[1]._id;
    const anotherUser = createdUsers[2]._id;

    console.log('Users created...');

    // Create agents
    const createdAgents = await Agent.insertMany(
      agents.map((agent, index) => {
        return {
          ...agent,
          userId: index % 2 === 0 ? adminUser : regularUser,
        };
      })
    );

    console.log('Agents created...');

    // Create marketplace listings
    const createdListings = await MarketplaceListing.insertMany(
      marketplaceListings.map((listing, index) => {
        return {
          ...listing,
          agentId: createdAgents[index]._id,
          sellerId: index % 2 === 0 ? adminUser : regularUser,
        };
      })
    );

    console.log('Marketplace listings created...');

    // Create reviews
    const createdReviews = await Promise.all(
      reviews.map(async (review, index) => {
        return await Review.create({
          userId: index % 2 === 0 ? regularUser : anotherUser,
          agentId: createdAgents[index]._id,
          listingId: createdListings[index]._id,
          rating: review.rating,
          comment: review.comment,
        });
      })
    );

    console.log('Reviews created...');

    console.log('Data imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Agent.deleteMany();
    await MarketplaceListing.deleteMany();
    await Review.deleteMany();

    console.log('Data destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Connect to the database
connectDB().then(() => {
  // Run the appropriate function based on command line args
  if (process.argv[2] === '-d') {
    destroyData();
  } else {
    importData();
  }
});
