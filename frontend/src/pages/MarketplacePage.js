import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marketplaceService } from '../services/api';
import { toast } from 'react-toastify';
import './MarketplacePage.css';

// Mock data for initial development
const mockCategories = [
  { id: 'productivity', name: 'Productivity', count: 42 },
  { id: 'customer-service', name: 'Customer Service', count: 38 },
  { id: 'marketing', name: 'Marketing', count: 29 },
  { id: 'analytics', name: 'Analytics', count: 24 },
  { id: 'creative', name: 'Creative', count: 19 },
  { id: 'development', name: 'Development', count: 16 },
  { id: 'education', name: 'Education', count: 13 },
  { id: 'finance', name: 'Finance', count: 10 }
];

const mockAgents = [
  {
    id: 1,
    name: 'Customer Support Pro',
    description: 'Advanced AI assistant for handling customer inquiries with empathy and precision.',
    creator: { id: 101, name: 'TechSupport Inc.' },
    category: 'customer-service',
    rating: 4.8,
    reviewCount: 124,
    pricing: { type: 'subscription', amount: 19.99 },
    image: '/images/agents/customer-support.jpg',
    featured: true
  },
  {
    id: 2,
    name: 'Content Wizard',
    description: 'Generate blog posts, social media content, and marketing copy with a single prompt.',
    creator: { id: 102, name: 'ContentGenius' },
    category: 'marketing',
    rating: 4.7,
    reviewCount: 98,
    pricing: { type: 'subscription', amount: 24.99 },
    image: '/images/agents/content-wizard.jpg',
    featured: true
  },
  {
    id: 3,
    name: 'Data Insights',
    description: 'Transform raw data into actionable insights with natural language queries.',
    creator: { id: 103, name: 'AnalyticsMaster' },
    category: 'analytics',
    rating: 4.9,
    reviewCount: 87,
    pricing: { type: 'subscription', amount: 29.99 },
    image: '/images/agents/data-insights.jpg',
    featured: true
  },
  {
    id: 4,
    name: 'Code Assistant',
    description: 'Your AI pair programmer that helps write, debug, and explain code.',
    creator: { id: 104, name: 'DevTools' },
    category: 'development',
    rating: 4.6,
    reviewCount: 76,
    pricing: { type: 'one-time', amount: 99.99 },
    image: '/images/agents/code-assistant.jpg',
    featured: false
  },
  {
    id: 5,
    name: 'Email Composer',
    description: 'Draft perfect emails for any situation with the right tone and content.',
    creator: { id: 105, name: 'ProductivityPro' },
    category: 'productivity',
    rating: 4.5,
    reviewCount: 62,
    pricing: { type: 'free', amount: 0 },
    image: '/images/agents/email-composer.jpg',
    featured: false
  },
  {
    id: 6,
    name: 'Virtual Tutor',
    description: 'Personalized learning assistant that adapts to your knowledge and learning style.',
    creator: { id: 106, name: 'EduTech' },
    category: 'education',
    rating: 4.7,
    reviewCount: 53,
    pricing: { type: 'subscription', amount: 14.99 },
    image: '/images/agents/virtual-tutor.jpg',
    featured: false
  },
  {
    id: 7,
    name: 'Financial Advisor',
    description: 'Get personalized financial advice and portfolio management recommendations.',
    creator: { id: 107, name: 'FinWise' },
    category: 'finance',
    rating: 4.4,
    reviewCount: 41,
    pricing: { type: 'subscription', amount: 39.99 },
    image: '/images/agents/financial-advisor.jpg',
    featured: false
  },
  {
    id: 8,
    name: 'Creative Writer',
    description: 'Generate stories, poems, and creative content in any style or genre.',
    creator: { id: 108, name: 'StoryForge' },
    category: 'creative',
    rating: 4.8,
    reviewCount: 39,
    pricing: { type: 'subscription', amount: 12.99 },
    image: '/images/agents/creative-writer.jpg',
    featured: false
  }
];

// Fallback image for agents without images
const DEFAULT_AGENT_IMAGE = '/images/agent-placeholder.png';

