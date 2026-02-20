import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (err) {
      // Not authenticated or token expired
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = useCallback(async (name, email, password) => {
    try {
      setError(null);
      const response = await axios.post(
        `${API_URL}/auth/register`,
        { name, email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser(response.data.data.user);
        return { success: true };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser(response.data.data.user);
        return { success: true };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        return true;
      }
      return false;
    } catch (err) {
      setUser(null);
      return false;
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    refreshToken,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
