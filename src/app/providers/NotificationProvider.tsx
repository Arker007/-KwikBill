import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, ENDPOINTS } from '../../services/api';

export interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

export interface UpdateInfo {
  updateAvailable: boolean;
  latest?: string;
  current?: string;
  releaseUrl?: string;
  notes?: string;
}

export interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  updateInfo: UpdateInfo | null;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  checkUpdates: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  const addNotification = (notification: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const newNotif: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const checkUpdates = async () => {
    try {
      const data = await apiClient.get<UpdateInfo>(ENDPOINTS.CHECK_UPDATE);
      setUpdateInfo(data);
    } catch {
      /* offline — quietly skip */
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkUpdates();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        updateInfo,
        addNotification,
        markAsRead,
        clearNotifications,
        checkUpdates,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
