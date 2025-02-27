import React, { useState } from 'react';
import './AgentFilters.css';

const AgentFilters = ({ 
  onFilterChange, 
  onSortChange, 
  onSearchChange,
  onTagsChange,
  onModelChange,
  initialFilters = {} 
}) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || '');
  const [filterStatus, setFilterStatus] = useState(initialFilters.status || 'all');
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'newest');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTags, setSelectedTags] = useState(initialFilters.tags || []);
  const [selectedModels, setSelectedModels] = useState(initialFilters.models || []);
  const [dateRange, setDateRange] = useState({
    from: initialFilters.dateFrom || '',
    to: initialFilters.dateTo || ''
  });

  // Sample tag and model options - in a real app, these would come from the API
  const tagOptions = [
    'Customer Support', 'Sales', 'Marketing', 'Technical', 'HR', 
    'Finance', 'Legal', 'Education', 'Healthcare', 'E-commerce'
  ];
  
  const modelOptions = [
    'GPT-4', 'GPT-3.5', 'Claude', 'Llama', 'Mistral', 'Custom'
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setFilterStatus(value);
    if (onFilterChange) {
      onFilterChange({ status: value });
    }
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  const handleTagToggle = (tag) => {
    let newTags;
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter(t => t !== tag);
    } else {
      newTags = [...selectedTags, tag];
    }
    setSelectedTags(newTags);
    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  const handleModelToggle = (model) => {
    let newModels;
    if (selectedModels.includes(model)) {
      newModels = selectedModels.filter(m => m !== model);
    } else {
      newModels = [...selectedModels, model];
    }
    setSelectedModels(newModels);
    if (onModelChange) {
      onModelChange(newModels);
    }
  };

  const handleDateChange = (type, value) => {
    const newDateRange = { ...dateRange, [type]: value };
    setDateRange(newDateRange);
    if (onFilterChange) {
      onFilterChange({ 
        dateFrom: newDateRange.from, 
        dateTo: newDateRange.to 
      });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setSortBy('newest');
    setSelectedTags([]);
    setSelectedModels([]);
    setDateRange({ from: '', to: '' });
    
    if (onSearchChange) onSearchChange('');
    if (onFilterChange) onFilterChange({ status: 'all', dateFrom: '', dateTo: '' });
    if (onSortChange) onSortChange('newest');
    if (onTagsChange) onTagsChange([]);
    if (onModelChange) onModelChange([]);
  };

  return (
    <div className="agent-filters">
      <div className="filters-row">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-controls">
          <select 
            value={filterStatus} 
            onChange={handleStatusChange}
            className="filter-dropdown"
          >
            <option value="all">All Statuses</option>
            <option value="deployed">Deployed</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={handleSortChange}
            className="sort-dropdown"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="usage">Most Used</option>
            <option value="performance">Best Performing</option>
          </select>
          
          <button 
            className="advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide Advanced' : 'Advanced Filters'}
          </button>
        </div>
      </div>
      
      {showAdvanced && (
        <div className="advanced-filters">
          <div className="filter-section">
            <h4>Filter by Tags</h4>
            <div className="tag-options">
              {tagOptions.map(tag => (
                <div 
                  key={tag} 
                  className={`tag-option ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Filter by Model</h4>
            <div className="model-options">
              {modelOptions.map(model => (
                <div 
                  key={model} 
                  className={`model-option ${selectedModels.includes(model) ? 'selected' : ''}`}
                  onClick={() => handleModelToggle(model)}
                >
                  {model}
                </div>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Filter by Date</h4>
            <div className="date-range">
              <div className="date-input">
                <label>From</label>
                <input 
                  type="date" 
                  value={dateRange.from}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                />
              </div>
              <div className="date-input">
                <label>To</label>
                <input 
                  type="date" 
                  value={dateRange.to}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <button className="clear-filters" onClick={handleClearFilters}>
            Clear All Filters
          </button>
        </div>
      )}
      
      {(selectedTags.length > 0 || selectedModels.length > 0 || dateRange.from || dateRange.to) && (
        <div className="active-filters">
          <span className="active-filters-label">Active Filters:</span>
          
          {selectedTags.map(tag => (
            <div key={tag} className="active-filter-tag">
              {tag}
              <button onClick={() => handleTagToggle(tag)}>×</button>
            </div>
          ))}
          
          {selectedModels.map(model => (
            <div key={model} className="active-filter-tag model">
              {model}
              <button onClick={() => handleModelToggle(model)}>×</button>
            </div>
          ))}
          
          {dateRange.from && (
            <div className="active-filter-tag date">
              From: {dateRange.from}
              <button onClick={() => handleDateChange('from', '')}>×</button>
            </div>
          )}
          
          {dateRange.to && (
            <div className="active-filter-tag date">
              To: {dateRange.to}
              <button onClick={() => handleDateChange('to', '')}>×</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentFilters;
