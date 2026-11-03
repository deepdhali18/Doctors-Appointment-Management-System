import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const { notifications, setNotifications, unreadCount } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="notification-bell" ref={ref}>
      <button className="bell-btn" onClick={() => setOpen(!open)}>
        <i className="fas fa-bell" />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && <button onClick={markAllRead} className="mark-all-btn">Mark all read</button>}
          </div>
          <div className="notification-list">
            {notifications.length === 0 && <p className="no-notif">No notifications</p>}
            {notifications.map((n) => (
              <div key={n._id} className={`notification-item ${!n.read ? 'unread' : ''}`} onClick={() => markRead(n._id)}>
                <i className={`fas fa-${n.type === 'success' ? 'check-circle' : n.type === 'error' ? 'times-circle' : 'info-circle'}`} />
                <p>{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
