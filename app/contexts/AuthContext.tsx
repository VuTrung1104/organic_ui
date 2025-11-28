'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    // Initialize state from localStorage
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
  const router = useRouter();

  const login = (newAccessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setAccessToken(newAccessToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Call logout API
    apiService.logout().catch(console.error);
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rememberMe');
    
    setAccessToken(null);
    setIsAuthenticated(false);
    
    // Dùng window.location.href để reload trang hoàn toàn
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, accessToken, login, logout }}>
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
