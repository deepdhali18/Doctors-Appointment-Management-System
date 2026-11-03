import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Your Health, Our Priority</h1>
          <p>Book appointments with trusted doctors easily and securely.</p>
          {!user ? (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-outline">Login</Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/doctors" className="btn btn-primary">Find a Doctor</Link>
              <Link to="/appointments" className="btn btn-outline">My Appointments</Link>
            </div>
          )}
        </div>
        <div className="hero-image">
          <i className="fas fa-hospital" />
        </div>
      </section>

      <section className="features">
        <h2>Why Choose Us?</h2>
        <p>Everything you need for seamless healthcare management</p>
        <div className="feature-cards">
          <div className="feature-card">
            <i className="fas fa-user-md" />
            <h3>Expert Doctors</h3>
            <p>Verified and experienced healthcare professionals.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-calendar-alt" />
            <h3>Easy Booking</h3>
            <p>Schedule appointments in just a few clicks.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-shield-alt" />
            <h3>Secure & Private</h3>
            <p>Your data is protected with industry-standard security.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-clock" />
            <h3>24/7 Access</h3>
            <p>Manage your appointments anytime, anywhere.</p>
          </div>
        </div>
      </section>

      {user && (
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            {(user.role === 'user' || user.role === 'admin') && (
              <Link to="/doctors" className="action-card">
                <i className="fas fa-search" />
                <span>Browse Doctors</span>
              </Link>
            )}
            {user.role !== 'admin' && (
              <Link to="/appointments" className="action-card">
                <i className="fas fa-calendar-check" />
                <span>My Appointments</span>
              </Link>
            )}
            <Link to="/profile" className="action-card">
              <i className="fas fa-user-circle" />
              <span>My Profile</span>
            </Link>
            {user.role === 'user' && (
              <Link to="/apply-doctor" className="action-card">
                <i className="fas fa-stethoscope" />
                <span>Apply as Doctor</span>
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
