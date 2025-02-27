const express = require('express');
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

// Protected routes
router.post('/create', protect, createAgent);
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
