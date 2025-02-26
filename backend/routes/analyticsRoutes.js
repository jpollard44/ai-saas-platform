const express = require('express');
const {
  getAgentAnalytics,
  getDashboardAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All analytics routes are protected
router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/:agentId', getAgentAnalytics);

module.exports = router;
