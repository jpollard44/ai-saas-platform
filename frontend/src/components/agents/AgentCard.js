import React from 'react';
import { Link } from 'react-router-dom';
import './AgentCard.css';

const AgentCard = ({ agent, onStatusChange, onDelete }) => {
  const statusColors = {
    deployed: '#28a745',
    inactive: '#ffc107',
    draft: '#6c757d',
    error: '#dc3545'
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleStatusToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onStatusChange(agent._id, agent.deploymentStatus);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(agent._id);
  };

  // Calculate health status based on error rate
  const getHealthStatus = () => {
    const errorRate = agent.stats?.errorRate || 0;
    if (errorRate < 0.05) return { status: 'Excellent', color: '#28a745' };
    if (errorRate < 0.10) return { status: 'Good', color: '#4caf50' };
    if (errorRate < 0.20) return { status: 'Fair', color: '#ffc107' };
    return { status: 'Poor', color: '#dc3545' };
  };

  const health = getHealthStatus();

  return (
    <Link to={`/agents/${agent._id}`} className="agent-card-link">
      <div className="agent-card">
        <div className="agent-card-header">
          <div className="agent-model-badge">{agent.modelId || 'GPT-4'}</div>
          <div 
            className="agent-status-indicator" 
            style={{ backgroundColor: statusColors[agent.deploymentStatus] }}
            title={`Status: ${agent.deploymentStatus}`}
          />
        </div>
        
        <h3 className="agent-name">{agent.name}</h3>
        <p className="agent-description">{agent.description}</p>
        
        <div className="agent-stats">
          <div className="stat-item">
            <span className="stat-value">{agent.stats?.usageCount || 0}</span>
            <span className="stat-label">Uses</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{agent.stats?.avgResponseTime ? `${(agent.stats.avgResponseTime / 1000).toFixed(1)}s` : 'N/A'}</span>
            <span className="stat-label">Avg Time</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: health.color }}>{health.status}</span>
            <span className="stat-label">Health</span>
          </div>
        </div>
        
        <div className="agent-meta">
          <span className="agent-created">Created: {formatDate(agent.createdAt)}</span>
          <span className="agent-updated">Updated: {formatDate(agent.updatedAt || agent.createdAt)}</span>
        </div>
        
        <div className="agent-card-actions">
          <button 
            className={`action-button ${agent.deploymentStatus === 'deployed' ? 'deactivate' : 'deploy'}`}
            onClick={handleStatusToggle}
            title={agent.deploymentStatus === 'deployed' ? 'Deactivate Agent' : 'Deploy Agent'}
          >
            {agent.deploymentStatus === 'deployed' ? 'Deactivate' : 'Deploy'}
          </button>
          <button 
            className="action-button delete"
            onClick={handleDelete}
            title="Delete Agent"
          >
            Delete
          </button>
        </div>
      </div>
    </Link>
  );
};

export default AgentCard;
