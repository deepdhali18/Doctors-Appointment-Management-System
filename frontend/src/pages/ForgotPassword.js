import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [form, setForm] = useState({ email: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const { data } = await authAPI.forgotPassword(form);
      setMsg(data.message);
      setForm({ email: '', newPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-header">
          <i className="fas fa-key" />
          <h2>Forgot Password</h2>
          <p>Enter your email and new password</p>
        </div>
        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="required">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Your registered email" />
          </div>
          <div className="form-group">
            <label className="required">New Password</label>
            <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} required placeholder="Min 6 characters" minLength="6" />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Reset Password</button>
        </form>
        <p className="form-footer">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
