# Deploying to Render

This guide will walk you through deploying the Astro AI SaaS Platform to Render.

## Prerequisites

1. A [Render](https://render.com/) account
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account with a database set up
3. Your GitHub repository with the latest code pushed

## Deployment Steps

### 1. Set up MongoDB Atlas

1. Create a cluster in MongoDB Atlas (the free tier is sufficient for getting started)
2. Create a database user with read/write permissions
3. Whitelist all IP addresses (0.0.0.0/0) or just Render's IPs
4. Get your connection string from MongoDB Atlas (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`)

### 2. Deploy to Render

1. Log in to your Render account
2. Click on "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: astro-ai-saas-platform (or your preferred name)
   - **Environment**: Node
   - **Region**: Choose the region closest to your users
   - **Branch**: main (or your deployment branch)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or select a paid plan for production use)

5. Add the following environment variables:
   - `NODE_ENV`: production
   - `PORT`: 10000 (Render will automatically assign the actual port)
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string for JWT token generation
   - `JWT_EXPIRE`: 30d
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `STRIPE_API_KEY`: Your Stripe API key

6. Click "Create Web Service"

Render will automatically build and deploy your application. Once the deployment is complete, you can access your application at the URL provided by Render (typically `https://your-app-name.onrender.com`).

## Troubleshooting

If you encounter any issues during deployment, check the following:

1. **Build Failures**: Check the build logs in Render for any errors
2. **Connection Issues**: Verify that your MongoDB Atlas connection string is correct and that your IP is whitelisted
3. **Environment Variables**: Make sure all required environment variables are set correctly
4. **Logs**: Check the logs in Render for any runtime errors

## Updating Your Deployment

To update your deployment, simply push changes to your GitHub repository. Render will automatically detect the changes and redeploy your application.
