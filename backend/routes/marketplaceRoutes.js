const express = require('express');
const {
  listAgent,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  createReview,
  getAgentReviews,
  subscribeToAgent
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/agents', getListings);
router.get('/agents/:id', getListing);
router.get('/agents/:id/reviews', getAgentReviews);

// Protected routes
router.post('/list', protect, listAgent);
router.put('/agents/:id', protect, updateListing);
router.delete('/agents/:id', protect, deleteListing);
router.post('/reviews', protect, createReview);
router.post('/agents/:id/subscribe', protect, subscribeToAgent);

module.exports = router;
