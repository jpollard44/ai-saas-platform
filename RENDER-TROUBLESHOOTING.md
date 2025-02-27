# Render Deployment Troubleshooting Guide

## Current Issue
The frontend at `https://ai-saas-platform-web.onrender.com` cannot access the backend API at `https://ai-saas-platform-api.onrender.com/api` due to CORS restrictions.

## Comprehensive Troubleshooting Steps

### 1. Verify Backend Service Status

First, check if the backend service is actually running:

1. **Check Render Dashboard**:
   - Go to your Render dashboard
   - Check if the backend service shows as "Live"
   - Look for any deployment errors in the logs

2. **Test API Directly**:
   ```bash
   curl -v https://ai-saas-platform-api.onrender.com/api/health
   ```
   
   If you get a 404 response, the service might not be running properly.

### 2. Check Environment Variables

Ensure these environment variables are set in your Render dashboard for the backend service:

```
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://[username]:[password]@pollardhub-prod.pvnew.mongodb.net/Astro?retryWrites=true&w=majority
JWT_SECRET=7e4520bf113711aff4138346b6857a1dbd7b4894428c627c823cdf23561326a5
JWT_EXPIRE=30d
FRONTEND_URL=https://ai-saas-platform-web.onrender.com

# CORS Configuration
CORS_ENABLED=true
CORS_ORIGIN=https://ai-saas-platform-web.onrender.com
CORS_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
```

### 3. Try Redeploying the Backend Service

Sometimes Render needs a fresh deployment:

1. Go to your Render dashboard
2. Select the backend service
3. Click "Manual Deploy" > "Deploy latest commit"
4. Wait for the deployment to complete
5. Check the logs for any errors

### 4. Test with CORS Proxy (Temporary Solution)

If you need a quick workaround while troubleshooting:

1. Run the CORS proxy locally:
   ```bash
   cd backend
   node cors-proxy.js
   ```

2. Update your frontend to use the proxy:
   - Create a `.env.local` file in the frontend directory
   - Add `REACT_APP_API_URL=http://localhost:8080/proxy`
   - Restart your frontend development server

3. Deploy the proxy to Render as a separate service if needed

### 5. Test with the CORS Test Tool

Use the included CORS test tool to diagnose issues:

1. Open `https://ai-saas-platform-web.onrender.com/cors-test.html`
2. Enter the API endpoint you want to test
3. Try different request types to see which ones fail

### 6. Check for Render-Specific Issues

Render has some platform-specific considerations:

1. **Service Region**: Ensure both frontend and backend are in the same region
2. **Service Type**: Web Services vs Static Sites have different behaviors
3. **Custom Domains**: If using custom domains, ensure they're properly configured
4. **Outbound IPs**: Check if your MongoDB Atlas has IP restrictions

### 7. Last Resort: Create New Services

If all else fails, try creating fresh services:

1. Create a new backend service on Render
2. Set all environment variables
3. Deploy the same code
4. Update the frontend to point to the new backend URL

## Common Solutions

### Solution 1: Explicit CORS Configuration

Make sure your server.js has this configuration:

```javascript
// Enable CORS with explicit configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS').split(','),
  allowedHeaders: (process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization').split(','),
  credentials: true
}));

// Handle OPTIONS preflight requests
app.options('*', cors());
```

### Solution 2: Use a CORS Proxy

If Render's CORS handling is problematic, deploy the cors-proxy.js as a separate service and route all API requests through it.

### Solution 3: Combine Frontend and Backend

Consider deploying the frontend and backend together as a single service to avoid CORS issues entirely.

## Testing Your Fix

After making changes:

1. Wait for Render to deploy the changes
2. Clear your browser cache
3. Try the CORS test tool again
4. Check the browser console for any errors
5. Verify API requests are working in your application

## Need More Help?

If you're still experiencing issues:

1. Check Render's status page: https://status.render.com/
2. Contact Render support with specific error logs
3. Consider temporarily moving to a different hosting provider to isolate if it's a Render-specific issue
