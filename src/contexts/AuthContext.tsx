
'use client';

import type { AuthUser } from '@/lib/types';
import * as React from 'react'; // Changed to import React namespace
import { logoutAdminAction } from '@/lib/actions';

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  login: (userData: AuthUser, isAdmin?: boolean) => void;
  logout: () => Promise<void>;
  updateAuthUser: (updatedUserDataOrFn: Partial<AuthUser> | ((currentUser: AuthUser | null) => AuthUser | null) ) => void;
  isLoading: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    setIsLoading(true);
    try {
      const storedUserJSON = localStorage.getItem('reactiverseUser');
      const storedIsAdmin = localStorage.getItem('reactiverseIsAdmin') === 'true';
      if (storedUserJSON) {
        const storedUser = JSON.parse(storedUserJSON) as AuthUser;
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

  const login = React.useCallback((userData: AuthUser, adminStatus: boolean = false) => {
    setIsLoading(true);
    setUser(userData);
    setIsAdmin(adminStatus);
    try {
      localStorage.setItem('reactiverseUser', JSON.stringify(userData));
      localStorage.setItem('reactiverseIsAdmin', String(adminStatus));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
    setIsLoading(false);
  }, []); // Setters from React.useState are stable, so an empty array is fine

  const logout = React.useCallback(async () => {
    setIsLoading(true);
    const currentIsAdminStatus = isAdmin; 

    setUser(null);
    setIsAdmin(false);

    try {
      localStorage.removeItem('reactiverseUser');
      localStorage.removeItem('reactiverseIsAdmin');

      if (currentIsAdminStatus) {
        await logoutAdminAction();
      }
    } catch (error) {
      console.error("Error during logout process:", error);
    }
    setIsLoading(false);
  }, [isAdmin]); // isAdmin is a dependency here

  const updateAuthUser = React.useCallback((updatedUserDataOrFn: Partial<AuthUser> | ((currentUser: AuthUser | null) => AuthUser | null) ) => {
    setUser(prevUser => {
      let newUser: AuthUser | null;
      if (typeof updatedUserDataOrFn === 'function') {
        newUser = updatedUserDataOrFn(prevUser);
      } else {
        if (!prevUser) return null; 
        newUser = { ...prevUser, ...updatedUserDataOrFn } as AuthUser;
      }

      if (newUser) {
        try {
          localStorage.setItem('reactiverseUser', JSON.stringify(newUser));
        } catch (error) {
          console.error("Failed to update user in localStorage", error);
        }
      } else {
         localStorage.removeItem('reactiverseUser'); 
      }
      return newUser;
    });
  }, []); // setUser is stable


  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, updateAuthUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
