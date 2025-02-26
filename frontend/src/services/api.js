import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// User API services
export const userService = {
  register: (userData) => api.post('/users/register', userData),
  login: (userData) => api.post('/users/login', userData),
  getProfile: (userId) => api.get(`/users/profile/${userId}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
};

// Agent API services
export const agentService = {
  createAgent: (agentData) => api.post('/agents/create', agentData),
  getAgents: () => api.get('/agents'),
  getAgent: (agentId) => api.get(`/agents/${agentId}`),
  updateAgent: (agentId, agentData) => api.put(`/agents/${agentId}`, agentData),
  uploadData: (agentId, formData) => api.post(`/agents/${agentId}/upload-data`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  fineTuneAgent: (agentId) => api.post(`/agents/${agentId}/fine-tune`),
  generateApiKey: (agentId) => api.get(`/agents/${agentId}/api-key`),
  runAgent: (agentId, query, apiKey) => api.post(`/agents/${agentId}/run`, { query }, {
    headers: {
      'x-api-key': apiKey,
    },
  }),
};

// Marketplace API services
export const marketplaceService = {
  listAgent: (listingData) => api.post('/marketplace/list', listingData),
  getListings: (filters) => api.get('/marketplace/agents', { params: filters }),
  getListing: (listingId) => api.get(`/marketplace/agents/${listingId}`),
  updateListing: (listingId, listingData) => api.put(`/marketplace/agents/${listingId}`, listingData),
  deleteListing: (listingId) => api.delete(`/marketplace/agents/${listingId}`),
  createReview: (reviewData) => api.post('/marketplace/reviews', reviewData),
  getAgentReviews: (listingId) => api.get(`/marketplace/agents/${listingId}/reviews`),
  subscribeToAgent: (listingId) => api.post(`/marketplace/agents/${listingId}/subscribe`),
};

// Analytics API services
export const analyticsService = {
  getAgentAnalytics: (agentId) => api.get(`/analytics/${agentId}`),
  getDashboardAnalytics: () => api.get('/analytics/dashboard'),
};

// Community API services
export const communityService = {
  createPost: (postData) => api.post('/community/posts', postData),
  getPosts: (filters) => api.get('/community/posts', { params: filters }),
  getPost: (postId) => api.get(`/community/posts/${postId}`),
  updatePost: (postId, postData) => api.put(`/community/posts/${postId}`, postData),
  deletePost: (postId) => api.delete(`/community/posts/${postId}`),
  addComment: (postId, commentData) => api.post(`/community/posts/${postId}/comments`, commentData),
  shareTemplate: (templateData) => api.post('/community/templates', templateData),
  getTemplates: (filters) => api.get('/community/templates', { params: filters }),
  getTemplate: (templateId) => api.get(`/community/templates/${templateId}`),
};

export default api;
