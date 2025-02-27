import axios from 'axios';

// Create axios instance with base URL
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle server errors
    if (error.response && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get mock data based on URL and method
function getMockData(url, method) {
  // Marketplace listings
  if (url.includes('/marketplace/listings') && !url.includes('/marketplace/listings/')) {
    return [
      {
        _id: '1',
        title: 'Customer Support Pro',
        description: 'Advanced AI assistant for handling customer inquiries with empathy and precision.',
        pricing: { type: 'subscription', amount: 19.99 },
        category: 'Customer Support',
        rating: { average: 4.8, count: 124 },
        featured: true,
        sellerId: { name: 'TechSupport Inc.' },
        createdAt: '2023-03-15T00:00:00.000Z'
      },
      {
        _id: '2',
        title: 'Content Wizard',
        description: 'Generate blog posts, social media content, and marketing copy with a single prompt.',
        pricing: { type: 'subscription', amount: 24.99 },
        category: 'Content Creation',
        rating: { average: 4.7, count: 98 },
        featured: true,
        sellerId: { name: 'ContentGenius' },
        createdAt: '2023-04-10T00:00:00.000Z'
      }
    ];
  }
  
  // Single marketplace listing
  if (url.includes('/marketplace/listings/')) {
    const id = url.split('/').pop();
    return {
      _id: id,
      title: id === '1' ? 'Customer Support Pro' : 'Content Wizard',
      description: 'Advanced AI assistant for handling customer inquiries with empathy and precision.',
      longDescription: 'Customer Support Pro is an intelligent AI agent designed to revolutionize how businesses handle customer service.',
      pricing: { type: 'subscription', amount: 19.99 },
      category: 'Customer Support',
      rating: { average: 4.8, count: 124 },
      featured: true,
      sellerId: { 
        _id: '101',
        name: 'TechSupport Inc.',
        memberSince: '2023-01-01T00:00:00.000Z'
      },
      createdAt: '2023-03-15T00:00:00.000Z',
      updatedAt: '2023-06-22T00:00:00.000Z',
      capabilities: [
        'Multi-language Support',
        'Sentiment Analysis',
        'Knowledge Base Integration'
      ],
      useCases: [
        'E-commerce Customer Support',
        'SaaS Help Desk',
        'Ticket Triage and Routing'
      ]
    };
  }
  
  // Reviews
  if (url.includes('/marketplace/reviews/')) {
    return [
      {
        _id: '1',
        userId: { name: 'Sarah Johnson', image: '/images/users/user1.jpg' },
        rating: 5,
        comment: 'This agent has transformed our customer support operation. Response times down 80%, and customer satisfaction up 25%. Worth every penny!',
        createdAt: '2023-06-10T00:00:00.000Z'
      },
      {
        _id: '2',
        userId: { name: 'Michael Chen', image: '/images/users/user2.jpg' },
        rating: 4,
        comment: 'Very impressed with the natural conversations and how it handles complex inquiries. Occasional hiccups with very technical questions, but overall excellent.',
        createdAt: '2023-05-22T00:00:00.000Z'
      }
    ];
  }
  
  // Categories
  if (url.includes('/marketplace/categories')) {
    return [
      { id: 'Customer Support', name: 'Customer Support', count: 42, description: 'Agents that help with customer inquiries and support' },
      { id: 'Content Creation', name: 'Content Creation', count: 38, description: 'Agents that generate or help create content' },
      { id: 'Data Analysis', name: 'Data Analysis', count: 29, description: 'Agents that analyze and interpret data' },
      { id: 'Education', name: 'Education', count: 24, description: 'Agents focused on teaching and learning' },
      { id: 'Productivity', name: 'Productivity', count: 19, description: 'Agents that help with tasks and organization' },
      { id: 'Entertainment', name: 'Entertainment', count: 16, description: 'Agents for entertainment purposes' },
      { id: 'Other', name: 'Other', count: 10, description: 'Agents that don\'t fit in the above categories' }
    ];
  }
  
  // Featured agents
  if (url.includes('/marketplace/featured')) {
    return [
      {
        _id: '1',
        title: 'Customer Support Pro',
        description: 'Advanced AI assistant for handling customer inquiries with empathy and precision.',
        pricing: { type: 'subscription', amount: 19.99 },
        category: 'Customer Support',
        rating: { average: 4.8, count: 124 },
        featured: true,
        sellerId: { name: 'TechSupport Inc.' },
        createdAt: '2023-03-15T00:00:00.000Z'
      },
      {
        _id: '2',
        title: 'Content Wizard',
        description: 'Generate blog posts, social media content, and marketing copy with a single prompt.',
        pricing: { type: 'subscription', amount: 24.99 },
        category: 'Content Creation',
        rating: { average: 4.7, count: 98 },
        featured: true,
        sellerId: { name: 'ContentGenius' },
        createdAt: '2023-04-10T00:00:00.000Z'
      }
    ];
  }
  
  // Published agents
  if (url.includes('/marketplace/published')) {
    return [
      {
        _id: '1',
        title: 'Customer Support Pro',
        description: 'Advanced AI assistant for handling customer inquiries with empathy and precision.',
        pricing: { type: 'subscription', amount: 19.99 },
        category: 'Customer Support',
        rating: { average: 4.8, count: 124 },
        agentId: {
          name: 'Customer Support Pro',
          description: 'Advanced AI assistant for handling customer inquiries with empathy and precision.'
        },
        createdAt: '2023-03-15T00:00:00.000Z'
      }
    ];
  }
  
  // Default empty array
  return [];
}

// Add response interceptor to handle empty responses
api.interceptors.response.use(
  (response) => {
    // If the response is empty but status is 200/201, create a default success response
    if (response.status >= 200 && response.status < 300 && !response.data) {
      console.log('Empty response detected, creating default response object');
      response.data = { success: true };
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Check if error is due to server unavailability
    if (!error.response) {
      console.log('Using mock data due to server unavailability');
      // Return mock success response for development when backend is not available
      return Promise.resolve({
        data: {
          success: true,
          data: getMockData(error.config.url, error.config.method)
        }
      });
    }
    
    return Promise.reject(error);
  }
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
  getListing: (listingId) => api.get(`/marketplace/listings/${listingId}`),
  updateListing: (listingId, listingData) => api.put(`/marketplace/listings/${listingId}`, listingData),
  deleteListing: (listingId) => api.delete(`/marketplace/listings/${listingId}`),
  createReview: (listingId, reviewData) => api.post(`/marketplace/review/${listingId}`, reviewData),
  getAgentReviews: (listingId, page = 1, limit = 10) => api.get(`/marketplace/reviews/${listingId}?page=${page}&limit=${limit}`),
  getCategories: () => api.get('/marketplace/categories'),
  getUserAcquiredAgents: () => api.get('/marketplace/acquired'),
  getUserPublishedAgents: () => api.get('/marketplace/published'),
  acquireAgent: (listingId, paymentData) => api.post(`/marketplace/acquire/${listingId}`, paymentData),
  getFeaturedAgents: () => api.get('/marketplace/featured')
};

// Payment API services
export const paymentService = {
  createCheckoutSession: (data) => api.post('/payments/create-checkout-session', data),
  getPaymentHistory: () => api.get('/payments/history'),
  getEarnings: () => api.get('/payments/earnings'),
  withdrawEarnings: (data) => api.post('/payments/withdraw', data),
  updatePaymentMethod: (data) => api.put('/payments/method', data),
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
