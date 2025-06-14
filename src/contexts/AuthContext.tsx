
'use client';

import type { AuthUser, User as StoredUserType } from '@/lib/types'; // Use StoredUserType for full user from storage
import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AuthContextType {
  user: AuthUser | null; // This will hold the sanitized user object for the UI
  isAdmin: boolean;
  login: (userData: AuthUser, isAdmin?: boolean) => void;
  logout: () => void;
  updateAuthUser: (updatedUserData: Partial<AuthUser>) => void; // Partial of sanitized AuthUser
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedUserJSON = localStorage.getItem('reactiverseUser');
      const storedIsAdmin = localStorage.getItem('reactiverseIsAdmin') === 'true';
      if (storedUserJSON) {
        const storedUser = JSON.parse(storedUserJSON) as AuthUser; // Assume stored user is already sanitized
        setUser(storedUser);
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
    // userData here should already be sanitized (no passwordHash or twoFactorPinHash)
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
    // updatedUserData should be partial of the sanitized AuthUser
    setUser(prevUser => {
      if (!prevUser) return null;
      // Ensure that if it's a regular user, the twoFactorEnabled field might be updated
      let newUser: AuthUser;
      if ('id' in prevUser && 'id' in updatedUserData && prevUser.id === updatedUserData.id) { // Regular user update
        newUser = { 
          ...prevUser, 
          ...updatedUserData,
          // Explicitly carry over twoFactorEnabled if present in updatedUserData
          twoFactorEnabled: 'twoFactorEnabled' in updatedUserData 
                              ? updatedUserData.twoFactorEnabled 
                              : ('twoFactorEnabled' in prevUser ? prevUser.twoFactorEnabled : false)
        } as AuthUser; 
      } else if (!('id' in prevUser) && !('id' in updatedUserData) && prevUser.username === updatedUserData.username ) { // Admin update
         newUser = { ...prevUser, ...updatedUserData } as AuthUser;
      }
      else { // Mismatch or unexpected update, fallback to previous user to be safe
        newUser = prevUser;
      }
      
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
