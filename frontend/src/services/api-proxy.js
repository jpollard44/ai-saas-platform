// api-proxy.js - Drop-in replacement for api.js that uses the CORS proxy
import axios from 'axios';

// Create axios instance with base URL pointing to our CORS proxy
const PROXY_URL = 'http://localhost:8080/proxy';
console.log('Using CORS proxy at:', PROXY_URL);

const api = axios.create({
  baseURL: PROXY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    console.log(`API Request via proxy: ${config.method.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header added with token');
    } else {
      console.log('No token found in localStorage');
    }
    
    if (config.data && typeof config.data === 'object') {
      console.log('Request payload:', JSON.stringify(config.data));
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle responses
api.interceptors.response.use(
  (response) => {
    console.log(`API Response via proxy: ${response.status} from ${response.config.url}`);
    
    // If the response is empty but status is 200/201, create a default success response
    if (response.status >= 200 && response.status < 300 && !response.data) {
      console.log('Empty response detected, creating default response object');
      response.data = { success: true };
    }
    
    // Log response data for debugging
    if (response.data) {
      console.log('Response data:', JSON.stringify(response.data));
    }
    
    return response;
  },
  (error) => {
    // Handle error responses
    console.error('API Error via proxy:', error);
    
    // Check if the error has a response
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Error response status: ${error.response.status} from ${error.config?.url}`);
      console.error('Error response data:', JSON.stringify(error.response.data));
      
      // Handle authentication errors
      if (error.response.status === 401) {
        console.error('Authentication error - redirecting to login');
        // Clear token if it exists
        localStorage.removeItem('token');
        
        // Only redirect if we're in a browser environment and not in a test
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request - no response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
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
  verifyToken: () => api.get('/users/verify-token'),
};

// Agent API services
export const agentService = {
  createAgent: (agentData) => api.post('/agents', agentData),
  getAgents: () => api.get('/agents'),
  getAgent: (agentId) => api.get(`/agents/${agentId}`),
  updateAgent: (agentId, agentData) => api.put(`/agents/${agentId}`, agentData),
  deleteAgent: (agentId) => api.delete(`/agents/${agentId}`),
};

// Export other services as needed...

export default api;
