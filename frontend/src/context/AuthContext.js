import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI, notificationAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await authAPI.getMe();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const { data } = await notificationAPI.get();
        setNotifications(data);
      } catch {  }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    setUser(data);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {  }
    setUser(null);
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, notifications, setNotifications, unreadCount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
