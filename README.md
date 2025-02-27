# AI SaaS Platform

A comprehensive web platform for creating, deploying, and monetizing intelligent AI agents.

## Features

- **Agent Creation**: Build AI agents with different capabilities
- **Marketplace**: Buy, sell, and discover AI agents
- **User Dashboard**: Track your agents' performance
- **Analytics**: Get insights into how your agents are being used
- **Community**: Share experiences and knowledge with other users
- **Dark/Light Mode**: Toggle between themes for improved user experience
- **Responsive Design**: Works on all device sizes

## Technology Stack

### Frontend
- React.js
- React Router for navigation
- Context API for state management
- CSS with responsive design
- Dark/Light theme support

### Backend
- Node.js with Express
- MongoDB for database (configured with MongoDB Atlas)
- JWT for authentication
- RESTful API architecture
- Middleware for security and validation

### API Integrations
- OpenAI for AI capabilities
- Stripe for payment processing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB account (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/jpollard44/astro.git
cd ai-saas-platform
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Set up environment variables
Create a `.env` file in the backend directory with the following:
```
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
STRIPE_API_KEY=your_stripe_api_key
OPENAI_API_KEY=your_openai_api_key
```

4. Install frontend dependencies
```bash
cd ../frontend
npm install
```

5. Create frontend environment variables
Create a `.env` file in the frontend directory with:
```
REACT_APP_API_URL=http://localhost:5001/api
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm start
```

3. Visit `http://localhost:3000` in your browser

## Deployment

This project is configured for deployment on Render using MongoDB Atlas as the database provider.

### Render Deployment Steps

1. Push your code to GitHub
2. Create a new Web Service on Render
   - Connect your GitHub repository
   - Select the branch to deploy
   - Set the build command: `npm run build`
   - Set the start command: `npm start`
   - Select the appropriate instance type (Free tier works for testing)

3. Add Environment Variables in Render:
   - `NODE_ENV`: production
   - `PORT`: 10000 (Render will use this internally)
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret key
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `STRIPE_API_KEY`: Your Stripe API key

4. Deploy the service and wait for the build to complete

Your application will be available at the URL provided by Render (typically `https://your-app-name.onrender.com`).

## Database

The application uses MongoDB as its database. In production, we recommend MongoDB Atlas:

- Free tier available (512MB storage)
- Easy setup and scaling
- Reliable performance
- Automatic backups

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the AI capabilities
- The React community for excellent documentation and support
