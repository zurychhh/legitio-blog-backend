import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../api';
import type { User, LoginRequest } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authApi
        .getCurrentUser()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    console.log('[AuthContext] Login started:', credentials.email);
    const response = await authApi.login(credentials);
    console.log('[AuthContext] Login response:', response);
    localStorage.setItem('access_token', response.access_token);

    // Fetch user data after login
    try {
      console.log('[AuthContext] Fetching current user...');
      const userData = await authApi.getCurrentUser();
      console.log('[AuthContext] User data received:', userData);
      setUser(userData);
    } catch (error) {
      // If getCurrentUser fails but we have token, set minimal user
      // This prevents infinite redirect loop
      console.error('[AuthContext] Failed to fetch user data after login:', error);
      console.log('[AuthContext] Setting minimal user with email:', credentials.email);
      setUser({
        id: '',
        email: credentials.email,
        is_superuser: false,
        tenant_id: '',
        is_active: true,
        created_at: new Date().toISOString()
      });
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
