import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, agentService } from '../services/api-proxy';
import './ProfilePage.css';

const ProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('agents');
  const [activeFilter, setActiveFilter] = useState('all');
  const { currentUser, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  console.log('ProfilePage - Auth State:', { 
    currentUser, 
    isAuthenticated, 
    loading,
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId')
  });

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get userId from localStorage as a fallback
      const userId = currentUser?.id || localStorage.getItem('userId');
      
      console.log('Fetching profile with userId:', userId);
      
      if (!userId) {
        console.error('No user ID available for profile fetch');
        setError('You must be logged in to view this profile');
        setIsLoading(false);
        return;
      }
      
      // Fetch user profile data using the user ID
      console.log('Calling userService.getProfile with ID:', userId);
      const userResponse = await userService.getProfile(userId);
      console.log('Profile response:', userResponse);
      
      if (userResponse.data && userResponse.data.success) {
        setUser(userResponse.data.data);
      } else {
        setError('Failed to load profile data');
      }
      
      // Fetch user's agents
      const agentsResponse = await agentService.getAgents();
      if (agentsResponse.data && agentsResponse.data.success) {
        setAgents(agentsResponse.data.data || []);
      } else {
        setError('Failed to load agents');
      }
    } catch (error) {
      console.error('Profile error details:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        setError(`Error ${error.response.status}: ${error.response.data.message || 'Error fetching profile data'}`);
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        setError(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <h2>Error Loading Profile</h2>
        <p>{error}</p>
        <button 
          className="retry-button" 
          onClick={() => {
            setError(null);
            setIsLoading(true);
            fetchProfileData();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-not-found">
        <h2>User Not Found</h2>
        <p>The user you're looking for doesn't exist or has been removed.</p>
        <button className="btn btn-primary">Back to Home</button>
      </div>
    );
  }

  const filteredAgents = activeFilter === 'all'
    ? agents
    : activeFilter === 'featured'
      ? agents.filter(agent => agent.featured)
      : agents.filter(agent => agent.category === activeFilter);

  const renderAgentsTab = () => (
    <div className="profile-agents-container">
      <div className="profile-filters">
        <button 
          className={activeFilter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={activeFilter === 'featured' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setActiveFilter('featured')}
        >
          Featured
        </button>
        <button 
          className={activeFilter === 'Data Analysis' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setActiveFilter('Data Analysis')}
        >
          Data Analysis
        </button>
        <button 
          className={activeFilter === 'Content Creation' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setActiveFilter('Content Creation')}
        >
          Content Creation
        </button>
        <button 
          className={activeFilter === 'Development' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setActiveFilter('Development')}
        >
          Development
        </button>
      </div>

      <div className="profile-agents-grid">
        {filteredAgents.map(agent => (
          <div key={agent._id} className="profile-agent-card">
            <div className="profile-agent-image">
              <img src={agent.imageUrl} alt={agent.name} />
              {agent.featured && <span className="featured-badge">Featured</span>}
            </div>
            <div className="profile-agent-content">
              <h3>{agent.name}</h3>
              <p className="profile-agent-description">{agent.description}</p>
              <div className="profile-agent-meta">
                <span className="profile-agent-category">{agent.category}</span>
                <div className="profile-agent-rating">
                  <span className="rating-stars">
                    {'★'.repeat(Math.floor(agent.rating))}
                    {'☆'.repeat(5 - Math.floor(agent.rating))}
                  </span>
                  <span className="rating-count">({agent.reviewCount})</span>
                </div>
              </div>
              <div className="profile-agent-footer">
                <span className="profile-agent-price">{agent.price}</span>
                <button className="btn btn-primary btn-sm">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="no-agents">
          <p>No agents found with the selected filter.</p>
        </div>
      )}
    </div>
  );

  const renderAboutTab = () => (
    <div className="profile-about-container">
      <div className="profile-about-section">
        <h2>About {user.name}</h2>
        <p className="profile-long-bio">
          {user.bio}
        </p>
      </div>

      <div className="profile-about-section">
        <h2>Expertise</h2>
        <div className="profile-expertise-grid">
          {user.expertise && user.expertise.map(expertise => (
            <div key={expertise} className="expertise-item">
              <i className="fas fa-chart-bar"></i>
              <h3>{expertise}</h3>
              <p>{expertise} expertise</p>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-about-section">
        <h2>Achievements</h2>
        <ul className="profile-achievements-list">
          {user.achievements && user.achievements.map(achievement => (
            <li key={achievement} className="achievement-item">
              <span className="achievement-year">{achievement.year}</span>
              <div className="achievement-content">
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <div className="profile-cover-image">
          <div className="profile-avatar">
            <img src={user.avatarUrl} alt={user.name} />
          </div>
        </div>
        
        <div className="profile-header-content">
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-username">@{user.username}</p>
            <p className="profile-bio">{user.bio}</p>
            
            <div className="profile-details">
              {user.location && (
                <span className="profile-detail">
                  <i className="fas fa-map-marker-alt"></i> {user.location}
                </span>
              )}
              {user.website && (
                <span className="profile-detail">
                  <i className="fas fa-globe"></i> 
                  <a href={user.website} target="_blank" rel="noopener noreferrer">
                    {user.website.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </span>
              )}
              {user.twitter && (
                <span className="profile-detail">
                  <i className="fab fa-twitter"></i> 
                  <a href={`https://twitter.com/${user.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                    {user.twitter}
                  </a>
                </span>
              )}
              <span className="profile-detail">
                <i className="fas fa-calendar-alt"></i> Joined {user.joinDate}
              </span>
            </div>
          </div>
          
          <div className="profile-actions">
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{agents.length}</span>
                <span className="stat-label">Agents</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{user.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{user.following}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
            
            <div className="profile-buttons">
              <button className="btn btn-primary">
                <i className="fas fa-user-plus"></i> Follow
              </button>
              <button className="btn btn-secondary">
                <i className="fas fa-envelope"></i> Message
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-tabs">
          <button 
            className={activeTab === 'agents' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('agents')}
          >
            Agents
          </button>
          <button 
            className={activeTab === 'about' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>
        
        <div className="profile-tab-content">
          {activeTab === 'agents' ? renderAgentsTab() : renderAboutTab()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
