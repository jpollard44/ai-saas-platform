import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agentService } from '../services/api';
import { toast } from 'react-toastify';
import './AgentDetailPage.css';

const AgentDetailPage = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        const res = await agentService.getAgent(agentId);
        setAgent(res.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching agent details:', error);
        toast.error('Failed to load agent details');
        navigate('/dashboard');
      }
    };

    fetchAgentDetails();
  }, [agentId, navigate]);

  const handleGenerateApiKey = async () => {
    try {
      const res = await agentService.generateApiKey(agentId);
      setApiKey(res.data.apiKey);
      toast.success('API key generated successfully');
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error('Failed to generate API key');
    }
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message to conversation
    const userMessage = { role: 'user', content: query };
    setConversation([...conversation, userMessage]);
    
    // Clear input
    setQuery('');
    setProcessing(true);

    try {
      const response = await agentService.runAgent(agentId, query, apiKey);
      
      // Add agent response to conversation
      const agentMessage = { 
        role: 'assistant', 
        content: response.data.response, 
        stats: response.data.stats 
      };
      
      setConversation(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error running agent:', error);
      toast.error('Failed to process your query');
      
      // Add error message to conversation
      const errorMessage = { 
        role: 'system', 
        content: 'Sorry, I encountered an error processing your request.' 
      };
      
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="agent-detail-loading">
        <div className="spinner"></div>
        <p>Loading agent details...</p>
      </div>
    );
  }

  return (
    <div className="agent-detail-container">
      <div className="agent-header">
        <h1>{agent.name}</h1>
        <div className="agent-badges">
          <span className="badge model-badge">{agent.modelId}</span>
          {agent.templateId && (
            <span className="badge template-badge">{agent.templateId}</span>
          )}
          <span className={`badge status-badge ${agent.deploymentStatus}`}>
            {agent.deploymentStatus}
          </span>
        </div>
      </div>

      <div className="agent-description">
        <p>{agent.description}</p>
      </div>

      <div className="agent-stats card">
        <h3>Stats</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Usage Count</span>
            <span className="stat-value">{agent.stats.usageCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Response Time</span>
            <span className="stat-value">
              {agent.stats.averageResponseTime > 0
                ? `${(agent.stats.averageResponseTime / 1000).toFixed(2)}s`
                : 'N/A'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Created</span>
            <span className="stat-value">
              {new Date(agent.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Visibility</span>
            <span className="stat-value">{agent.visibility}</span>
          </div>
        </div>
      </div>

      <div className="agent-settings card">
        <h3>Settings</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <span className="setting-label">Temperature</span>
            <span className="setting-value">{agent.temperature}</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Max Tokens</span>
            <span className="setting-value">{agent.maxTokens}</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Web Search</span>
            <span className="setting-value">
              {agent.enableWebSearch ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Knowledge Base</span>
            <span className="setting-value">
              {agent.enableKnowledgeBase ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Memory</span>
            <span className="setting-value">
              {agent.enableMemory ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      <div className="agent-api-section card">
        <h3>API Access</h3>
        <p>Generate an API key to use this agent via API.</p>
        
        {apiKey ? (
          <div className="api-key-container">
            <div className="api-key-display">
              <span>{showApiKey ? apiKey : '••••••••••••••••••••••••••'}</span>
              <button 
                className="toggle-key-btn"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="api-key-warning">
              Keep this key secure. It grants access to your agent.
            </p>
          </div>
        ) : (
          <button 
            className="generate-key-btn" 
            onClick={handleGenerateApiKey}
          >
            Generate API Key
          </button>
        )}
      </div>

      <div className="agent-conversation-container">
        <h3>Test Your Agent</h3>
        
        <div className="conversation-messages">
          {conversation.length === 0 ? (
            <div className="empty-conversation">
              <p>No messages yet. Start a conversation with your agent.</p>
            </div>
          ) : (
            conversation.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.role}`}
              >
                <div className="message-content">
                  {message.content}
                </div>
                {message.stats && (
                  <div className="message-stats">
                    <span>Response time: {(message.stats.responseTime / 1000).toFixed(2)}s</span>
                    {message.stats.tokens && (
                      <span>Tokens: {message.stats.tokens.total_tokens}</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          
          {processing && (
            <div className="message assistant processing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
        
        <form className="query-form" onSubmit={handleSubmitQuery}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask your agent something..."
            disabled={processing}
          />
          <button 
            type="submit" 
            disabled={processing || !query.trim()}
          >
            Send
          </button>
        </form>
      </div>

      <div className="agent-actions">
        <button 
          className="edit-btn"
          onClick={() => navigate(`/agents/${agentId}/edit`)}
        >
          Edit Agent
        </button>
        
        {agent.visibility !== 'marketplace' && (
          <button 
            className="publish-btn"
            onClick={() => navigate(`/marketplace/publish/${agentId}`)}
          >
            Publish to Marketplace
          </button>
        )}
      </div>
    </div>
  );
};

export default AgentDetailPage;
