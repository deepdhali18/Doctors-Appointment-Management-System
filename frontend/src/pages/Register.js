import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register = () => {
  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '', password: '',
    role: '', age: '', gender: '', mobile: '', address: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await authAPI.register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="form-page">
      <div className="form-card form-card-wide">
        <div className="form-header">
          <i className="fas fa-user-plus" />
          <h2>Create Account</h2>
          <p>Join us today</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="required">First Name</label>
              <input type="text" name="firstname" value={form.firstname} onChange={handleChange} required placeholder="John" />
            </div>
            <div className="form-group">
              <label className="required">Last Name</label>
              <input type="text" name="lastname" value={form.lastname} onChange={handleChange} required placeholder="Doe" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="required">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="john@example.com" />
            </div>
            <div className="form-group">
              <label className="required">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Min 6 characters" minLength="6" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="required">Age</label>
              <input type="number" name="age" value={form.age} onChange={handleChange} required placeholder="30" />
            </div>
            <div className="form-group">
              <label className="required">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="required">Mobile</label>
            <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} required placeholder="+1234567890" pattern="^\+?\d{7,15}$" title="7-15 digits, optional + prefix" />
          </div>
          <div className="form-group">
            <label className="required">Address</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} required placeholder="Your address" />
          </div>

          <div className="form-group">
            <label className="required">Register as</label>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="">Select role</option>
              <option value="user">User</option>
              <option value="doctor">Doctor (requires application approval)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-block">Register</button>
        </form>
        <p className="form-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
