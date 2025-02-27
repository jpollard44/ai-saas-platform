import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { agentService, analyticsService } from '../services/api';
import { toast } from 'react-toastify';
import './DashboardPage.css';

const DashboardPage = () => {
  const [agents, setAgents] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsage: 0,
    avgResponseTime: 0,
    topAgentName: '',
    topAgentUsage: 0
  });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch actual agents from API
        console.log('Fetching agents data...');
        const agentsResponse = await agentService.getAgents();
        console.log('Agents response:', JSON.stringify(agentsResponse));
        
        // Check if we have a valid response structure
        if (!agentsResponse || !agentsResponse.data) {
          console.error('Invalid agents response structure:', agentsResponse);
          setAgents([]);
          setLoading(false);
          return;
        }
        
        // Determine the agents array from the response
        let fetchedAgents = [];
        
        // Check if we have the data property in the response
        if (!agentsResponse.data.data && Array.isArray(agentsResponse.data)) {
          // Handle case where data is directly in the response.data
          console.log('Agents data is directly in response.data');
          fetchedAgents = agentsResponse.data || [];
        } else {
          // Standard structure with nested data
          console.log('Agents data is in response.data.data');
          fetchedAgents = agentsResponse.data.data || [];
        }
        
        // Log the agents that were fetched
        console.log('Fetched agents:', fetchedAgents);
        
        // Set the agents state
        setAgents(fetchedAgents);
        
        // Calculate analytics from agent data
        if (fetchedAgents.length > 0) {
          // Calculate total usage
          const totalUsage = fetchedAgents.reduce(
            (sum, agent) => sum + (agent.stats?.usageCount || 0), 0
          );
          
          // Calculate average response time across all agents
          const totalWithResponseTime = fetchedAgents.filter(
            agent => agent.stats?.averageResponseTime > 0
          ).length;
          
          const avgResponseTime = totalWithResponseTime > 0 ? 
            fetchedAgents.reduce(
              (sum, agent) => sum + (agent.stats?.averageResponseTime || 0), 0
            ) / totalWithResponseTime : 0;
          
          // Find top agent by usage
          let topAgent = { name: 'None', stats: { usageCount: 0 } };
          fetchedAgents.forEach(agent => {
            if ((agent.stats?.usageCount || 0) > (topAgent.stats?.usageCount || 0)) {
              topAgent = agent;
            }
          });
          
          setAnalytics({
            totalUsage,
            avgResponseTime,
            topAgentName: topAgent.name,
            topAgentUsage: topAgent.stats?.usageCount || 0
          });
        }
        
        // Try to get analytics from backend if available
        try {
          const analyticsResponse = await analyticsService.getDashboardAnalytics();
          if (analyticsResponse.data && analyticsResponse.data.success) {
            setAnalytics(prev => ({
              ...prev,
              ...analyticsResponse.data.data
            }));
          }
        } catch (error) {
          console.warn('Using calculated analytics instead of API:', error);
          // Continue with calculated analytics if API fails
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data. Please try again later.');
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAgentToggle = async (agentId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'deployed' ? 'inactive' : 'deployed';
      
      // Optimistically update UI
      const updatedAgents = agents.map(agent => {
        if (agent._id === agentId) {
          return {
            ...agent,
            deploymentStatus: newStatus
          };
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
      
      // Revert the optimistic update if API call fails
      const originalAgents = agents.map(agent => {
        if (agent._id === agentId) {
          return {
            ...agent,
            deploymentStatus: currentStatus
          };
        }
        return agent;
      });
      
      setAgents(originalAgents);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {currentUser?.name || 'User'}</h1>
        <p className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      <div className="dashboard-grid">
        {/* Stats Overview */}
        <section className="dashboard-stats">
          <h2>Overview</h2>
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Total Agents</h3>
              <p className="stat-value">{agents.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Usage</h3>
              <p className="stat-value">{analytics.totalUsage || 0}</p>
              <p className="stat-label">API Calls</p>
            </div>
            <div className="stat-card">
              <h3>Avg Response Time</h3>
              <p className="stat-value">
                {analytics.avgResponseTime > 0 
                  ? `${(analytics.avgResponseTime / 1000).toFixed(2)}s` 
                  : 'N/A'}
              </p>
            </div>
            <div className="stat-card">
              <h3>Top Agent</h3>
              <p className="stat-value">{analytics.topAgentName || 'None'}</p>
              <p className="stat-label">{analytics.topAgentUsage || 0} calls</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="dashboard-quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/agents/create" className="action-button">
              <span className="action-icon">+</span>
              <span>Create Agent</span>
            </Link>
            <Link to="/marketplace" className="action-button">
              <span className="action-icon">🛒</span>
              <span>Browse Marketplace</span>
            </Link>
            <Link to="/settings" className="action-button">
              <span className="action-icon">📚</span>
              <span>Documentation</span>
            </Link>
            <Link to="/profile" className="action-button">
              <span className="action-icon">👤</span>
              <span>Edit Profile</span>
            </Link>
          </div>
        </section>

        {/* My Agents Section */}
        <section className="dashboard-agents">
          <div className="section-header">
            <h2>My Agents</h2>
            <Link to="/agents/create" className="btn btn-primary">Create New Agent</Link>
          </div>
          
          {agents.length === 0 ? (
            <div className="empty-state">
              <p>You haven't created any agents yet.</p>
              <Link to="/agents/create" className="btn btn-secondary">Create Your First Agent</Link>
            </div>
          ) : (
            <div className="agent-cards">
              {agents.map(agent => (
                <div key={agent._id} className="agent-card">
                  <div className="agent-card-header">
                    <h3>{agent.name}</h3>
                    <div className="agent-status">
                      <span className={`status-indicator ${agent.deploymentStatus}`}></span>
                      <span className="status-text">{agent.deploymentStatus}</span>
                    </div>
                  </div>
                  
                  <div className="agent-card-model">
                    <span className="model-badge">{agent.modelId}</span>
                  </div>
                  
                  <p className="agent-description">
                    {agent.description || 'No description provided.'}
                  </p>
                  
                  <div className="agent-stats">
                    <div className="agent-stat">
                      <span className="stat-label">Usage</span>
                      <span className="stat-value">{agent.stats?.usageCount || 0}</span>
                    </div>
                    <div className="agent-stat">
                      <span className="stat-label">Response Time</span>
                      <span className="stat-value">
                        {agent.stats?.averageResponseTime > 0 
                          ? `${(agent.stats.averageResponseTime / 1000).toFixed(2)}s` 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="agent-card-actions">
                    <Link to={`/agents/${agent._id}`} className="btn btn-text">View Details</Link>
                    <button
                      className={`btn ${agent.deploymentStatus === 'deployed' ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleAgentToggle(agent._id, agent.deploymentStatus)}
                    >
                      {agent.deploymentStatus === 'deployed' ? 'Deactivate' : 'Deploy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
