import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { agentService } from '../services/api';
import { toast } from 'react-toastify';
import './MyAgentsPage.css';

const MyAgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedAgents, setSelectedAgents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      console.log('Fetching agents data...');
      const response = await agentService.getAgents();
      console.log('Agents response:', JSON.stringify(response));
      
      if (!response || !response.data) {
        console.error('Invalid response structure:', response);
        setAgents([]);
        return;
      }
      
      // Extract agents from response
      let fetchedAgents = [];
      if (!response.data.data && Array.isArray(response.data)) {
        fetchedAgents = response.data;
      } else {
        fetchedAgents = response.data.data || [];
      }
      
      console.log('Fetched agents:', fetchedAgents);
      setAgents(fetchedAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load your agents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (agentId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'deployed' ? 'inactive' : 'deployed';
      
      // Optimistically update UI
      const updatedAgents = agents.map(agent => {
        if (agent._id === agentId) {
          return { ...agent, deploymentStatus: newStatus };
        }
        return agent;
      });
      
      setAgents(updatedAgents);
      
      // Update on the backend
      await agentService.updateAgent(agentId, { deploymentStatus: newStatus });
      toast.success(`Agent ${newStatus === 'deployed' ? 'deployed' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating agent status:', error);
      toast.error('Failed to update agent status');
      
      // Revert the optimistic update
      fetchAgents();
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      try {
        await agentService.deleteAgent(agentId);
        toast.success('Agent deleted successfully');
        // Remove from state
        setAgents(agents.filter(agent => agent._id !== agentId));
      } catch (error) {
        console.error('Error deleting agent:', error);
        toast.error('Failed to delete agent');
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedAgents.length === 0) {
      toast.info('Please select at least one agent');
      return;
    }

    try {
      if (action === 'delete') {
        if (window.confirm(`Are you sure you want to delete ${selectedAgents.length} agent(s)? This action cannot be undone.`)) {
          // Implement bulk delete functionality
          for (const agentId of selectedAgents) {
            await agentService.deleteAgent(agentId);
          }
          toast.success(`${selectedAgents.length} agent(s) deleted successfully`);
          fetchAgents();
          setSelectedAgents([]);
        }
      } else if (action === 'deploy' || action === 'deactivate') {
        const newStatus = action === 'deploy' ? 'deployed' : 'inactive';
        for (const agentId of selectedAgents) {
          await agentService.updateAgent(agentId, { deploymentStatus: newStatus });
        }
        toast.success(`${selectedAgents.length} agent(s) ${action === 'deploy' ? 'deployed' : 'deactivated'} successfully`);
        fetchAgents();
        setSelectedAgents([]);
      }
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Failed to ${action} agents`);
    }
  };

  const handleSelectAgent = (agentId) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter(id => id !== agentId));
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedAgents.length === filteredAgents.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(filteredAgents.map(agent => agent._id));
    }
  };

  // Filter and sort agents
  const filteredAgents = agents
    .filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || agent.deploymentStatus === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return (b.stats?.usageCount || 0) - (a.stats?.usageCount || 0);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        default:
          return 0;
      }
    });

  if (loading) {
    return <div className="loading-container">Loading your agents...</div>;
  }

  return (
    <div className="my-agents-container">
      <header className="my-agents-header">
        <h1>My Agents</h1>
        <Link to="/agents/create" className="btn btn-primary">Create New Agent</Link>
      </header>

      <div className="agents-controls">
        <div className="search-filter-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-container">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-dropdown"
            >
              <option value="all">All Statuses</option>
              <option value="deployed">Deployed</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-dropdown"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name</option>
              <option value="usage">Most Used</option>
            </select>
          </div>
        </div>
        
        {selectedAgents.length > 0 && (
          <div className="bulk-actions">
            <span>{selectedAgents.length} agent(s) selected</span>
            <button 
              className="btn btn-outline"
              onClick={() => handleBulkAction('deploy')}
            >
              Deploy All
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => handleBulkAction('deactivate')}
            >
              Deactivate All
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => handleBulkAction('delete')}
            >
              Delete All
            </button>
          </div>
        )}
      </div>

      {agents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <h2>No Agents Found</h2>
          <p>You haven't created any agents yet. Get started by creating your first AI agent!</p>
          <Link to="/agents/create" className="btn btn-primary">Create Your First Agent</Link>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h2>No Matching Agents</h2>
          <p>No agents match your current search or filter criteria.</p>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="agents-table-container">
          <table className="agents-table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectedAgents.length === filteredAgents.length && filteredAgents.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Name</th>
                <th>Model</th>
                <th>Status</th>
                <th>Usage</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map(agent => (
                <tr key={agent._id} className={selectedAgents.includes(agent._id) ? 'selected' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedAgents.includes(agent._id)}
                      onChange={() => handleSelectAgent(agent._id)}
                    />
                  </td>
                  <td>
                    <div className="agent-name-cell" onClick={() => navigate(`/agents/${agent._id}`)}>
                      <span className="agent-name">{agent.name}</span>
                      <span className="agent-description">{agent.description}</span>
                    </div>
                  </td>
                  <td>
                    <span className="model-badge">{agent.modelId}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${agent.deploymentStatus}`}>
                      {agent.deploymentStatus}
                    </span>
                  </td>
                  <td>
                    <div className="usage-stats">
                      <span className="usage-count">{agent.stats?.usageCount || 0}</span>
                      <span className="usage-label">calls</span>
                    </div>
                  </td>
                  <td>
                    <span className="created-date">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view-btn" 
                        title="View Agent"
                        onClick={() => navigate(`/agents/${agent._id}`)}
                      >
                        👁️
                      </button>
                      <button 
                        className={`action-btn ${agent.deploymentStatus === 'deployed' ? 'deactivate-btn' : 'deploy-btn'}`}
                        title={agent.deploymentStatus === 'deployed' ? 'Deactivate' : 'Deploy'}
                        onClick={() => handleStatusChange(agent._id, agent.deploymentStatus)}
                      >
                        {agent.deploymentStatus === 'deployed' ? '⏸️' : '▶️'}
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        title="Delete Agent"
                        onClick={() => handleDeleteAgent(agent._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="agent-insights">
        <h2>Agent Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h3>Total Agents</h3>
            <div className="insight-value">{agents.length}</div>
          </div>
          <div className="insight-card">
            <h3>Deployed Agents</h3>
            <div className="insight-value">
              {agents.filter(agent => agent.deploymentStatus === 'deployed').length}
            </div>
          </div>
          <div className="insight-card">
            <h3>Total Usage</h3>
            <div className="insight-value">
              {agents.reduce((sum, agent) => sum + (agent.stats?.usageCount || 0), 0)}
            </div>
          </div>
          <div className="insight-card">
            <h3>Most Used Agent</h3>
            <div className="insight-value">
              {agents.length > 0 
                ? agents.reduce((prev, current) => 
                    (current.stats?.usageCount || 0) > (prev.stats?.usageCount || 0) ? current : prev
                  ).name
                : 'N/A'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAgentsPage;
