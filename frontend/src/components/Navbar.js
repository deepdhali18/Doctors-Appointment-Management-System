import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = () => {
    const links = [{ to: '/', label: 'Home', icon: 'fa-home' }];

    if (!user) {
      links.push({ to: '/login', label: 'Login', icon: 'fa-sign-in-alt' });
      links.push({ to: '/register', label: 'Register', icon: 'fa-user-plus' });
    }

    if (user) {
      if (user.role === 'user' || user.role === 'admin') {
        links.push({ to: '/doctors', label: 'Doctors', icon: 'fa-user-md' });
      }
      if (user.role !== 'admin') {
        links.push({ to: '/appointments', label: 'Appointments', icon: 'fa-calendar-check' });
      }

      if (user.role === 'user' || user.role === 'doctor') {
        links.push({ to: '/apply-doctor', label: user.role === 'doctor' ? 'Doctor Profile' : 'Apply as Doctor', icon: 'fa-stethoscope' });
      }

      links.push({ to: '/profile', label: 'Profile', icon: 'fa-user' });

      if (user.role === 'admin') {
        links.push({ to: '/admin', label: 'Admin', icon: 'fa-shield-alt' });
      }
    }

    return links;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <i className="fas fa-heartbeat" /> MediConnect
        </Link>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`} />
        </button>
        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          {navLinks().map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              <i className={`fas ${link.icon}`} /> {link.label}
            </Link>
          ))}
          {user && (
            <>
              <NotificationBell />
              <button onClick={handleLogout} className="nav-link logout-btn">
                <i className="fas fa-sign-out-alt" /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