const MarketplacePage = () => {
  const [agents, setAgents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarketplaceData = async () => {
      try {
        setLoading(true);
        
        // Get all marketplace listings
        const listingsResponse = await marketplaceService.getListings();
        
        if (listingsResponse.data && listingsResponse.data.success) {
          setAgents(listingsResponse.data.data);
        } else {
          // Fallback to mock data if API fails
          setAgents(mockAgents);
          console.warn('Using mock agent data due to API response format');
        }
        
        // Get categories
        const categoriesResponse = await marketplaceService.getCategories();
        
        if (categoriesResponse.data && categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.data);
        } else {
          // Fallback to mock categories if API fails
          setCategories(mockCategories);
          console.warn('Using mock category data due to API response format');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching marketplace data:', error);
        setError('Failed to load marketplace data. Please try again later.');
        // Fallback to mock data
        setAgents(mockAgents);
        setCategories(mockCategories);
        setLoading(false);
        toast.error('Failed to load marketplace data');
      }
    };

    fetchMarketplaceData();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Filter agents based on search query and selected category
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort agents based on selected sort option
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        return b.featured - a.featured;
      case 'newest':
        return b.id - a.id;
      case 'price-low':
        return a.pricing.amount - b.pricing.amount;
      case 'price-high':
        return b.pricing.amount - a.pricing.amount;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  if (loading) {
    return <div className="loading-container">Loading marketplace...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <h1>AI Agent Marketplace</h1>
        <p className="marketplace-subtitle">
          Discover and subscribe to intelligent agents created by our community
        </p>
      </div>

      <div className="marketplace-layout">
        {/* Sidebar with filters */}
        <div className="marketplace-sidebar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filter-section">
            <h3>Categories</h3>
            <ul className="category-list">
              <li 
                className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                <span className="category-name">All Categories</span>
                <span className="category-count">{agents.length}</span>
              </li>
              {categories.map(category => (
                <li 
                  key={category.id}
                  className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <span className="category-name">{category.name}</span>
                  <span className="category-count">{category.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-section">
            <h3>Price</h3>
            <div className="price-filters">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Free</span>
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Paid</span>
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h3>Rating</h3>
            <div className="rating-filters">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>4+ Stars</span>
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>3+ Stars</span>
              </label>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="marketplace-content">
          <div className="marketplace-toolbar">
            <div className="results-count">
              {filteredAgents.length} {filteredAgents.length === 1 ? 'agent' : 'agents'} found
            </div>
            <div className="sort-controls">
              <label htmlFor="sort-select">Sort by:</label>
              <select 
                id="sort-select" 
                value={sortBy}
                onChange={handleSortChange}
                className="sort-select"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Featured agents section (only shown when not filtering) */}
          {selectedCategory === 'all' && searchQuery === '' && (
            <div className="featured-agents">
              <h2>Featured Agents</h2>
              <div className="featured-agents-grid">
                {agents.filter(agent => agent.featured).map(agent => (
                  <Link to={`/marketplace/${agent.id}`} key={agent.id} className="featured-agent-card">
                    <div className="featured-agent-image">
                      <img src={agent.image || DEFAULT_AGENT_IMAGE} alt={agent.name} />
                      <div className="featured-badge">Featured</div>
                    </div>
                    <div className="featured-agent-content">
                      <h3>{agent.name}</h3>
                      <p className="featured-agent-description">{agent.description}</p>
                      <div className="featured-agent-meta">
                        <div className="agent-rating">
                          <span className="star">★</span> {agent.rating} ({agent.reviewCount})
                        </div>
                        <div className="agent-creator">
                          By {agent.creator.name}
                        </div>
                      </div>
                      <div className="agent-price">
                        {agent.pricing.type === 'free' ? (
                          <span className="price-free">Free</span>
                        ) : agent.pricing.type === 'one-time' ? (
                          <span className="price-paid">${agent.pricing.amount}</span>
                        ) : (
                          <span className="price-paid">${agent.pricing.amount}/mo</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All agents grid */}
          <div className="agents-grid">
            {sortedAgents.length > 0 ? (
              sortedAgents.map(agent => (
                <Link to={`/marketplace/${agent.id}`} key={agent.id} className="agent-card">
                  <div className="agent-image">
                    <img src={agent.image || DEFAULT_AGENT_IMAGE} alt={agent.name} />
                  </div>
                  <div className="agent-content">
                    <h3>{agent.name}</h3>
                    <p className="agent-description">{agent.description}</p>
                    <div className="agent-meta">
                      <div className="agent-rating">
                        <span className="star">★</span> {agent.rating} ({agent.reviewCount})
                      </div>
                      <div className="agent-category">
                        {categories.find(c => c.id === agent.category)?.name || agent.category}
                      </div>
                    </div>
                    <div className="agent-footer">
                      <div className="agent-creator">
                        By {agent.creator.name}
                      </div>
                      <div className="agent-price">
                        {agent.pricing.type === 'free' ? (
                          <span className="price-free">Free</span>
                        ) : agent.pricing.type === 'one-time' ? (
                          <span className="price-paid">${agent.pricing.amount}</span>
                        ) : (
                          <span className="price-paid">${agent.pricing.amount}/mo</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-results">
                <p>No agents found matching your criteria. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
