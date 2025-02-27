const Agent = require('../models/agentModel');
const mongoose = require('mongoose');
const MarketplaceListing = require('../models/marketplaceModel');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const openaiService = require('../utils/openaiService');

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.params.agentId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allow only text and CSV files for fine-tuning
  const filetypes = /txt|csv|json/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only txt, csv, or json files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter
});

// @desc    Create new agent
// @route   POST /api/agents/create
// @access  Private
exports.createAgent = async (req, res, next) => {
  try {
    console.log('Creating agent with data:', JSON.stringify(req.body));
    console.log('User ID:', req.user.id);
    console.log('MongoDB Connection Status:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    
    const { 
      name, 
      description, 
      modelId, 
      templateId, 
      instructions, 
      temperature, 
      maxTokens, 
      enableWebSearch, 
      enableKnowledgeBase, 
      enableMemory,
      visibility
    } = req.body;
    
    console.log('Request body:', JSON.stringify(req.body));
    console.log('User ID:', req.user.id);

    // Validate required fields
    if (!name || !description || !modelId || !instructions) {
      console.error('Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Please provide name, description, model ID, and instructions'
      });
    }

    // Create agent with all provided fields
    const agentData = {
      userId: req.user.id,
      name,
      description,
      modelId,
      instructions
    };

    console.log('Creating agent with user ID:', req.user.id);

    // Add optional fields if they exist
    if (templateId) agentData.templateId = templateId;
    if (temperature !== undefined) agentData.temperature = temperature;
    if (maxTokens !== undefined) agentData.maxTokens = maxTokens;
    if (enableWebSearch !== undefined) agentData.enableWebSearch = enableWebSearch;
    if (enableKnowledgeBase !== undefined) agentData.enableKnowledgeBase = enableKnowledgeBase;
    if (enableMemory !== undefined) agentData.enableMemory = enableMemory;
    
    // Handle pricing data if provided
    if (req.body.pricing) {
      console.log('Processing pricing data:', JSON.stringify(req.body.pricing));
      
      // Create standardized pricing object
      const pricingData = req.body.pricing;
      
      agentData.pricing = {
        type: pricingData.type || 'free',
        amount: pricingData.type === 'free' ? 0 : (parseFloat(pricingData.amount) || 0),
        currency: pricingData.currency || 'USD'
      };
      
      console.log('Final pricing data:', JSON.stringify(agentData.pricing));
    }
    
    // Set visibility with validation
    if (visibility && ['private', 'public', 'marketplace'].includes(visibility)) {
      agentData.visibility = visibility;
    } else {
      agentData.visibility = 'private'; // Default to private if not specified or invalid
    }

    console.log('Creating agent with data:', JSON.stringify(agentData));
    console.log('Agent model exists:', !!mongoose.models.Agent);

    // Create new agent
    let agent;
    try {
      console.log('Attempting to save agent to MongoDB...');
      agent = new mongoose.models.Agent(agentData);
      console.log('Agent instance created, about to save...');
      await agent.save();
      console.log('Agent saved successfully:', agent._id.toString());
    } catch (dbError) {
      console.error('Database error creating agent:', dbError);
      console.error('Error name:', dbError.name);
      console.error('Error code:', dbError.code);
      console.error('Error message:', dbError.message);
      console.error('Error stack:', dbError.stack);
      return res.status(500).json({
        success: false,
        error: `Database error: ${dbError.message}`
      });
    }

    // Log the agent object for debugging
    console.log('Created agent:', JSON.stringify(agent));

    // Optional: Test the agent with OpenAI if needed
    let testResponse = null;
    if (process.env.NODE_ENV !== 'test') {
      try {
        // Check if openaiService is properly initialized
        if (openaiService && typeof openaiService.runAgent === 'function') {
          const testQuery = "Briefly introduce yourself based on your instructions.";
          const result = await openaiService.runAgent(agent, testQuery);
          testResponse = result.response;
        } else {
          console.warn('OpenAI service not properly initialized, skipping agent test');
        }
      } catch (err) {
        console.error('Agent test error:', err);
        // Don't fail the whole request if test fails
      }
    }

    // Make sure we're sending a proper response
    const responseData = {
      success: true,
      data: agent,
      testResponse,
      message: 'Agent created successfully!'
    };
    
    console.log('Sending response:', JSON.stringify(responseData));
    
    return res.status(201).json(responseData);
  } catch (err) {
    console.error('Error in createAgent:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  }
};

// @desc    Get agent details
// @route   GET /api/agents/:agentId
// @access  Private
exports.getAgentDetails = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // Ensure user owns the agent
    if (agent.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this agent'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload data for fine-tuning
// @route   POST /api/agents/:agentId/upload-data
// @access  Private
exports.uploadData = async (req, res, next) => {
  try {
    // Get agent
    const agent = await Agent.findById(req.params.agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // Ensure user owns the agent
    if (agent.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this agent'
      });
    }

    // Use multer to upload the file
    upload.single('dataset')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Please upload a file'
        });
      }

      // Update agent with dataset path
      agent.datasetPath = req.file.path;
      await agent.save();

      res.status(200).json({
        success: true,
        data: {
          fileName: req.file.filename,
          filePath: req.file.path
        }
      });
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Fine-tune the agent
// @route   POST /api/agents/:agentId/fine-tune
// @access  Private
exports.fineTuneAgent = async (req, res, next) => {
  try {
    // Get agent
    const agent = await Agent.findById(req.params.agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // Ensure user owns the agent
    if (agent.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this agent'
      });
    }

    // Check if agent has a dataset
    if (!agent.datasetPath) {
      return res.status(400).json({
        success: false,
        error: 'Agent has no dataset for fine-tuning'
      });
    }

    // Mock fine-tuning process
    // In a real implementation, this would call an AI API
    setTimeout(() => {
      console.log(`Fine-tuning agent ${agent._id} with dataset ${agent.datasetPath}`);
    }, 2000);

    // Update agent status
    agent.isFineTuned = true;
    await agent.save();

    res.status(200).json({
      success: true,
      message: 'Fine-tuning process started. This may take some time.',
      status: 'processing'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate API key for an agent
// @route   GET /api/agents/:agentId/api-key
// @access  Private
exports.generateApiKey = async (req, res, next) => {
  try {
    // Get agent
    const agent = await Agent.findById(req.params.agentId).select('+apiKey');

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // Ensure user owns the agent
    if (agent.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this agent'
      });
    }

    // Generate API key if not exists
    if (!agent.apiKey) {
      const apiKey = crypto.randomBytes(16).toString('hex');
      agent.apiKey = apiKey;
      await agent.save();
    }

    res.status(200).json({
      success: true,
      apiKey: agent.apiKey,
      endpointUrl: `/api/agents/${agent._id}/run`
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Run agent with a query
// @route   POST /api/agents/:agentId/run
// @access  Public (with API key)
exports.runAgent = async (req, res, next) => {
  try {
    const { query } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a query'
      });
    }

    // Find the agent
    const agent = await Agent.findById(req.params.agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // For private agents, verify API key
    if (agent.visibility === 'private') {
      // Get the agent with API key included
      const agentWithKey = await Agent.findById(req.params.agentId).select('+apiKey');
      
      if (!apiKey || !agentWithKey.apiKey || apiKey !== agentWithKey.apiKey) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API key'
        });
      }
    }

    // Start timing for response metrics
    const startTime = Date.now();

    // Process the query using OpenAI
    const result = await openaiService.runAgent(agent, query);

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Update agent stats
    agent.stats.usageCount += 1;
    
    // Update average response time
    const currentAvg = agent.stats.averageResponseTime;
    const newTotal = currentAvg * (agent.stats.usageCount - 1) + responseTime;
    agent.stats.averageResponseTime = newTotal / agent.stats.usageCount;
    
    await agent.save();

    // Return the response
    res.status(200).json({
      success: true,
      agentId: agent._id,
      response: result.response,
      stats: {
        responseTime,
        tokens: result.usage
      }
    });
  } catch (err) {
    console.error('Agent run error:', err);
    next(err);
  }
};

// @desc    Get all agents for a user
// @route   GET /api/agents
// @access  Private
exports.getUserAgents = async (req, res, next) => {
  try {
    console.log('Getting agents for user:', req.user.id);
    
    const agents = await Agent.find({ userId: req.user.id });
    
    console.log(`Found ${agents.length} agents for user ${req.user.id}`);
    
    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (err) {
    console.error('Error in getUserAgents:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  }
};

// @desc    Update an agent
// @route   PUT /api/agents/:agentId
// @access  Private
exports.updateAgent = async (req, res, next) => {
  try {
    // Get agent
    let agent = await Agent.findById(req.params.agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // Ensure user owns the agent
    if (agent.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this agent'
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      'name', 
      'description', 
      'instructions', 
      'temperature', 
      'maxTokens', 
      'enableWebSearch', 
      'enableKnowledgeBase', 
      'enableMemory', 
      'visibility',
      'pricing',
      'customizationOptions'
    ];
    
    // Create update object with only allowed fields
    const updateFields = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    }
    
    // If pricing type is free, ensure amount is 0
    if (updateFields.pricing && updateFields.pricing.type === 'free') {
      updateFields.pricing.amount = 0;
    }
    
    // Update agent
    agent = await Agent.findByIdAndUpdate(
      req.params.agentId,
      updateFields,
      {
        new: true,
        runValidators: true
      }
    );

    // If the agent is published to marketplace, update the marketplace listing as well
    if (agent.visibility === 'marketplace') {
      try {
        console.log('Updating marketplace listing from updateAgent function');
        
        const marketplaceListing = await MarketplaceListing.findOne({ agentId: agent._id });
        
        if (marketplaceListing) {
          console.log('Found marketplace listing:', marketplaceListing._id);
          
          // Create update object for marketplace
          const marketplaceUpdates = {};
          
          if (updateFields.name) marketplaceUpdates.title = updateFields.name;
          if (updateFields.description) marketplaceUpdates.description = updateFields.description;
          if (updateFields.pricing) marketplaceUpdates.pricing = updateFields.pricing;
          
          // Update the marketplace listing using findOne and save to ensure validation works
          Object.assign(marketplaceListing, marketplaceUpdates);
          await marketplaceListing.save();
          
          console.log('Marketplace listing updated successfully');
        }
      } catch (marketplaceError) {
        console.error('Error updating marketplace listing:', marketplaceError);
        // Continue with the response even if marketplace update fails
      }
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (err) {
    console.error('Error updating agent:', err);
    next(err);
  }
};

// @desc    Update agent pricing
// @route   PUT /api/agents/:agentId/pricing
// @access  Private
exports.updateAgentPricing = async (req, res, next) => {
  try {
    console.log('Received pricing update request body:', JSON.stringify(req.body));
    
    // Extract pricing data from request body, regardless of structure
    let pricingData;
    
    if (req.body.pricing) {
      // If pricing is nested under 'pricing' key
      pricingData = req.body.pricing;
    } else if (req.body.type) {
      // If pricing fields are directly in the request body
      pricingData = {
        type: req.body.type,
        amount: req.body.amount || 0,
        currency: req.body.currency || 'USD'
      };
    } else {
      // No valid pricing data found
      console.log('No valid pricing data found in request');
      return res.status(400).json({
        success: false,
        error: 'Valid pricing information is required'
      });
    }
    
    console.log('Extracted pricing data:', pricingData);
    
    // Validate pricing type
    if (!pricingData.type) {
      return res.status(400).json({
        success: false,
        error: 'Pricing type is required'
      });
    }
    
    if (!['free', 'one-time', 'subscription'].includes(pricingData.type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pricing type. Must be free, one-time, or subscription'
      });
    }
    
    // Get agent
    let agent = await Agent.findById(req.params.agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // Ensure user owns the agent
    if (agent.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this agent'
      });
    }
    
    // Create standardized pricing object
    const updatedPricing = {
      type: pricingData.type,
      amount: pricingData.type === 'free' ? 0 : (pricingData.amount || 0),
      currency: pricingData.currency || 'USD'
    };
    
    console.log('Final pricing data to save:', updatedPricing);
    
    // Update agent pricing using findOne and save to ensure validation works correctly
    agent = await Agent.findOne({ _id: req.params.agentId });
    agent.pricing = updatedPricing;
    await agent.save();
    
    // If the agent is published to marketplace, update the marketplace listing as well
    if (agent.visibility === 'marketplace') {
      try {
        console.log('Updating marketplace listing for agent:', agent._id);
        
        // Find the marketplace listing
        const marketplaceListing = await MarketplaceListing.findOne({ agentId: agent._id });
        
        if (marketplaceListing) {
          console.log('Found marketplace listing:', marketplaceListing._id);
          
          // Update the marketplace listing using findOne and save
          marketplaceListing.pricing = updatedPricing;
          await marketplaceListing.save();
          
          console.log('Marketplace listing updated successfully');
        } else {
          console.log('No marketplace listing found for agent');
        }
      } catch (marketplaceError) {
        console.error('Error updating marketplace listing:', marketplaceError);
        // Continue with the response even if marketplace update fails
      }
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (err) {
    console.error('Error updating agent pricing:', err);
    next(err);
  }
};
