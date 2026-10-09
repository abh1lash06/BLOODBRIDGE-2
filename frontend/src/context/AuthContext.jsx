import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/api/auth.api';
import { STORAGE_KEYS } from '@/lib/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || null;
  });

  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setToken(null);
    setUser(null);
  }, []);

  // Listen for 401 unauthorized event from apiClient
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('bloodbridge:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('bloodbridge:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Restore and verify user profile on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userProfile = await authApi.getMe();
        setUser(userProfile);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userProfile));
      } catch (err) {
        // If getting profile fails (e.g., token expired), logout
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [logout]);

  const login = useCallback(async (credentials) => {
    const loginResponse = await authApi.login(credentials);
    const { token: receivedToken, ...userData } = loginResponse;

    localStorage.setItem(STORAGE_KEYS.TOKEN, receivedToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

    setToken(receivedToken);
    setUser(userData);

    return loginResponse;
  }, []);

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
