import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'agrolink_notifications_v1';

// Estructura en localStorage: { [email]: [ { id, title, message, createdAt, read } ] }
const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const [store, setStore] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStore(JSON.parse(raw));
    } catch {
      setStore({});
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {}
  }, [store]);

  const addFor = (email, { title, message, meta }) => {
    if (!email) return;
    const notif = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title: title || 'Recordatorio',
      message: message || '',
      meta: meta || null,
      createdAt: Date.now(),
      read: false,
    };
    setStore((prev) => {
      const list = prev[email] || [];
      return { ...prev, [email]: [notif, ...list] };
    });
  };

  const markRead = (email, id) => setStore((prev) => {
    const list = prev[email] || [];
    return { ...prev, [email]: list.map(n => (n.id === id ? { ...n, read: true } : n)) };
  });

  const markAllRead = (email) => setStore((prev) => {
    const list = prev[email] || [];
    return { ...prev, [email]: list.map(n => ({ ...n, read: true })) };
  });

  const clearFor = (email) => setStore((prev) => ({ ...prev, [email]: [] }));

  const value = useMemo(() => {
    const getFor = (email) => (store[email] || []).slice().sort((a, b) => b.createdAt - a.createdAt);
    const getUnreadCount = (email) => (store[email] || []).filter(n => !n.read).length;
    
    return { addFor, getFor, getUnreadCount, markRead, markAllRead, clearFor };
  }, [store]);

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);

export default NotificationsContext;
