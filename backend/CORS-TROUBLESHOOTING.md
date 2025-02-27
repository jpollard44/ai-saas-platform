# CORS Troubleshooting Guide

## Current Issue
The frontend at `https://ai-saas-platform-web.onrender.com` cannot access the backend API at `https://ai-saas-platform-api.onrender.com/api` due to CORS restrictions.

Error message:
```
Access to XMLHttpRequest at 'https://ai-saas-platform-api.onrender.com/api/agents' from origin 'https://ai-saas-platform-web.onrender.com' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Troubleshooting Steps

### 1. Verify Backend Service is Running

```bash
# Check if the backend is responding
curl -v https://ai-saas-platform-api.onrender.com/api/health
```

If you get a 404 Not Found, the backend service might not be running properly.

### 2. Test CORS Preflight Request

```bash
# Test OPTIONS request (preflight)
curl -X OPTIONS -v https://ai-saas-platform-api.onrender.com/api/agents \
  -H "Origin: https://ai-saas-platform-web.onrender.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization"
```

A successful response should include:
- Status code 200 or 204
- `Access-Control-Allow-Origin` header
- `Access-Control-Allow-Methods` header
- `Access-Control-Allow-Headers` header

### 3. Check Render Environment Variables

Ensure these environment variables are set in your Render dashboard:

```
CORS_ENABLED=true
CORS_ORIGIN=https://ai-saas-platform-web.onrender.com
CORS_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
```

### 4. Test with a Simple Server

If the main server is having issues, you can deploy the `test-server.js` to diagnose CORS problems:

```bash
# Run locally
node test-server.js

# Test local server
curl -v http://localhost:5001/api/health
```

### 5. Render-Specific Checks

1. Make sure both services (frontend and backend) are in the same region
2. Check if there are any Render-specific proxy settings interfering with CORS
3. Verify that the backend service is actually running (check logs in Render dashboard)
4. Try restarting the backend service in Render

### 6. Last Resort Options

If all else fails, consider these options:

1. **CORS Proxy**: Use a CORS proxy service temporarily
2. **Serverless Functions**: Create a serverless function to proxy requests
3. **Redeploy**: Create a new backend service on Render and point the frontend to it

## Common CORS Solutions

1. **Proper Headers**: Ensure these headers are sent with every response:
   ```
   Access-Control-Allow-Origin: https://ai-saas-platform-web.onrender.com
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization
   ```

2. **Handle OPTIONS**: Always respond to OPTIONS requests with a 200 status

3. **Environment Variables**: Use environment variables for CORS configuration

4. **Middleware Order**: Make sure CORS middleware is applied before route handlers
