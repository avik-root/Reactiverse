
'use client';

import type { AuthUser, User } from '@/lib/types';
import { useState, useEffect, useCallback, createContext, useContext, type ReactNode, type FC } from 'react'; // Changed import
import { logoutAdminAction } from '@/lib/actions';

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  login: (userData: AuthUser, isAdmin?: boolean) => void;
  logout: () => Promise<void>;
  updateAuthUser: (updatedUserDataOrFn: Partial<AuthUser> | ((currentUser: AuthUser | null) => AuthUser | null) ) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedUserJSON = localStorage.getItem('reactiverseUser');
      const storedIsAdmin = localStorage.getItem('reactiverseIsAdmin') === 'true';
      if (storedUserJSON) {
        const storedUser = JSON.parse(storedUserJSON) as AuthUser;
        // Ensure isVerified defaults if missing from older localStorage
        if (!storedIsAdmin && storedUser && !('isVerified' in storedUser)) {
            (storedUser as User).isVerified = false;
        }
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
    setIsLoading(true);
    // Ensure isVerified default for non-admin users on login
    let finalUserData = userData;
    if (!adminStatus && finalUserData && !('isVerified' in finalUserData)) {
        (finalUserData as User).isVerified = false;
    }
    setUser(finalUserData);
    setIsAdmin(adminStatus);
    try {
      localStorage.setItem('reactiverseUser', JSON.stringify(finalUserData));
      localStorage.setItem('reactiverseIsAdmin', String(adminStatus));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
    setIsLoading(false);
  }, []); 

  const logout = useCallback(async () => {
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
  }, [isAdmin]); 

  const updateAuthUser = useCallback((updatedUserDataOrFn: Partial<AuthUser> | ((currentUser: AuthUser | null) => AuthUser | null) ) => {
    setUser(prevUser => {
      let newUser: AuthUser | null;
      if (typeof updatedUserDataOrFn === 'function') {
        newUser = updatedUserDataOrFn(prevUser);
      } else {
        if (!prevUser) return null; 
        newUser = { ...prevUser, ...updatedUserDataOrFn } as AuthUser;
      }
      
      // Ensure isVerified defaults for non-admin users during update
      if (newUser && !newUser.isAdmin && !('isVerified' in newUser)) {
        (newUser as User).isVerified = false;
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

