const express = require('express');
const {
  getOnboardingStatus,
  updateOnboardingStep,
  getOnboardingTips,
  skipOnboarding
} = require('../controllers/onboardingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.get('/status', protect, getOnboardingStatus);
router.put('/step/:step', protect, updateOnboardingStep);
router.get('/tips/:page', protect, getOnboardingTips);
router.put('/skip', protect, skipOnboarding);

module.exports = router;
