import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ collapsed, hovering, onStateChange }) => {
  const location = useLocation();
  
  // Check if the current path matches the link
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Function to toggle collapsed state
  const toggleSidebar = () => {
    onStateChange({ collapsed: !collapsed });
  };

  // Detect if we're on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        onStateChange({ collapsed: true });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial render
    
    return () => window.removeEventListener('resize', handleResize);
  }, [onStateChange]);

  // Handlers for hover state
  const handleMouseEnter = () => {
    onStateChange({ hovering: true });
  };

  const handleMouseLeave = () => {
    onStateChange({ hovering: false });
  };

  // Determine classes for the sidebar
  const sidebarClasses = `sidebar ${collapsed ? 'collapsed' : ''} ${hovering ? 'hovered' : ''}`;

  return (
    <aside 
      className={sidebarClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-header">
        <h3>Navigation</h3>
        <button className="collapse-toggle" onClick={toggleSidebar}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>
      <ul className="sidebar-menu">
        <li className={isActive('/dashboard') ? 'active' : ''}>
          <Link to="/dashboard">
            <span className="icon">📊</span>
            <span className="text">Dashboard</span>
          </Link>
        </li>
        <li className={isActive('/my-agents') ? 'active' : ''}>
          <Link to="/my-agents">
            <span className="icon">🤖</span>
            <span className="text">My Agents</span>
          </Link>
        </li>
        <li className={isActive('/agents/create') ? 'active' : ''}>
          <Link to="/agents/create">
            <span className="icon">➕</span>
            <span className="text">Create Agent</span>
          </Link>
        </li>
        <li className={isActive('/my-listings') ? 'active' : ''}>
          <Link to="/my-listings">
            <span className="icon">📋</span>
            <span className="text">My Listings</span>
          </Link>
        </li>
        <li className={isActive('/my-templates') ? 'active' : ''}>
          <Link to="/my-templates">
            <span className="icon">📝</span>
            <span className="text">My Templates</span>
          </Link>
        </li>
        <li className={isActive('/marketplace') ? 'active' : ''}>
          <Link to="/marketplace">
            <span className="icon">🛒</span>
            <span className="text">Marketplace</span>
          </Link>
        </li>
        <li className={isActive('/forum') ? 'active' : ''}>
          <Link to="/forum">
            <span className="icon">💬</span>
            <span className="text">Community</span>
          </Link>
        </li>
        <li className={isActive('/profile') ? 'active' : ''}>
          <Link to="/profile">
            <span className="icon">👤</span>
            <span className="text">Profile</span>
          </Link>
        </li>
      </ul>
      <div className="sidebar-footer">
        <p> 2025 AI Agent Builder</p>
      </div>
    </aside>
  );
};

export default Sidebar;
