import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Here we would normally make a request to the backend to get user data
        // For now, we'll just use the token to indicate authenticated status
        setIsAuthenticated(true);
        setLoading(false);
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
        setError(err.response?.data?.error || 'An error occurred');
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/api/users/register', userData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser({ id: res.data.userId });
      setIsAuthenticated(true);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
      setLoading(false);
      throw err;
    }
  };

  // Login user
  const login = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/api/users/login', userData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser({ id: res.data.userId });
      setIsAuthenticated(true);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
      setLoading(false);
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.put('/api/users/profile', profileData);
      setUser({ ...user, ...res.data.data });
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
      setLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
