import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agentService, marketplaceService } from '../services/api';
import { toast } from 'react-toastify';
import './PublishAgentPage.css';

const categories = [
  { id: 'Customer Support', name: 'Customer Support', description: 'Agents that help with customer inquiries and support' },
  { id: 'Content Creation', name: 'Content Creation', description: 'Agents that generate or help create content' },
  { id: 'Data Analysis', name: 'Data Analysis', description: 'Agents that analyze and interpret data' },
  { id: 'Education', name: 'Education', description: 'Agents focused on teaching and learning' },
  { id: 'Productivity', name: 'Productivity', description: 'Agents that help with tasks and organization' },
  { id: 'Entertainment', name: 'Entertainment', description: 'Agents for entertainment purposes' },
  { id: 'Other', name: 'Other', description: 'Agents that don\'t fit in the above categories' }
];

const PublishAgentPage = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    pricing: {
      type: 'free',
      amount: 0,
      currency: 'USD'
    }
  });

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        const res = await agentService.getAgent(agentId);
        
        if (!res.data.data) {
          toast.error('Agent not found');
          navigate('/dashboard');
          return;
        }
        
        setAgent(res.data.data);
        
        // Pre-populate form with agent data
        setFormData(prev => ({
          ...prev,
          title: res.data.data.name,
          description: res.data.data.description || ''
        }));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching agent details:', error);
        toast.error('Failed to load agent details');
        navigate('/dashboard');
      }
    };

    fetchAgentDetails();
  }, [agentId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'pricingType') {
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          type: value
        }
      }));
    } else if (name === 'pricingAmount') {
      const amount = parseFloat(value);
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          amount: isNaN(amount) ? 0 : amount
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Parse tags from comma-separated string
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      const listingData = {
        agentId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags,
        pricing: formData.pricing
      };

      const response = await marketplaceService.listAgent(listingData);
      
      toast.success('Agent published to marketplace successfully');
      navigate(`/marketplace/${response.data.data._id}`);
    } catch (error) {
      console.error('Error publishing agent:', error);
      toast.error(error.response?.data?.error || 'Failed to publish agent');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="publish-loading">
        <div className="spinner"></div>
        <p>Loading agent details...</p>
      </div>
    );
  }

  return (
    <div className="publish-container">
      <header className="publish-header">
        <h1>Publish Agent to Marketplace</h1>
        <p>Share your agent with the world and earn from your creation</p>
      </header>

      <div className="publish-agent-preview">
        <div className="agent-preview-card">
          <div className="preview-header">
            <h3>{agent.name}</h3>
            <span className="model-badge">{agent.modelId}</span>
          </div>
          <p className="preview-description">{agent.description}</p>
        </div>
      </div>

      <form className="publish-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Listing Details</h2>
          
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a catchy title for your listing"
              required
              maxLength={100}
            />
            <div className="input-helper">
              How your agent will appear in the marketplace. Make it clear and appealing.
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what your agent does and how it can help users"
              required
              maxLength={500}
              rows={5}
            ></textarea>
            <div className="input-helper">
              Provide a detailed description of what your agent does, its capabilities, and use cases.
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="input-helper">
              Choose the category that best describes your agent's purpose.
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="ai, chatbot, support, etc. (comma separated)"
            />
            <div className="input-helper">
              Add tags to help users find your agent (comma separated).
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Pricing</h2>
          
          <div className="radio-group">
            <div className="radio-option">
              <input
                type="radio"
                id="pricingFree"
                name="pricingType"
                value="free"
                checked={formData.pricing.type === 'free'}
                onChange={handlePricingChange}
              />
              <label htmlFor="pricingFree">Free</label>
            </div>
            
            <div className="radio-option">
              <input
                type="radio"
                id="pricingOneTime"
                name="pricingType"
                value="one-time"
                checked={formData.pricing.type === 'one-time'}
                onChange={handlePricingChange}
              />
              <label htmlFor="pricingOneTime">One-time purchase</label>
            </div>
            
            <div className="radio-option">
              <input
                type="radio"
                id="pricingSubscription"
                name="pricingType"
                value="subscription"
                checked={formData.pricing.type === 'subscription'}
                onChange={handlePricingChange}
              />
              <label htmlFor="pricingSubscription">Subscription</label>
            </div>
          </div>
          
          {formData.pricing.type !== 'free' && (
            <div className="form-group">
              <label htmlFor="pricingAmount">Price (USD)</label>
              <div className="price-input">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  id="pricingAmount"
                  name="pricingAmount"
                  value={formData.pricing.amount}
                  onChange={handlePricingChange}
                  min="0.99"
                  step="0.01"
                  required={formData.pricing.type !== 'free'}
                />
              </div>
              <div className="input-helper">
                {formData.pricing.type === 'one-time' 
                  ? 'Set a one-time purchase price for your agent.' 
                  : 'Set a monthly subscription price for your agent.'}
              </div>
            </div>
          )}
        </div>
        
        <div className="form-section terms-section">
          <h2>Terms and Conditions</h2>
          
          <div className="terms-box">
            <p>By publishing your agent to the marketplace, you agree to the following:</p>
            <ul>
              <li>You own or have the right to distribute this agent and its capabilities</li>
              <li>Your agent does not violate any laws or platform guidelines</li>
              <li>You are responsible for maintaining and supporting your agent</li>
              <li>Platform fees may apply to sales (see pricing policy)</li>
            </ul>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="agreeTerms"
              required
            />
            <label htmlFor="agreeTerms">
              I agree to the Marketplace Terms and Conditions
            </label>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate(`/agents/${agentId}`)}
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Publishing...' : 'Publish Agent'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublishAgentPage;
