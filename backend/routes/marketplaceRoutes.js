const express = require('express');
const {
  listAgent,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  createReview,
  getAgentReviews,
  subscribeToAgent,
  getCategories,
  getUserAcquiredAgents,
  getUserPublishedAgents,
  getFeaturedAgents
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/listings', getListings);
router.get('/listings/:id', getListing);
router.get('/reviews/:listingId', getAgentReviews);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedAgents);

// Protected routes
router.post('/list', protect, listAgent);
router.put('/listings/:id', protect, updateListing);
router.delete('/listings/:id', protect, deleteListing);
router.post('/review/:listingId', protect, createReview);
router.post('/acquire/:listingId', protect, subscribeToAgent);
router.get('/acquired', protect, getUserAcquiredAgents);
router.get('/published', protect, getUserPublishedAgents);

module.exports = router;
