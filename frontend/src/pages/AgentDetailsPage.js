import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AgentDetailsPage.css';

// Mock data for initial development
const mockAgent = {
  id: 1,
  name: 'Customer Support Pro',
  description: 'Advanced AI assistant for handling customer inquiries with empathy and precision.',
  longDescription: `
    Customer Support Pro is an intelligent AI agent designed to revolutionize how businesses handle customer service. 
    
    Using advanced natural language processing and sentiment analysis, this agent can:
    
    - Understand and respond to complex customer inquiries
    - Detect customer emotions and adapt tone accordingly
    - Handle multiple languages with native-level fluency
    - Escalate complex issues to human agents when necessary
    - Learn from each interaction to continuously improve
    
    Perfect for e-commerce, SaaS, and service businesses looking to scale their customer support operations without sacrificing quality.
  `,
  creator: { 
    id: 101, 
    name: 'TechSupport Inc.',
    image: '/images/creators/techsupport.jpg',
    memberSince: 'January 2023',
    agentCount: 5 
  },
  category: 'customer-service',
  rating: 4.8,
  reviewCount: 124,
  pricing: { type: 'subscription', amount: 19.99 },
  image: '/images/agents/customer-support.jpg',
  featured: true,
  createdAt: '2023-03-15',
  updatedAt: '2023-06-22',
  capabilities: [
    'Multi-language Support',
    'Sentiment Analysis',
    'Knowledge Base Integration',
    'Smart Escalation',
    'Analytics Dashboard'
  ],
  useCases: [
    'E-commerce Customer Support',
    'SaaS Help Desk',
    'Ticket Triage and Routing',
    'Customer Onboarding'
  ],
  monthlyUsers: 1250,
  reviews: [
    {
      id: 1,
      user: { id: 201, name: 'Sarah Johnson', image: '/images/users/user1.jpg' },
      rating: 5,
      date: '2023-06-10',
      content: 'This agent has transformed our customer support operation. Response times down 80%, and customer satisfaction up 25%. Worth every penny!'
    },
    {
      id: 2,
      user: { id: 202, name: 'Michael Chen', image: '/images/users/user2.jpg' },
      rating: 4,
      date: '2023-05-22',
      content: 'Very impressed with the natural conversations and how it handles complex inquiries. Occasional hiccups with very technical questions, but overall excellent.'
    },
    {
      id: 3,
      user: { id: 203, name: 'Emma Davis', image: '/images/users/user3.jpg' },
      rating: 5,
      date: '2023-05-15',
      content: 'We integrated this with our existing knowledge base and the results were immediate. Our team now focuses on high-value interactions while the AI handles the routine stuff.'
    }
  ]
};

