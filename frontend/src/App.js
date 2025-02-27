import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import PrivateRoute from './components/routing/PrivateRoute';
import MainLayout from './components/layout/MainLayout';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MarketplacePage from './pages/MarketplacePage';
import AgentDetailsPage from './pages/AgentDetailsPage';

// Private pages
import DashboardPage from './pages/DashboardPage';
import CreateAgentPage from './pages/CreateAgentPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

import './styles/globals.css';
import './App.css';

function App() {
  const { isAuthenticated } = useAuth();
  const [sidebarState, setSidebarState] = useState({
    collapsed: false,
    hovering: false
  });

  // Save sidebar state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarState(prev => ({
        ...prev,
        collapsed: JSON.parse(savedState)
      }));
    }
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarState.collapsed));
  }, [sidebarState.collapsed]);

  // Handler for sidebar state changes
  const handleSidebarStateChange = (newState) => {
    setSidebarState(prevState => ({
      ...prevState,
      ...newState
    }));
  };

  return (
    <div className="app">
      <Navbar />
      <div className="main-container">
        {isAuthenticated && (
          <Sidebar 
            collapsed={sidebarState.collapsed}
            hovering={sidebarState.hovering}
            onStateChange={handleSidebarStateChange}
          />
        )}
        <main className={`content ${isAuthenticated ? 'with-sidebar' : ''}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/marketplace/:id" element={<AgentDetailsPage />} />

            {/* Private Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/agents/create"
              element={
                <PrivateRoute>
                  <CreateAgentPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
