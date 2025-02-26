# Deployment Guide for AI SaaS Platform

This document provides step-by-step instructions for deploying the AI SaaS Platform to Render using MongoDB Atlas as the database provider.

## MongoDB Atlas Setup

1. Create a free MongoDB Atlas account if you haven't already.
2. Create a new cluster (the free shared tier is sufficient to start).
3. Set up database access with a username and password.
4. Configure network access to allow connections from anywhere (for development) or specific IP addresses (for production).
5. Get your connection string from the Atlas dashboard.
6. Update the `MONGO_URI` in your environment variables with this connection string.

## Render Deployment

### Option 1: Using the Dashboard (Easiest)

1. Log in to your Render account.
2. Click on "New" and select "Blueprint" from the dropdown.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file and configure your services.
5. Add the following environment variables in the Render dashboard:
   - `JWT_SECRET`
   - `MONGO_URI`
   - `STRIPE_API_KEY`
   - `OPENAI_API_KEY`
6. Click "Apply" to deploy your services.

### Option 2: Manual Configuration

If you prefer to set up the services manually:

#### Backend API

1. Create a new Web Service on Render.
2. Connect your GitHub repository.
3. Configure the service:
   - Name: `ai-saas-platform-api`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
4. Add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5001`
   - `JWT_SECRET`: your secret key
   - `JWT_EXPIRE`: `30d`
   - `MONGO_URI`: your MongoDB Atlas connection string
   - `STRIPE_API_KEY`: your Stripe API key
   - `OPENAI_API_KEY`: your OpenAI API key
5. Deploy the service.

#### Frontend Web App

1. Create a new Static Site on Render.
2. Connect your GitHub repository.
3. Configure the site:
   - Name: `ai-saas-platform-web`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`
4. Add environment variables:
   - `REACT_APP_API_URL`: URL of your backend API (e.g., `https://ai-saas-platform-api.onrender.com/api`)
5. In the "Redirects/Rewrites" section, add a rule to handle client-side routing:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`
6. Deploy the site.

## Post-Deployment

1. Test your application by visiting the frontend URL.
2. Check the logs in Render to ensure both services are running correctly.
3. If you encounter any issues, review the error logs and make necessary adjustments.

## Custom Domain (Optional)

To use a custom domain:

1. In your Render dashboard, go to the service you want to add a domain to.
2. Navigate to the "Settings" tab.
3. Under "Custom Domains", add your domain.
4. Follow the DNS configuration instructions provided by Render.

## Continuous Deployment

By default, Render deploys automatically when you push changes to your GitHub repository. To disable this:

1. Go to your service settings.
2. Under "Auto-Deploy", select "No" for "Deploy on Push".

## Monitoring and Scaling

1. Render provides basic monitoring on the dashboard.
2. To scale your application, upgrade your plan and adjust the number of instances or instance size in the service settings.
