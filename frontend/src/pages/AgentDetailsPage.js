import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { agentService, paymentService, marketplaceService } from '../services/api';
import './AgentDetailsPage.css';

const AgentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setLoading(true);
        const response = await marketplaceService.getListing(id);
        
        if (response.data && response.data.success) {
          setAgent(response.data.data);
        } else {
          setError('Failed to load agent details');
        }
      } catch (err) {
        console.error('Error fetching agent details:', err);
        setError('An error occurred while fetching agent details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAgentDetails();
    }
  }, [id]);

  const handlePurchase = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/marketplace/${id}` } });
      return;
    }

    try {
      setPaymentProcessing(true);
      
      // Check if the agent is free
      const isFree = agent.pricing ? 
        agent.pricing.type === 'free' : 
        (agent.price === 0 || agent.price === undefined);
      
      const response = await paymentService.createCheckoutSession({
        agentId: id,
        successUrl: `${window.location.origin}/dashboard`,
        cancelUrl: `${window.location.origin}/marketplace/${id}`
      });
      
      if (response.data && response.data.success) {
        if (response.data.isFree) {
          // For free agents, redirect to dashboard immediately
          navigate('/dashboard');
        } else if (response.data.url) {
          // For paid agents, redirect to Stripe checkout
          window.location.href = response.data.url;
        } else {
          alert('Failed to process request');
        }
      } else {
        alert('Failed to initiate checkout process');
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      alert('An error occurred during the checkout process');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleTryDemo = async () => {
    try {
      // Navigate to the chat interface with this agent
      navigate(`/chat/${id}`);
    } catch (err) {
      console.error('Error starting demo:', err);
      alert('Failed to start demo');
    }
  };

  const isOwner = currentUser && agent && (currentUser.id === agent.createdBy || currentUser.id === agent.sellerId);
  const hasSubscribed = currentUser && agent && agent.subscribers?.includes(currentUser.id);

  if (loading) {
    return <div className="loading-container">Loading agent details...</div>;
  }

  if (error || !agent) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || 'Failed to load agent details'}</p>
        <Link to="/marketplace" className="btn btn-primary">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="agent-details-container">
      <div className="agent-details-header">
        <div className="agent-details-header-content">
          <div className="agent-details-image">
            {agent.imageUrl ? (
              <img src={agent.imageUrl} alt={agent.title || agent.name} />
            ) : (
              <div className="agent-image-placeholder">
                {(agent.title || agent.name || '').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="agent-details-info">
            <h1>{agent.title || agent.name}</h1>
            <p className="agent-details-description">{agent.description}</p>
            
            <div className="agent-details-meta">
              <span className="agent-details-category">{agent.category}</span>
              <span className="agent-details-rating">
                ★ {agent.rating && typeof agent.rating === 'object' ? agent.rating.average : agent.rating || '0.0'} 
                ({agent.rating && typeof agent.rating === 'object' ? agent.rating.count : agent.reviewCount || 0} reviews)
              </span>
              <span className="agent-details-subscribers">
                {agent.subscribers?.length || 0} subscribers
              </span>
            </div>
            
            <div className="agent-details-creator">
              <p>Created by: <Link to={`/profile/${agent.createdBy || agent.sellerId}`}>
                {agent.creatorName || (agent.sellerId && agent.sellerId.name) || 'Unknown'}
              </Link></p>
              <p>Last updated: {new Date(agent.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="agent-details-actions">
            <div className="agent-details-price">
              {agent.pricing ? (
                agent.pricing.type !== 'free' ? (
                  <span>${agent.pricing.amount.toFixed(2)}</span>
                ) : (
                  <span>Free</span>
                )
              ) : agent.price > 0 ? (
                <span>${agent.price.toFixed(2)}</span>
              ) : (
                <span>Free</span>
              )}
            </div>
            
            {isOwner ? (
              <div className="owner-actions">
                <Link to={`/agents/${id}/edit`} className="btn btn-secondary">
                  Edit Agent
                </Link>
                <Link to={`/agents/${id}/analytics`} className="btn btn-outline">
                  View Analytics
                </Link>
              </div>
            ) : (
              <div className="user-actions">
                {hasSubscribed ? (
                  <button 
                    className="btn btn-primary"
                    onClick={handleTryDemo}
                  >
                    Launch Agent
                  </button>
                ) : (
                  <>
                    <button 
                      className="btn btn-primary"
                      onClick={handlePurchase}
                      disabled={paymentProcessing}
                    >
                      {paymentProcessing ? 'Processing...' : 
                        agent.pricing ? 
                          agent.pricing.type !== 'free' ? 'Subscribe' : 'Get for Free' 
                        : agent.price > 0 ? 'Subscribe' : 'Get for Free'}
                    </button>
                    
                    {agent.hasDemo && (
                      <button 
                        className="btn btn-outline"
                        onClick={handleTryDemo}
                      >
                        Try Demo
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="agent-details-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'capabilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('capabilities')}
        >
          Capabilities
        </button>
        <button 
          className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
        <button 
          className={`tab-button ${activeTab === 'usage' ? 'active' : ''}`}
          onClick={() => setActiveTab('usage')}
        >
          Usage Guide
        </button>
      </div>
      
      <div className="agent-details-content">
        {activeTab === 'overview' && (
          <div className="agent-details-overview">
            <div className="agent-details-section">
              <h2>About this Agent</h2>
              <div className="agent-details-long-description">
                {agent.longDescription ? (
                  <div dangerouslySetInnerHTML={{ __html: agent.longDescription }} />
                ) : (
                  <p>{agent.description}</p>
                )}
              </div>
            </div>
            
            <div className="agent-details-section">
              <h2>Key Features</h2>
              <ul className="agent-features-list">
                {agent.features && agent.features.length > 0 ? (
                  agent.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span className="feature-text">{feature}</span>
                    </li>
                  ))
                ) : (
                  <p>No features listed for this agent.</p>
                )}
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'capabilities' && (
          <div className="agent-details-capabilities">
            <div className="agent-details-section">
              <h2>Technical Specifications</h2>
              <div className="specs-grid">
                <div className="spec-item">
                  <h3>Model</h3>
                  <p>{agent.modelId || 'Custom Model'}</p>
                </div>
                <div className="spec-item">
                  <h3>Response Time</h3>
                  <p>{agent.responseTime || 'Variable'}</p>
                </div>
                <div className="spec-item">
                  <h3>API Access</h3>
                  <p>{agent.hasApiAccess ? 'Available' : 'Not Available'}</p>
                </div>
                <div className="spec-item">
                  <h3>Data Processing</h3>
                  <p>{agent.dataProcessingCapabilities || 'Standard'}</p>
                </div>
              </div>
            </div>
            
            <div className="agent-details-section">
              <h2>Capabilities</h2>
              <div className="capabilities-list">
                {agent.capabilities && agent.capabilities.length > 0 ? (
                  agent.capabilities.map((capability, index) => (
                    <div key={index} className="capability-item">
                      <h3>{capability.name}</h3>
                      <p>{capability.description}</p>
                    </div>
                  ))
                ) : (
                  <p>No specific capabilities listed for this agent.</p>
                )}
              </div>
            </div>
            
            <div className="agent-details-section">
              <h2>Limitations</h2>
              <ul className="limitations-list">
                {agent.limitations && agent.limitations.length > 0 ? (
                  agent.limitations.map((limitation, index) => (
                    <li key={index}>{limitation}</li>
                  ))
                ) : (
                  <p>No specific limitations listed for this agent.</p>
                )}
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'reviews' && (
          <div className="agent-details-reviews">
            <div className="agent-details-section">
              <div className="reviews-header">
                <h2>User Reviews</h2>
                {currentUser && hasSubscribed && (
                  <button className="btn btn-outline">Write a Review</button>
                )}
              </div>
              
              <div className="reviews-summary">
                <div className="overall-rating">
                  <span className="rating-large">{agent.rating && typeof agent.rating === 'object' ? agent.rating.average : agent.rating || '0.0'}</span>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={star <= Math.round(agent.rating && typeof agent.rating === 'object' ? agent.rating.average : agent.rating || 0) ? 'star filled' : 'star'}>★</span>
                    ))}
                  </div>
                  <span className="rating-count">Based on {agent.rating && typeof agent.rating === 'object' ? agent.rating.count : agent.reviewCount || 0} reviews</span>
                </div>
                
                <div className="rating-breakdown">
                  {agent.ratingBreakdown ? (
                    Object.entries(agent.ratingBreakdown)
                      .sort((a, b) => b[0] - a[0])
                      .map(([rating, percentage]) => (
                        <div key={rating} className="rating-bar">
                          <span className="rating-label">{rating} stars</span>
                          <div className="rating-bar-container">
                            <div className="rating-bar-fill" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="rating-percentage">{percentage}%</span>
                        </div>
                      ))
                  ) : (
                    <p>No rating breakdown available.</p>
                  )}
                </div>
              </div>
              
              <div className="reviews-list">
                {agent.reviews && agent.reviews.length > 0 ? (
                  agent.reviews.map(review => (
                    <div key={review._id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <span className="reviewer-name">{review.userName}</span>
                          <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="review-rating">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className={star <= review.rating ? 'star filled' : 'star'}>★</span>
                          ))}
                        </div>
                      </div>
                      <div className="review-content">
                        <p>{review.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-reviews">
                    <p>No reviews yet. Be the first to review this agent!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'usage' && (
          <div className="agent-details-usage">
            <div className="agent-details-section">
              <h2>Getting Started</h2>
              <div className="usage-instructions">
                {agent.usageInstructions ? (
                  <div dangerouslySetInnerHTML={{ __html: agent.usageInstructions }} />
                ) : (
                  <div className="default-instructions">
                    <h3>How to use this agent:</h3>
                    <ol>
                      <li>Subscribe to the agent to get full access</li>
                      <li>Navigate to your dashboard and find the agent under "My Subscriptions"</li>
                      <li>Click "Launch" to start a conversation with the agent</li>
                      <li>Follow the agent's instructions for optimal results</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
            
            <div className="agent-details-section">
              <h2>Example Prompts</h2>
              <div className="example-prompts">
                {agent.examplePrompts && agent.examplePrompts.length > 0 ? (
                  <ul className="prompts-list">
                    {agent.examplePrompts.map((prompt, index) => (
                      <li key={index} className="prompt-item">
                        <div className="prompt-content">
                          <p>"{prompt}"</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No example prompts available for this agent.</p>
                )}
              </div>
            </div>
            
            <div className="agent-details-section">
              <h2>FAQ</h2>
              <div className="agent-faq">
                {agent.faq && agent.faq.length > 0 ? (
                  <div className="faq-list">
                    {agent.faq.map((item, index) => (
                      <div key={index} className="faq-item">
                        <h3>{item.question}</h3>
                        <p>{item.answer}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No FAQ available for this agent.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="agent-details-related">
        <h2>Similar Agents</h2>
        <div className="related-agents-grid">
          {agent.relatedAgents && agent.relatedAgents.length > 0 ? (
            agent.relatedAgents.map(relatedAgent => (
              <Link 
                key={relatedAgent._id} 
                to={`/agents/${relatedAgent._id}`} 
                className="related-agent-card"
              >
                <div className="related-agent-image">
                  {relatedAgent.imageUrl ? (
                    <img src={relatedAgent.imageUrl} alt={relatedAgent.name} />
                  ) : (
                    <div className="agent-image-placeholder">
                      {relatedAgent.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="related-agent-info">
                  <h3>{relatedAgent.name}</h3>
                  <p>{relatedAgent.description}</p>
                  <div className="related-agent-meta">
                    <span className="related-agent-price">
                      {relatedAgent.price > 0 ? `$${relatedAgent.price.toFixed(2)}` : 'Free'}
                    </span>
                    <span className="related-agent-rating">★ {relatedAgent.rating || '0.0'}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>No related agents found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDetailsPage;
