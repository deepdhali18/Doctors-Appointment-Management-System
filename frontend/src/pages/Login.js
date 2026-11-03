import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-header">
          <i className="fas fa-sign-in-alt" />
          <h2>Welcome Back</h2>
          <p>Login to your account</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="required"><i className="fas fa-envelope" /> Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Enter your email" />
          </div>
          <div className="form-group">
            <label className="required"><i className="fas fa-lock" /> Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Enter your password" />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Login</button>
          <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Forgot Password?</Link>
          </div>
        </form>
        <p className="form-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
