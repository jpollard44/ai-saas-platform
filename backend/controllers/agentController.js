const Agent = require('../models/agentModel');
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

// @desc    Create a new agent
// @route   POST /api/agents/create
// @access  Private
exports.createAgent = async (req, res, next) => {
  try {
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

    // Validate required fields
    if (!name || !description || !modelId || !instructions) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: name, description, modelId, and instructions'
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

    // Add optional fields if they exist
    if (templateId) agentData.templateId = templateId;
    if (temperature !== undefined) agentData.temperature = temperature;
    if (maxTokens !== undefined) agentData.maxTokens = maxTokens;
    if (enableWebSearch !== undefined) agentData.enableWebSearch = enableWebSearch;
    if (enableKnowledgeBase !== undefined) agentData.enableKnowledgeBase = enableKnowledgeBase;
    if (enableMemory !== undefined) agentData.enableMemory = enableMemory;
    if (visibility) agentData.visibility = visibility;

    // Create new agent
    const agent = await Agent.create(agentData);

    // Optional: Test the agent with OpenAI if needed
    let testResponse = null;
    if (process.env.NODE_ENV !== 'test') {
      try {
        const testQuery = "Briefly introduce yourself based on your instructions.";
        const result = await openaiService.runAgent(agent, testQuery);
        testResponse = result.response;
      } catch (err) {
        console.error('Agent test error:', err);
        // Don't fail the whole request if test fails
      }
    }

    res.status(201).json({
      success: true,
      data: agent,
      testResponse,
      message: 'Agent created successfully!'
    });
  } catch (err) {
    next(err);
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
    const agents = await Agent.find({ userId: req.user.id });

    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update an agent
// @route   PUT /api/agents/:agentId
// @access  Private
exports.updateAgent = async (req, res, next) => {
  try {
    const { name, customizationOptions } = req.body;

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

    // Update fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (customizationOptions) updateFields.customizationOptions = customizationOptions;

    agent = await Agent.findByIdAndUpdate(
      req.params.agentId,
      updateFields,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (err) {
    next(err);
  }
};
