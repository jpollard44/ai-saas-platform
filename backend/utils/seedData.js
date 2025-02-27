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

// Production-ready agents for marketplace
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

// Import data into DB
const importData = async () => {
  try {
    const conn = await connectDB();
    
    // Clear existing data
    await Agent.deleteMany();
    await MarketplaceListing.deleteMany();
    await Review.deleteMany();
    
    console.log('Data cleared from database');

    // Create marketplace agents
    const createdAgents = await Agent.insertMany(agents);
    console.log(`${createdAgents.length} agents created`);
    
    // Create marketplace listings for each agent
    const marketplaceListings = createdAgents.map(agent => ({
      agent: agent._id,
      price: Math.floor(Math.random() * 4) * 5 + 5, // Random price between $5-$20 in $5 increments
      category: agent.templateId,
      features: [
        'Unlimited conversations',
        'Custom instructions',
        'Web search capability',
        '24/7 availability'
      ],
      isPublished: true
    }));
    
    await MarketplaceListing.insertMany(marketplaceListings);
    console.log(`${marketplaceListings.length} marketplace listings created`);
    
    console.log('Data imported successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await connectDB();
    
    await Agent.deleteMany();
    await MarketplaceListing.deleteMany();
    await Review.deleteMany();
    
    console.log('Data destroyed successfully');
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
