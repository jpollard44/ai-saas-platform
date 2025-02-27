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
        // Get user ID from localStorage
        const userId = localStorage.getItem('userId');
        
        if (userId) {
          setUser({
            id: userId,
            // Other user data can be fetched from the backend if needed
          });
          setIsAuthenticated(true);
        } else {
          // If we have a token but no userId, try to verify the token
          try {
            const response = await axios.get('/api/users/verify-token');
            if (response.data && response.data.success) {
              // Store the user ID
              localStorage.setItem('userId', response.data.user.id);
              setUser({
                id: response.data.user.id,
                name: response.data.user.name,
                email: response.data.user.email
              });
              setIsAuthenticated(true);
            }
          } catch (verifyError) {
            console.error('Token verification failed:', verifyError);
            localStorage.removeItem('token');
            setToken(null);
            setIsAuthenticated(false);
          }
        }
        
        setLoading(false);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setToken(null);
        setUser(null);
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
      localStorage.setItem('userId', res.data.userId);
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
      localStorage.setItem('userId', res.data.userId);
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
    localStorage.removeItem('userId');
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
