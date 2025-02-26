#!/bin/bash
# AI SaaS Platform Deployment Script

# Color variables
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AI SaaS Platform Deployment...${NC}"

# Navigate to the frontend directory
echo -e "${GREEN}Building frontend...${NC}"
cd frontend || { echo -e "${RED}Frontend directory not found!${NC}"; exit 1; }

# Install dependencies and build
npm install || { echo -e "${RED}Failed to install frontend dependencies!${NC}"; exit 1; }
npm run build || { echo -e "${RED}Failed to build frontend!${NC}"; exit 1; }

echo -e "${GREEN}Frontend built successfully!${NC}"

# Navigate to the backend directory
cd ../backend || { echo -e "${RED}Backend directory not found!${NC}"; exit 1; }

# Install dependencies
echo -e "${GREEN}Installing backend dependencies...${NC}"
npm install || { echo -e "${RED}Failed to install backend dependencies!${NC}"; exit 1; }

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}.env file not found in backend directory!${NC}"
    echo -e "Creating a sample .env file. Please update it with your actual credentials."
    cat > .env << EOL
PORT=5000
MONGO_URI=mongodb://your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
STRIPE_API_KEY=your_stripe_api_key
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
EOL
fi

echo -e "${GREEN}Deployment preparation complete!${NC}"
echo -e "${GREEN}To start the server in production mode, run:${NC}"
echo -e "cd backend && NODE_ENV=production npm start"

echo -e "${GREEN}For cloud deployment:${NC}"
echo -e "1. Commit all changes to your repository"
echo -e "2. Connect your repository to a cloud platform like Heroku, Vercel, or AWS"
echo -e "3. Configure environment variables on your cloud platform"
echo -e "4. Deploy following your cloud provider's instructions"
