// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_booking: number | null;
  related_service_request: number | null;
  created_at: string;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

const POLL_INTERVAL_MS = 30_000;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get<{ results?: Notification[] } | Notification[]>('notifications/');
      const data = res.data;
      setNotifications(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      // silently ignore errors (token expired, offline, etc.)
    }
  }, [user]);

  // Start/stop polling when user logs in/out
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    fetch();
    intervalRef.current = setInterval(fetch, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, fetch]);

  const markAsRead = async (id: number) => {
    await axios.post(`notifications/${id}/mark_as_read/`);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const markAllAsRead = async () => {
    await axios.post('notifications/mark_all_as_read/');
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, refresh: fetch }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}
