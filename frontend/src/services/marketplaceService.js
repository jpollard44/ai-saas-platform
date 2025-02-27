import api from './api';

// Marketplace service for handling API calls related to the marketplace
const marketplaceService = {
  // Get all marketplace listings
  getListings: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.price) params.append('price', filters.price);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const queryString = params.toString();
    return api.get(`/marketplace/listings${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get a specific marketplace listing by ID
  getListing: (id) => {
    return api.get(`/marketplace/listings/${id}`);
  },
  
  // Publish an agent to the marketplace
  listAgent: (listingData) => {
    return api.post('/marketplace/list', listingData);
  },
  
  // Update a marketplace listing
  updateListing: (id, updateData) => {
    return api.put(`/marketplace/listings/${id}`, updateData);
  },
  
  // Remove a listing from the marketplace
  unlistAgent: (id) => {
    return api.delete(`/marketplace/listings/${id}`);
  },
  
  // Purchase or subscribe to an agent
  acquireAgent: (listingId, paymentData) => {
    return api.post(`/marketplace/acquire/${listingId}`, paymentData);
  },
  
  // Get user's purchased/subscribed agents
  getUserAcquiredAgents: () => {
    return api.get('/marketplace/acquired');
  },
  
  // Get user's published agents on the marketplace
  getUserPublishedAgents: () => {
    return api.get('/marketplace/published');
  },
  
  // Get featured or trending agents
  getFeaturedAgents: () => {
    return api.get('/marketplace/featured');
  },
  
  // Get agent categories
  getCategories: () => {
    return api.get('/marketplace/categories');
  },
  
  // Leave a review for an agent
  reviewAgent: (listingId, reviewData) => {
    return api.post(`/marketplace/review/${listingId}`, reviewData);
  },
  
  // Get reviews for an agent
  getAgentReviews: (listingId, page = 1, limit = 10) => {
    return api.get(`/marketplace/reviews/${listingId}?page=${page}&limit=${limit}`);
  }
};

export default marketplaceService;
