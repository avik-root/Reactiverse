'use client';

import type { AuthUser } from '@/lib/types';
import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  login: (userData: AuthUser, isAdmin?: boolean) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Attempt to load user from localStorage on initial load
    try {
      const storedUser = localStorage.getItem('reactiverseUser');
      const storedIsAdmin = localStorage.getItem('reactiverseIsAdmin') === 'true';
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAdmin(storedIsAdmin);
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      // Clear potentially corrupted data
      localStorage.removeItem('reactiverseUser');
      localStorage.removeItem('reactiverseIsAdmin');
    }
    setIsLoading(false);
  }, []);

  const login = (userData: AuthUser, adminStatus: boolean = false) => {
    setUser(userData);
    setIsAdmin(adminStatus);
    try {
      localStorage.setItem('reactiverseUser', JSON.stringify(userData));
      localStorage.setItem('reactiverseIsAdmin', String(adminStatus));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    try {
      localStorage.removeItem('reactiverseUser');
      localStorage.removeItem('reactiverseIsAdmin');
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
