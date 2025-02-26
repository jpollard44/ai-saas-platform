import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  
  // Check if the current path matches the link
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Navigation</h3>
      </div>
      <ul className="sidebar-menu">
        <li className={isActive('/dashboard') ? 'active' : ''}>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li className={isActive('/my-agents') ? 'active' : ''}>
          <Link to="/my-agents">My Agents</Link>
        </li>
        <li className={isActive('/agents/create') ? 'active' : ''}>
          <Link to="/agents/create">Create Agent</Link>
        </li>
        <li className={isActive('/my-listings') ? 'active' : ''}>
          <Link to="/my-listings">My Listings</Link>
        </li>
        <li className={isActive('/my-templates') ? 'active' : ''}>
          <Link to="/my-templates">My Templates</Link>
        </li>
        <li className={isActive('/marketplace') ? 'active' : ''}>
          <Link to="/marketplace">Marketplace</Link>
        </li>
        <li className={isActive('/forum') ? 'active' : ''}>
          <Link to="/forum">Community</Link>
        </li>
        <li className={isActive('/profile') ? 'active' : ''}>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
      <div className="sidebar-footer">
        <p>© 2025 AI Agent Builder</p>
      </div>
    </aside>
  );
};

export default Sidebar;
