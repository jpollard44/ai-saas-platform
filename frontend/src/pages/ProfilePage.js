import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProfilePage.css';

// Mock data for development
const MOCK_USER = {
  id: 'user123',
  name: 'Alexandra Chen',
  username: 'alexchen',
  avatarUrl: 'https://via.placeholder.com/150',
  bio: 'AI Engineer and Prompt Designer | Creating specialized agents for data analysis and creative writing | Previously @ OpenAI',
  website: 'https://alexchen.dev',
  twitter: '@alexchenai',
  location: 'San Francisco, CA',
  joinDate: 'January 2023',
  followers: 1204,
  following: 352,
  stats: {
    createdAgents: 28,
    totalSales: 3450,
    topCategory: 'Data Analysis'
  }
};

const MOCK_AGENTS = [
  {
    id: 'agent1',
    name: 'DataMiner Pro',
    description: 'Advanced data analysis and visualization agent with ML capabilities',
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Data Analysis',
    price: '$49.99',
    rating: 4.8,
    reviewCount: 124,
    featured: true
  },
  {
    id: 'agent2',
    name: 'Content Wizard',
    description: 'Intelligent content creation assistant for blogs, social media, and more',
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Content Creation',
    price: '$39.99',
    rating: 4.7,
    reviewCount: 98,
    featured: true
  },
  {
    id: 'agent3',
    name: 'CodeAssist',
    description: 'Coding assistant that helps write, debug, and optimize code',
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Development',
    price: '$59.99',
    rating: 4.9,
    reviewCount: 156,
    featured: false
  },
  {
    id: 'agent4',
    name: 'Research Companion',
    description: 'Academic research assistant for literature review, citation, and analysis',
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Research',
    price: '$29.99',
    rating: 4.6,
    reviewCount: 87,
    featured: false
  },
  {
    id: 'agent5',
    name: 'Finance Advisor',
    description: 'Personal finance and investment advisor with real-time market insights',
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Finance',
    price: '$49.99',
    rating: 4.5,
    reviewCount: 72,
    featured: false
  },
  {
    id: 'agent6',
    name: 'Design Assistant',
    description: 'AI-powered design assistant for UI/UX and graphic design',
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Design',
    price: '$45.99',
    rating: 4.7,
    reviewCount: 91,
    featured: false
  }
];

const ProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('agents');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // In a real app, fetch data from API
    setTimeout(() => {
      setUser(MOCK_USER);
      setAgents(MOCK_AGENTS);
      setIsLoading(false);
    }, 800);
  }, [username]);

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
        <button className="btn btn-primary">Try Again</button>
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
          <div key={agent.id} className="profile-agent-card">
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
          Alexandra Chen is a renowned AI Engineer and Prompt Designer with over 8 years of experience in the field. 
          She specializes in creating intelligent agents for data analysis, natural language processing, and creative 
          content generation.
        </p>
        <p className="profile-long-bio">
          Before launching her own suite of AI agents, Alexandra worked at OpenAI, where she contributed to several 
          groundbreaking projects. She holds a Ph.D. in Computer Science from Stanford University, with a focus on 
          machine learning and natural language processing.
        </p>
        <p className="profile-long-bio">
          Alexandra's agents have been used by thousands of professionals worldwide, helping them automate tasks, 
          gain insights from data, and enhance their creative workflows.
        </p>
      </div>

      <div className="profile-about-section">
        <h2>Expertise</h2>
        <div className="profile-expertise-grid">
          <div className="expertise-item">
            <i className="fas fa-chart-bar"></i>
            <h3>Data Analysis</h3>
            <p>Creating agents that process, analyze, and visualize complex datasets</p>
          </div>
          <div className="expertise-item">
            <i className="fas fa-code"></i>
            <h3>AI Development</h3>
            <p>Building custom AI models and agents with state-of-the-art capabilities</p>
          </div>
          <div className="expertise-item">
            <i className="fas fa-pencil-alt"></i>
            <h3>Content Creation</h3>
            <p>Designing assistants for writing, editing, and creative content generation</p>
          </div>
          <div className="expertise-item">
            <i className="fas fa-brain"></i>
            <h3>Prompt Engineering</h3>
            <p>Crafting sophisticated prompts to optimize AI model outputs</p>
          </div>
        </div>
      </div>

      <div className="profile-about-section">
        <h2>Achievements</h2>
        <ul className="profile-achievements-list">
          <li className="achievement-item">
            <span className="achievement-year">2023</span>
            <div className="achievement-content">
              <h3>AI Creator of the Year</h3>
              <p>Awarded by AI Innovators Association for contributions to accessible AI tools</p>
            </div>
          </li>
          <li className="achievement-item">
            <span className="achievement-year">2022</span>
            <div className="achievement-content">
              <h3>Top Selling Agent Creator</h3>
              <p>Recognized for developing the most successful data analysis agents on the platform</p>
            </div>
          </li>
          <li className="achievement-item">
            <span className="achievement-year">2021</span>
            <div className="achievement-content">
              <h3>Research Publication</h3>
              <p>Published groundbreaking paper on "Adaptive Prompt Engineering" in top AI journals</p>
            </div>
          </li>
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
                <span className="stat-value">{user.stats.createdAgents}</span>
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
