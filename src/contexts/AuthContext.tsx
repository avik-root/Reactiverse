
'use client';

import type { AuthUser, User } from '@/lib/types';
import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  login: (userData: AuthUser, isAdmin?: boolean) => void;
  logout: () => void;
  updateAuthUser: (updatedUserData: Partial<AuthUser>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('reactiverseUser');
      const storedIsAdmin = localStorage.getItem('reactiverseIsAdmin') === 'true';
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAdmin(storedIsAdmin);
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem('reactiverseUser');
      localStorage.removeItem('reactiverseIsAdmin');
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: AuthUser, adminStatus: boolean = false) => {
    setUser(userData);
    setIsAdmin(adminStatus);
    try {
      localStorage.setItem('reactiverseUser', JSON.stringify(userData));
      localStorage.setItem('reactiverseIsAdmin', String(adminStatus));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAdmin(false);
    try {
      localStorage.removeItem('reactiverseUser');
      localStorage.removeItem('reactiverseIsAdmin');
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
  }, []);

  const updateAuthUser = useCallback((updatedUserData: Partial<AuthUser>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedUserData };
      try {
        localStorage.setItem('reactiverseUser', JSON.stringify(newUser));
      } catch (error) {
        console.error("Failed to update user in localStorage", error);
      }
      return newUser;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, updateAuthUser, isLoading }}>
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
