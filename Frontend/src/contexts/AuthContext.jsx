import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const AuthContext = createContext(null);

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // Token storage helpers
  const setTokens = useCallback((access, refresh) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }, []);

  const clearTokens = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  const getStoredTokens = useCallback(() => {
    const access = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    return { accessToken: access, refreshToken: refresh };
  }, []);

  // Request interceptor to add Authorization header
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [accessToken]);

  // Response interceptor for automatic token refresh
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const storedRefreshToken = refreshToken || localStorage.getItem('refreshToken');
            
            if (!storedRefreshToken) {
              clearTokens();
              setUser(null);
              return Promise.reject(error);
            }

            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken: storedRefreshToken
            });

            if (response.data.success) {
              const { accessToken: newAccess, refreshToken: newRefresh } = response.data.data;
              setTokens(newAccess, newRefresh);
              
              originalRequest.headers.Authorization = `Bearer ${newAccess}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            clearTokens();
            setUser(null);
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshToken, setTokens, clearTokens]);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { accessToken: storedAccess, refreshToken: storedRefresh } = getStoredTokens();
      
      if (storedAccess && storedRefresh) {
        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);
        
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedAccess}`
          }
        });
        
        if (response.data.success) {
          setUser(response.data.data.user);
        }
      }
    } catch (err) {
      clearTokens();
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
        { name, email, password }
      );

      if (response.data.success) {
        const { user: userData, accessToken: access, refreshToken: refresh } = response.data.data;
        setTokens(access, refresh);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [setTokens]);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password }
      );

      if (response.data.success) {
        const { user: userData, accessToken: access, refreshToken: refresh } = response.data.data;
        setTokens(access, refresh);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [setTokens]);

  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearTokens();
      setUser(null);
    }
  }, [accessToken, clearTokens]);

  const refreshTokenFunc = useCallback(async () => {
    try {
      const storedRefreshToken = refreshToken || localStorage.getItem('refreshToken');
      
      if (!storedRefreshToken) {
        return false;
      }

      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        { refreshToken: storedRefreshToken }
      );

      if (response.data.success) {
        const { accessToken: newAccess, refreshToken: newRefresh } = response.data.data;
        setTokens(newAccess, newRefresh);
        return true;
      }
      return false;
    } catch (err) {
      clearTokens();
      setUser(null);
      return false;
    }
  }, [refreshToken, setTokens, clearTokens]);

  const value = {
    user,
    loading,
    error,
    accessToken,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    refreshToken: refreshTokenFunc,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
