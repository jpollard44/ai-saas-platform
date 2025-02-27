const express = require('express');
const cors = require('cors');
const {
  createAgent,
  getAgentDetails,
  uploadData,
  fineTuneAgent,
  generateApiKey,
  runAgent,
  getUserAgents,
  updateAgent,
  updateAgentPricing
} = require('../controllers/agentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// CORS options for specific routes
const corsOptions = {
  origin: '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Protected routes
router.options('/create', cors(corsOptions)); // Handle preflight for create
router.post('/create', cors(corsOptions), protect, createAgent);
router.get('/', protect, getUserAgents);
router.get('/:agentId', protect, getAgentDetails);
router.put('/:agentId', protect, updateAgent);
router.put('/:agentId/pricing', protect, updateAgentPricing);
router.post('/:agentId/upload-data', protect, uploadData);
router.post('/:agentId/fine-tune', protect, fineTuneAgent);
router.get('/:agentId/api-key', protect, generateApiKey);

// Public route (with API key authentication)
router.post('/:agentId/run', runAgent);

module.exports = router;
