import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marketplaceService } from '../services/api';
import { toast } from 'react-toastify';
import './MarketplacePage.css';

const MarketplacePage = () => {
  const [agents, setAgents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('popular');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketplaceData = async () => {
      try {
        setLoading(true);
        
        // Fetch agents from API
        const agentsResponse = await marketplaceService.getListings();
        
        if (agentsResponse.data && agentsResponse.data.success) {
          const fetchedAgents = agentsResponse.data.data || [];
          setAgents(fetchedAgents);
          
          // Extract categories from agents
          const uniqueCategories = [...new Set(fetchedAgents.map(agent => agent.category))];
          setCategories(uniqueCategories.map(category => ({
            id: category,
            name: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
          })));
        } else {
          toast.error('Failed to load marketplace data');
          setAgents([]);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching marketplace data:', error);
        toast.error('Failed to load marketplace data');
        setAgents([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceData();
  }, []);

  // Apply filters and sorting whenever dependencies change
  useEffect(() => {
    let result = [...agents];
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(agent => agent.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(agent => 
        agent.title?.toLowerCase().includes(query) || 
        agent.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => (a.pricing.amount || 0) - (b.pricing.amount || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.pricing.amount || 0) - (a.pricing.amount || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b._id || 0) - new Date(a._id || 0));
        break;
      case 'popular':
      default:
        result.sort((a, b) => ((b.rating.average || 0) * (b.rating.count || 0)) - 
                             ((a.rating.average || 0) * (a.rating.count || 0)));
        break;
    }
    
    setFilteredAgents(result);
  }, [agents, selectedCategory, searchQuery, sortOption]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  if (loading) {
    return <div className="loading-container">Loading marketplace...</div>;
  }

  return (
    <div className="marketplace-container">
      <header className="marketplace-header">
        <h1>AI Agent Marketplace</h1>
        <p>Discover and deploy pre-built AI agents for your specific needs</p>
      </header>
      
      <div className="marketplace-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="sort-control">
          <label htmlFor="sort">Sort by:</label>
          <select id="sort" value={sortOption} onChange={handleSortChange}>
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
      
      <div className="marketplace-content">
        <aside className="categories-sidebar">
          <h2>Categories</h2>
          <ul className="category-list">
            <li 
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => handleCategoryChange('all')}
            >
              All Categories
            </li>
            {categories.map(category => (
              <li 
                key={category.id}
                className={selectedCategory === category.id ? 'active' : ''}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </aside>
        
        <main className="agents-grid">
          {filteredAgents.length === 0 ? (
            <div className="empty-state">
              <p>No agents found matching your criteria.</p>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setSortOption('popular');
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredAgents.map(agent => (
              <div key={agent._id} className="agent-card">
                <div className="agent-card-header">
                  <h3>{agent.title}</h3>
                  {agent.pricing.type === 'free' ? (
                    <span className="price-tag free">Free</span>
                  ) : agent.pricing.type === 'one-time' ? (
                    <span className="price-tag">${agent.pricing.amount}</span>
                  ) : (
                    <span className="price-tag">${agent.pricing.amount}/mo</span>
                  )}
                </div>
                
                <p className="agent-description">
                  {agent.description}
                </p>
                
                <div className="agent-meta">
                  <span className="category-badge">{agent.category}</span>
                  {agent.rating && (
                    <div className="rating">
                      <span className="stars">{'★'.repeat(Math.round(agent.rating.average))}{'☆'.repeat(5 - Math.round(agent.rating.average))}</span>
                      <span className="count">({agent.rating.count})</span>
                    </div>
                  )}
                </div>
                
                <Link to={`/marketplace/${agent._id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default MarketplacePage;
