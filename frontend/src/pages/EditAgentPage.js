import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agentService } from '../services/api';
import './CreateAgentPage.css'; // Reuse the same styling

const EditAgentPage = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pricingError, setPricingError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    modelId: 'gpt-3.5-turbo',
    instructions: '',
    temperature: 0.7,
    maxTokens: 800,
    enableWebSearch: false,
    enableKnowledgeBase: false,
    enableMemory: true,
    visibility: 'private',
    pricing: {
      type: 'free',
      amount: 0,
      currency: 'USD'
    }
  });

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setLoading(true);
        const response = await agentService.getAgent(agentId);

        if (response.data && response.data.success) {
          const agent = response.data.data;

          const pricing = agent.pricing || {};

          if (isMounted.current) {
            setFormData({
              name: agent.name || '',
              description: agent.description || '',
              modelId: agent.modelId || 'gpt-3.5-turbo',
              instructions: agent.instructions || '',
              temperature: agent.temperature || 0.7,
              maxTokens: agent.maxTokens || 800,
              enableWebSearch: agent.enableWebSearch || false,
              enableKnowledgeBase: agent.enableKnowledgeBase || false,
              enableMemory: agent.enableMemory !== undefined ? agent.enableMemory : true,
              visibility: agent.visibility || 'private',
              pricing: {
                type: pricing.type || 'free',
                amount: pricing.amount || 0,
                currency: pricing.currency || 'USD'
              }
            });
          }
        } else {
          setError('Failed to load agent details');
        }
      } catch (err) {
        console.error('Error fetching agent details:', err);
        setError('An error occurred while fetching agent details');
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    if (agentId) {
      fetchAgentDetails();
    }
  }, [agentId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('pricing.')) {
      const pricingField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          [pricingField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const pricingType = formData.pricing?.type || 'free';
      const pricingAmount = pricingType === 'free' ? 0 : (formData.pricing?.amount || 0);
      const pricingCurrency = formData.pricing?.currency || 'USD';

      const pricingData = {
        type: pricingType,
        amount: pricingAmount,
        currency: pricingCurrency
      };

      console.log('Sending pricing data:', JSON.stringify(pricingData));

      try {
        await agentService.updateAgentPricing(agentId, pricingData);
      } catch (pricingError) {
        console.error('Error updating pricing:', pricingError);
        console.error('Error response:', pricingError.response?.data);
        if (isMounted.current) {
          setPricingError('Failed to update pricing');
        }
      }

      const agentDataWithoutPricing = { ...formData };
      delete agentDataWithoutPricing.pricing;

      const response = await agentService.updateAgent(agentId, agentDataWithoutPricing);

      if (response.data && response.data.success) {
        navigate(`/agents/${agentId}`);
      } else {
        if (isMounted.current) {
          setError('Failed to update agent');
        }
      }
    } catch (err) {
      console.error('Error updating agent:', err);
      if (isMounted.current) {
        setError('An error occurred while updating the agent');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <div className="loading-container">Loading agent details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/my-agents')} className="btn btn-primary">
          Return to My Agents
        </button>
      </div>
    );
  }

  return (
    <div className="create-agent-container">
      <div className="create-agent-header">
        <h1>Edit Agent</h1>
        <p>Update your AI agent's configuration and capabilities</p>
      </div>

      <form onSubmit={handleSubmit} className="create-agent-form">
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="name">Agent Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              maxLength={200}
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Model Configuration</h2>

          <div className="form-group">
            <label htmlFor="modelId">Base Model</label>
            <select
              id="modelId"
              name="modelId"
              value={formData.modelId}
              onChange={handleChange}
              required
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-2">Claude 2</option>
              <option value="llama-2">Llama 2</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="instructions">Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              required
              placeholder="Provide detailed instructions for your agent..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="temperature">Temperature: {formData.temperature}</label>
            <input
              type="range"
              id="temperature"
              name="temperature"
              min="0"
              max="1"
              step="0.1"
              value={formData.temperature}
              onChange={handleChange}
            />
            <div className="range-labels">
              <span>More Predictable</span>
              <span>More Creative</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="maxTokens">Max Tokens: {formData.maxTokens}</label>
            <input
              type="range"
              id="maxTokens"
              name="maxTokens"
              min="50"
              max="4000"
              step="50"
              value={formData.maxTokens}
              onChange={handleChange}
            />
            <div className="range-labels">
              <span>Shorter</span>
              <span>Longer</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Capabilities</h2>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="enableWebSearch"
              name="enableWebSearch"
              checked={formData.enableWebSearch}
              onChange={handleChange}
            />
            <label htmlFor="enableWebSearch">Enable Web Search</label>
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="enableKnowledgeBase"
              name="enableKnowledgeBase"
              checked={formData.enableKnowledgeBase}
              onChange={handleChange}
            />
            <label htmlFor="enableKnowledgeBase">Enable Knowledge Base</label>
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="enableMemory"
              name="enableMemory"
              checked={formData.enableMemory}
              onChange={handleChange}
            />
            <label htmlFor="enableMemory">Enable Memory</label>
          </div>
        </div>

        <div className="form-section">
          <h2>Visibility & Pricing</h2>

          <div className="form-group">
            <label htmlFor="visibility">Visibility</label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
            >
              <option value="private">Private (Only you)</option>
              <option value="public">Public (Anyone with link)</option>
              <option value="marketplace">Marketplace (Listed for all)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pricing.type">Pricing Type</label>
            <select
              id="pricing.type"
              name="pricing.type"
              value={formData.pricing.type}
              onChange={handleChange}
            >
              <option value="free">Free</option>
              <option value="one-time">One-time Purchase</option>
              <option value="subscription">Subscription</option>
            </select>
          </div>

          {formData.pricing.type !== 'free' && (
            <div className="form-group">
              <label htmlFor="pricing.amount">Price (USD)</label>
              <input
                type="number"
                id="pricing.amount"
                name="pricing.amount"
                value={formData.pricing.amount}
                onChange={handleChange}
                min="0.99"
                step="0.01"
                required={formData.pricing.type !== 'free'}
              />
            </div>
          )}
          {pricingError && (
            <div className="form-group">
              <p style={{ color: 'red' }}>{pricingError}</p>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(`/agents/${agentId}`)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAgentPage;
