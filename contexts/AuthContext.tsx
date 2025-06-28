

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole } from '../types';
import { mockApiService } from '../services/mockApiService';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  login: (email: string, password_DO_NOT_USE: string) => Promise<boolean>; // Password should not be handled this way in real app
  signup: (username: string, email: string, password_DO_NOT_USE: string) => Promise<boolean>;
  logout: () => void;
  loadingAuth: boolean;
  updateUserContext: (updatedUser: User) => void;
  subscribeUser: () => Promise<void>;
  followAuthor: (authorId: string) => Promise<void>;
  unfollowAuthor: (authorId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { addToast } = useNotification();

  const loadUserFromStorage = useCallback(async () => {
    setLoadingAuth(true);
    const storedUser = await mockApiService.checkSession(); // Simulate checking session
    if (storedUser) {
      setUser(storedUser);
    }
    setLoadingAuth(false);
  }, []);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const login = async (email: string, password_DO_NOT_USE: string): Promise<boolean> => {
    setLoadingAuth(true);
    try {
      const loggedInUser = await mockApiService.login(email, password_DO_NOT_USE);
      if (loggedInUser) {
        setUser(loggedInUser);
        addToast({ message: `Welcome back, ${loggedInUser.username}!`, type: 'success' });
        setLoadingAuth(false);
        return true;
      }
      addToast({ message: 'Login failed. Please check your credentials.', type: 'error' });
    } catch (error) {
      addToast({ message: 'Login error. Please try again.', type: 'error' });
    }
    setLoadingAuth(false);
    return false;
  };

  const signup = async (username: string, email: string, password_DO_NOT_USE: string): Promise<boolean> => {
    setLoadingAuth(true);
    try {
      const newUser = await mockApiService.signup(username, email, password_DO_NOT_USE, UserRole.USER);
      if (newUser) {
        setUser(newUser);
        addToast({ message: `Account created successfully! Welcome, ${newUser.username}!`, type: 'success' });
        setLoadingAuth(false);
        return true;
      }
       addToast({ message: 'Signup failed. Email might already be in use.', type: 'error' });
    } catch (error) {
      addToast({ message: 'Signup error. Please try again.', type: 'error' });
    }
    setLoadingAuth(false);
    return false;
  };

  const logout = async () => {
    setLoadingAuth(true);
    await mockApiService.logout();
    setUser(null);
    addToast({ message: 'You have been logged out.', type: 'info' });
    setLoadingAuth(false);
  };
  
  const updateUserContext = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const subscribeUser = async () => {
    if (!user) {
      addToast({ message: 'You must be logged in to subscribe.', type: 'warning' });
      return;
    }
    try {
      const updatedUser = await mockApiService.subscribeUser(user.id);
      updateUserContext(updatedUser);
      addToast({ message: 'Subscription successful! Welcome to Premium!', type: 'success' });
    } catch (error) {
      addToast({ message: 'Subscription failed. Please try again.', type: 'error' });
    }
  };
  
  const followAuthor = async (authorId: string) => {
      if (!user) {
          addToast({ message: "You must be logged in to follow authors.", type: "warning"});
          return;
      }
      if (user.id === authorId) {
          addToast({ message: "You cannot follow yourself.", type: "warning"});
          return;
      }
      try {
          const updatedUser = await mockApiService.followAuthor(user.id, authorId);
          updateUserContext(updatedUser);
          addToast({ message: `You are now following this author!`, type: 'success' });
      } catch (error) {
          addToast({ message: `Failed to follow author.`, type: 'error' });
      }
  };

  const unfollowAuthor = async (authorId: string) => {
      if (!user) return;
      try {
          const updatedUser = await mockApiService.unfollowAuthor(user.id, authorId);
          updateUserContext(updatedUser);
          addToast({ message: `You have unfollowed this author.`, type: 'info' });
      } catch (error) {
          addToast({ message: `Failed to unfollow author.`, type: 'error' });
      }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loadingAuth, updateUserContext, subscribeUser, followAuthor, unfollowAuthor }}>
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
