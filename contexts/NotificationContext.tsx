
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Notification } from '../types';
import { mockApiService } from '../services/mockApiService';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
}

interface NotificationContextType {
  // Persistent notifications
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotificationsForUser: (userId: string | null) => Promise<void>;
  markAllAsRead: (userId: string | null) => Promise<void>;
  
  // Ephemeral toast messages
  toasts: ToastMessage[];
  addToast: (notification: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for persistent notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // State for toast messages
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // --- Persistent Notification Logic ---
  const fetchNotificationsForUser = useCallback(async (userId: string | null) => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const userNotifications = await mockApiService.getNotifications(userId);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const markAllAsRead = async (userId: string | null) => {
    if (!userId) return;
    try {
        const updatedNotifications = await mockApiService.markAllNotificationsAsRead(userId);
        setNotifications(updatedNotifications);
        setUnreadCount(0);
    } catch(error) {
        addToast({ message: "Failed to mark notifications as read.", type: 'error'});
    }
  };

  // --- Toast Message Logic ---
  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const newToast: ToastMessage = {
      ...toast,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value = {
      notifications,
      unreadCount,
      loading,
      fetchNotificationsForUser,
      markAllAsRead,
      toasts,
      addToast,
      removeToast
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
