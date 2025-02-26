#!/bin/bash

# Colors for console output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Preparing AI SaaS Platform for Render Deployment ===${NC}"

# Install required tools
if ! command -v curl &> /dev/null; then
    echo -e "${RED}curl is required but not installed. Please install curl and try again.${NC}"
    exit 1
fi

# Prepare the project
echo -e "${GREEN}Building the project...${NC}"

# Build the frontend
echo -e "${GREEN}Building frontend...${NC}"
cd frontend || { echo -e "${RED}Frontend directory not found!${NC}"; exit 1; }
npm install || { echo -e "${RED}Failed to install frontend dependencies!${NC}"; exit 1; }
npm run build || { echo -e "${RED}Failed to build frontend!${NC}"; exit 1; }
echo -e "${GREEN}Frontend build complete!${NC}"

# Return to project root
cd ..

# Build the backend
echo -e "${GREEN}Preparing backend...${NC}"
cd backend || { echo -e "${RED}Backend directory not found!${NC}"; exit 1; }
npm install || { echo -e "${RED}Failed to install backend dependencies!${NC}"; exit 1; }
echo -e "${GREEN}Backend preparation complete!${NC}"

# Return to project root
cd ..

# Check if all necessary files exist
if [ ! -f "render.yaml" ]; then
    echo -e "${RED}render.yaml not found!${NC}"
    exit 1
fi

echo -e "${GREEN}Project successfully prepared for deployment!${NC}"

# Verify environment variables
echo -e "${BLUE}=== Verification ===${NC}"
echo -e "${GREEN}Please ensure you have set the following environment variables in your Render dashboard:${NC}"
echo "- JWT_SECRET"
echo "- MONGO_URI"
echo "- STRIPE_API_KEY"
echo "- OPENAI_API_KEY"

# Instructions for deployment
echo -e "${BLUE}=== Deployment Instructions ===${NC}"
echo -e "1. Push your code to GitHub (if not already done)"
echo -e "   git add ."
echo -e "   git commit -m \"Prepare for Render deployment\""
echo -e "   git push origin main"
echo
echo -e "2. Go to your Render dashboard: https://dashboard.render.com"
echo -e "3. Click \"New\" and select \"Blueprint\""
echo -e "4. Connect your GitHub repository"
echo -e "5. Render will automatically use your render.yaml configuration"
echo -e "6. Add your environment variables in the Render dashboard when prompted"
echo -e "7. Click \"Apply\" to start the deployment"
echo
echo -e "${GREEN}Your deployment URLs will be provided in the Render dashboard once deployment is complete.${NC}"
echo -e "${GREEN}Typically, they'll be available at:${NC}"
echo -e "- Backend API: https://ai-saas-platform-api.onrender.com"
echo -e "- Frontend App: https://ai-saas-platform-web.onrender.com"
