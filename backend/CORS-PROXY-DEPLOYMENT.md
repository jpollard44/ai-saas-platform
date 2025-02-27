# CORS Proxy Deployment Guide

This guide explains how to deploy the CORS proxy as a separate service on Render to work around CORS issues.

## Local Testing

1. Run the CORS proxy locally:
   ```bash
   cd backend
   node cors-proxy.js
   ```

2. Open the test page in your browser:
   ```
   http://localhost:3000/proxy-test.html
   ```

3. Click the test buttons to verify the proxy is working.

## Deploying to Render

### Option 1: Using the Deployment Script (Recommended)

1. **Create a new Web Service on Render**

   - Go to your Render dashboard
   - Click "New" > "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: `ai-saas-platform-cors-proxy`
     - **Root Directory**: `backend`
     - **Build Command**: `chmod +x deploy-proxy.sh && ./deploy-proxy.sh`
     - **Start Command**: `node render-cors-proxy.js`
     - **Environment**: `Node`
     - **Plan**: Free (or higher if needed)
     - **Environment Variables**:
       - `PORT`: `10000`
       - `TARGET_API`: `https://ai-saas-platform-api.onrender.com/api`

2. **Deploy the Service**

   - Click "Create Web Service"
   - Wait for the deployment to complete

3. **Update Frontend to Use the Proxy**

   Once deployed, update your frontend environment variables:
   ```
   REACT_APP_API_URL=https://ai-saas-platform-cors-proxy.onrender.com/proxy
   ```

### Option 2: Manual Deployment

If the deployment script doesn't work for any reason, you can manually configure the service:

1. **Create a new Web Service on Render**

   - Go to your Render dashboard
   - Click "New" > "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: `ai-saas-platform-cors-proxy`
     - **Root Directory**: `backend`
     - **Build Command**: `cp package-proxy.json package.json && npm install --production`
     - **Start Command**: `node render-cors-proxy.js`
     - **Environment**: `Node`
     - **Plan**: Free (or higher if needed)
     - **Environment Variables**:
       - `PORT`: `10000`
       - `TARGET_API`: `https://ai-saas-platform-api.onrender.com/api`

2. **Deploy the service**

3. **Update Frontend to Use the Proxy**

   Once deployed, update your frontend environment variables:
   ```
   REACT_APP_API_URL=https://ai-saas-platform-cors-proxy.onrender.com/proxy
   ```

## Verifying the Deployment

1. Check if the proxy is running:
   ```
   https://ai-saas-platform-cors-proxy.onrender.com/health
   ```

2. Test a proxied request:
   ```
   https://ai-saas-platform-cors-proxy.onrender.com/proxy/health
   ```

## Troubleshooting

If you encounter issues:

1. Check the Render logs for the proxy service
2. Verify the TARGET_API environment variable is correct
3. Test with curl:
   ```bash
   curl -v https://ai-saas-platform-cors-proxy.onrender.com/health
   ```

## Security Considerations

This proxy forwards all requests and includes all headers, which could potentially expose sensitive information. For a production environment, consider:

1. Restricting which origins can access the proxy
2. Limiting which endpoints can be proxied
3. Adding rate limiting to prevent abuse

## Removing the Proxy

Once the main backend CORS issues are resolved:

1. Update the frontend to use the main API directly
2. Delete the proxy service from Render
