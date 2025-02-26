#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== AI SaaS Platform Frontend Deployment ===${NC}"

# Check for build essentials
echo -e "${GREEN}Checking build requirements...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Node.js and npm are required but not installed.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install || { echo -e "${RED}Failed to install dependencies!${NC}"; exit 1; }

# Create production build
echo -e "${GREEN}Creating production build...${NC}"
npm run build || { echo -e "${RED}Build failed!${NC}"; exit 1; }

echo -e "${GREEN}Production build created successfully!${NC}"
echo -e "${BLUE}=== Deployment steps for different platforms ===${NC}"

echo -e "${GREEN}For Netlify deployment:${NC}"
echo -e "1. Install Netlify CLI: npm install -g netlify-cli"
echo -e "2. Login to Netlify: netlify login"
echo -e "3. Initialize site: netlify init"
echo -e "4. Deploy: netlify deploy --prod"

echo -e "${GREEN}For Vercel deployment:${NC}"
echo -e "1. Install Vercel CLI: npm install -g vercel"
echo -e "2. Login to Vercel: vercel login"
echo -e "3. Deploy: vercel --prod"

echo -e "${GREEN}For traditional hosting:${NC}"
echo -e "Upload the contents of the build folder to your web server"
echo -e "Ensure all routes redirect to index.html for React Router to work"

echo -e "${BLUE}=== Additional tips ===${NC}"
echo -e "- Make sure your backend API URL is correctly set for production"
echo -e "- Configure environment variables on your hosting platform if needed"
echo -e "- Set up custom domain and SSL if required"
