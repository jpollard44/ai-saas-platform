import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

// Mock data for initial development
const mockAgents = [
  { id: 1, name: 'Customer Support Bot', status: 'active', type: 'chatbot', usage: 1250, performance: 92 },
  { id: 2, name: 'Data Analysis Assistant', status: 'inactive', type: 'analysis', usage: 450, performance: 88 },
  { id: 3, name: 'Content Generator', status: 'active', type: 'generator', usage: 820, performance: 95 }
];

const mockAnalytics = {
  totalUsage: 2520,
  averagePerformance: 91,
  topAgent: 'Content Generator',
  recentActivity: [
    { id: 1, type: 'Agent Created', agent: 'Content Generator', timestamp: '2023-06-12 14:30' },
    { id: 2, type: 'Agent Deployed', agent: 'Customer Support Bot', timestamp: '2023-06-10 09:15' },
    { id: 3, type: 'Agent Updated', agent: 'Data Analysis Assistant', timestamp: '2023-06-08 16:45' }
  ]
};

const DashboardPage = () => {
  const [agents, setAgents] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Replace with actual API calls when backend is ready
    const fetchDashboardData = async () => {
      try {
        // Simulate API delay
        setTimeout(() => {
          setAgents(mockAgents);
          setAnalytics(mockAnalytics);
          setLoading(false);
        }, 1000);
        
        // When API is ready:
        // const agentsData = await agentService.getUserAgents();
        // const analyticsData = await analyticsService.getDashboardStats();
        // setAgents(agentsData);
        // setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAgentToggle = async (agentId, currentStatus) => {
    // Replace with actual API calls when backend is ready
    try {
      // Simulate API call
      const updatedAgents = agents.map(agent => {
        if (agent.id === agentId) {
          return {
            ...agent,
            status: currentStatus === 'active' ? 'inactive' : 'active'
          };
        }
        return agent;
      });
      
      setAgents(updatedAgents);
      
      // When API is ready:
      // await agentService.updateAgentStatus(agentId, { status: currentStatus === 'active' ? 'inactive' : 'active' });
    } catch (error) {
      console.error('Error updating agent status:', error);
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
              <h3>Avg. Performance</h3>
              <p className="stat-value">{analytics.averagePerformance || 0}%</p>
            </div>
            <div className="stat-card">
              <h3>Top Agent</h3>
              <p className="stat-value">{analytics.topAgent || 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* My Agents */}
        <section className="my-agents">
          <div className="section-header">
            <h2>My Agents</h2>
            <Link to="/create-agent" className="btn btn-primary btn-sm">
              Create New Agent
            </Link>
          </div>
          
          {agents.length === 0 ? (
            <div className="empty-state">
              <p>You haven't created any agents yet.</p>
              <Link to="/create-agent" className="btn btn-outline">
                Create Your First Agent
              </Link>
            </div>
          ) : (
            <div className="agents-table-container">
              <table className="agents-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Usage</th>
                    <th>Performance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map(agent => (
                    <tr key={agent.id}>
                      <td>
                        <Link to={`/agents/${agent.id}`}>{agent.name}</Link>
                      </td>
                      <td>
                        <span className={`agent-type ${agent.type}`}>
                          {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${agent.status}`}>
                          {agent.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{agent.usage} calls</td>
                      <td>
                        <div className="performance-bar">
                          <div 
                            className="performance-fill" 
                            style={{ width: `${agent.performance}%` }}
                          ></div>
                          <span>{agent.performance}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className={`btn btn-icon ${agent.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => handleAgentToggle(agent.id, agent.status)}
                          >
                            <i className={`fas fa-${agent.status === 'active' ? 'pause' : 'play'}`}></i>
                          </button>
                          <Link to={`/agents/${agent.id}/edit`} className="btn btn-icon btn-secondary">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <Link to={`/agents/${agent.id}/analytics`} className="btn btn-icon btn-primary">
                            <i className="fas fa-chart-line"></i>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section className="recent-activity">
          <h2>Recent Activity</h2>
          <ul className="activity-list">
            {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map(activity => (
                <li key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <i className={`fas fa-${
                      activity.type === 'Agent Created' ? 'plus' :
                      activity.type === 'Agent Deployed' ? 'rocket' :
                      activity.type === 'Agent Updated' ? 'edit' : 'info'
                    }`}></i>
                  </div>
                  <div className="activity-details">
                    <p className="activity-title">{activity.type}</p>
                    <p className="activity-subtitle">{activity.agent}</p>
                    <p className="activity-time">{activity.timestamp}</p>
                  </div>
                </li>
              ))
            ) : (
              <li className="empty-activity">No recent activity</li>
            )}
          </ul>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/create-agent" className="action-card">
              <div className="action-icon">
                <i className="fas fa-robot"></i>
              </div>
              <h3>Create Agent</h3>
              <p>Build a new AI agent from scratch</p>
            </Link>
            <Link to="/templates" className="action-card">
              <div className="action-icon">
                <i className="fas fa-copy"></i>
              </div>
              <h3>Templates</h3>
              <p>Start from a pre-built template</p>
            </Link>
            <Link to="/marketplace" className="action-card">
              <div className="action-icon">
                <i className="fas fa-store"></i>
              </div>
              <h3>Marketplace</h3>
              <p>Browse agents from other creators</p>
            </Link>
            <Link to="/documentation" className="action-card">
              <div className="action-icon">
                <i className="fas fa-book"></i>
              </div>
              <h3>Documentation</h3>
              <p>Learn how to build better agents</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
