'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('accessToken');
    }
    return false;
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated && accessToken) {
        try {
          const profile = await apiService.getProfile();
          setUser(profile);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [isAuthenticated, accessToken]);

  const isAdmin = user?.role?.name === 'ADMIN' || user?.role?.name === 'admin';

  const refreshUser = async () => {
    if (isAuthenticated) {
      try {
        const profile = await apiService.getProfile();
        setUser(profile);
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
      }
    }
  };

  const login = (newAccessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setAccessToken(newAccessToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    apiService.logout().catch(console.error);

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rememberMe');
    
    setAccessToken(null);
    setIsAuthenticated(false);
    setUser(null);

    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      accessToken, 
      user, 
      isAdmin, 
      loading, 
      login, 
      logout, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
