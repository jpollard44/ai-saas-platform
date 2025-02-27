// CORS Proxy for Render deployment
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 8080;

// Target API URL (default to the main backend API)
const TARGET_API = process.env.TARGET_API || 'https://ai-saas-platform-api.onrender.com/api';

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parse JSON bodies
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body));
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'CORS Proxy is running',
    targetApi: TARGET_API,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'CORS Proxy Server',
    usage: {
      health: '/health',
      proxy: '/proxy/[endpoint]'
    },
    targetApi: TARGET_API
  });
});

// Proxy all requests to the target API
app.all('/proxy/*', async (req, res) => {
  const targetPath = req.path.replace('/proxy/', '');
  const fullUrl = `${TARGET_API}/${targetPath}`;
  
  console.log(`Proxying request to: ${fullUrl}`);
  
  try {
    // Forward the request to the target API
    const response = await axios({
      method: req.method,
      url: fullUrl,
      headers: {
        ...req.headers,
        host: new URL(TARGET_API).host
      },
      data: req.body,
      validateStatus: () => true // Don't throw on error status codes
    });
    
    // Forward the response back to the client
    res.status(response.status);
    
    // Forward headers
    Object.entries(response.headers).forEach(([key, value]) => {
      // Skip headers that might cause issues
      if (!['content-length', 'connection', 'keep-alive', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.set(key, value);
      }
    });
    
    // Send response data
    res.send(response.data);
    
    console.log(`Proxy response: ${response.status}`);
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Error status: ${error.response.status}`);
      console.error('Error data:', error.response.data);
      
      res.status(error.response.status).json({
        error: 'Proxy error',
        message: error.message,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received');
      
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'No response from target server',
        details: error.message
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`CORS Proxy running on port ${PORT}`);
  console.log(`Target API: ${TARGET_API}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Proxy example: http://localhost:${PORT}/proxy/agents`);
});
