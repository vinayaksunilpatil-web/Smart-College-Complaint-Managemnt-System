import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smart_complaint_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          // api.js interceptor returns response.data directly, so res = { success, user }
          const res = await api.get('/auth/me');
          if (res && res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to authenticate session:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    fetchUserProfile();
  }, [token]);

  const login = async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role });
    if (res.success && res.token) {
      localStorage.setItem('smart_complaint_token', res.token);
      localStorage.setItem('smart_complaint_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed.');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.token) {
      localStorage.setItem('smart_complaint_token', res.token);
      localStorage.setItem('smart_complaint_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed.');
  };

  const logout = () => {
    localStorage.removeItem('smart_complaint_token');
    localStorage.removeItem('smart_complaint_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