const AgentDetailsPage = () => {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Replace with actual API calls when backend is ready
    const fetchAgentDetails = async () => {
      try {
        // Simulate API delay
        setTimeout(() => {
          setAgent(mockAgent);
          setLoading(false);
        }, 1000);
        
        // When API is ready:
        // const agentData = await marketplaceService.getAgentById(id);
        // setAgent(agentData);
      } catch (error) {
        console.error('Error fetching agent details:', error);
        setLoading(false);
      }
    };

    fetchAgentDetails();
  }, [id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSubscribe = async () => {
    // This will be replaced with actual subscription logic
    console.log('Subscribe to agent:', agent?.id);
    
    // When API is ready:
    // await marketplaceService.subscribeToAgent(agent.id);
  };

  if (loading) {
    return <div className="loading-container">Loading agent details...</div>;
  }

  if (!agent) {
    return (
      <div className="agent-details-error">
        <h2>Agent Not Found</h2>
        <p>The agent you're looking for doesn't exist or has been removed.</p>
        <Link to="/marketplace" className="btn btn-primary">Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="agent-details-container">
      <div className="agent-details-header">
        <div className="agent-details-hero">
          <div className="agent-details-image">
            <img src={agent.image || '/images/agent-placeholder.png'} alt={agent.name} />
          </div>
          <div className="agent-details-info">
            <h1>{agent.name}</h1>
            <p className="agent-details-description">{agent.description}</p>
            
            <div className="agent-meta-details">
              <div className="agent-meta-item">
                <i className="fas fa-star"></i>
                <span>{agent.rating} ({agent.reviewCount} reviews)</span>
              </div>
              <div className="agent-meta-item">
                <i className="fas fa-users"></i>
                <span>{agent.monthlyUsers.toLocaleString()} monthly users</span>
              </div>
              <div className="agent-meta-item">
                <i className="fas fa-calendar-alt"></i>
                <span>Updated {new Date(agent.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="agent-creator-badge">
              <img 
                src={agent.creator.image || '/images/creator-placeholder.png'} 
                alt={agent.creator.name} 
                className="agent-creator-image" 
              />
              <div className="agent-creator-info">
                <p className="agent-creator-name">By {agent.creator.name}</p>
                <p className="agent-creator-details">
                  {agent.creator.agentCount} agents · Member since {agent.creator.memberSince}
                </p>
              </div>
            </div>
            
            <div className="agent-pricing">
              {agent.pricing.type === 'free' ? (
                <div className="pricing-details">
                  <span className="pricing-amount free">Free</span>
                </div>
              ) : agent.pricing.type === 'one-time' ? (
                <div className="pricing-details">
                  <span className="pricing-amount">${agent.pricing.amount}</span>
                  <span className="pricing-type">One-time payment</span>
                </div>
              ) : (
                <div className="pricing-details">
                  <span className="pricing-amount">${agent.pricing.amount}</span>
                  <span className="pricing-type">per month</span>
                </div>
              )}
              
              {isAuthenticated ? (
                <button className="btn btn-primary btn-lg" onClick={handleSubscribe}>
                  {agent.pricing.type === 'free' ? 'Add to My Agents' : 'Subscribe Now'}
                </button>
              ) : (
                <Link to="/login" className="btn btn-primary btn-lg">Log in to Subscribe</Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="agent-details-content">
        <div className="agent-details-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => handleTabChange('reviews')}
          >
            Reviews ({agent.reviewCount})
          </button>
          <button 
            className={`tab-button ${activeTab === 'creator' ? 'active' : ''}`}
            onClick={() => handleTabChange('creator')}
          >
            About Creator
          </button>
        </div>
        
        <div className="agent-details-tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="overview-section">
                <h2>About this Agent</h2>
                <div className="long-description">
                  {agent.longDescription.split('\n').map((paragraph, index) => (
                    paragraph.trim() ? <p key={index}>{paragraph.trim()}</p> : <br key={index} />
                  ))}
                </div>
              </div>
              
              <div className="overview-grid">
                <div className="overview-section capabilities">
                  <h3>Capabilities</h3>
                  <ul className="capabilities-list">
                    {agent.capabilities.map((capability, index) => (
                      <li key={index} className="capability-item">
                        <i className="fas fa-check"></i>
                        <span>{capability}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="overview-section use-cases">
                  <h3>Use Cases</h3>
                  <ul className="use-cases-list">
                    {agent.useCases.map((useCase, index) => (
                      <li key={index} className="use-case-item">
                        <i className="fas fa-angle-right"></i>
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="overview-section recent-reviews">
                <div className="section-header-with-link">
                  <h3>Recent Reviews</h3>
                  <button className="link-button" onClick={() => handleTabChange('reviews')}>
                    View all reviews
                  </button>
                </div>
                <div className="mini-reviews">
                  {agent.reviews.slice(0, 2).map(review => (
                    <div key={review.id} className="mini-review">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <img 
                            src={review.user.image || '/images/user-placeholder.png'} 
                            alt={review.user.name} 
                            className="reviewer-image" 
                          />
                          <div>
                            <p className="reviewer-name">{review.user.name}</p>
                            <p className="review-date">{new Date(review.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="review-content">{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              <div className="reviews-summary">
                <div className="rating-overview">
                  <div className="overall-rating">
                    <p className="rating-number">{agent.rating}</p>
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`star ${i < Math.floor(agent.rating) ? 'filled' : ''}`}>★</span>
                      ))}
                    </div>
                    <p className="total-reviews">{agent.reviewCount} reviews</p>
                  </div>
                </div>
                
                {isAuthenticated && (
                  <div className="write-review">
                    <h3>Write a Review</h3>
                    <button className="btn btn-outline">Write Review</button>
                  </div>
                )}
              </div>
              
              <div className="reviews-list">
                {(showAllReviews ? agent.reviews : agent.reviews.slice(0, 5)).map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <img 
                          src={review.user.image || '/images/user-placeholder.png'} 
                          alt={review.user.name} 
                          className="reviewer-image" 
                        />
                        <div>
                          <p className="reviewer-name">{review.user.name}</p>
                          <p className="review-date">{new Date(review.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="review-content">{review.content}</p>
                  </div>
                ))}
                
                {!showAllReviews && agent.reviews.length > 5 && (
                  <button 
                    className="btn btn-outline btn-block"
                    onClick={() => setShowAllReviews(true)}
                  >
                    Show All Reviews
                  </button>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'creator' && (
            <div className="creator-tab">
              <div className="creator-profile">
                <div className="creator-header">
                  <img 
                    src={agent.creator.image || '/images/creator-placeholder.png'} 
                    alt={agent.creator.name} 
                    className="creator-profile-image" 
                  />
                  <div className="creator-profile-info">
                    <h2>{agent.creator.name}</h2>
                    <p className="creator-stats">
                      <span><i className="fas fa-robot"></i> {agent.creator.agentCount} agents</span>
                      <span><i className="fas fa-calendar-alt"></i> Member since {agent.creator.memberSince}</span>
                    </p>
                  </div>
                </div>
                
                <div className="creator-agents">
                  <h3>Other Agents by this Creator</h3>
                  <div className="mini-agents-grid">
                    <div className="mini-agent-card">
                      <img src="/images/agents/data-insights.jpg" alt="Data Insights" />
                      <div className="mini-agent-content">
                        <h4>Data Insights</h4>
                        <p className="mini-agent-description">
                          Transform raw data into actionable insights with natural language queries.
                        </p>
                        <div className="mini-agent-price">$29.99/mo</div>
                      </div>
                    </div>
                    <div className="mini-agent-card">
                      <img src="/images/agents/email-composer.jpg" alt="Email Composer" />
                      <div className="mini-agent-content">
                        <h4>Email Composer</h4>
                        <p className="mini-agent-description">
                          Draft perfect emails for any situation with the right tone and content.
                        </p>
                        <div className="mini-agent-price">Free</div>
                      </div>
                    </div>
                  </div>
                  <Link to={`/marketplace?creator=${agent.creator.id}`} className="btn btn-outline">
                    View All Agents by this Creator
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDetailsPage;
