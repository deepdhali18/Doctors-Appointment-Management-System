import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI, doctorAPI } from '../services/api';

const ApplyDoctor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ specialization: '', fees: '', experience: '', qualifications: '' });
  const [application, setApplication] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [appRes, drRes] = await Promise.allSettled([
        applicationAPI.getMyApplication(),
        doctorAPI.getMyProfile(),
      ]);
      if (appRes.status === 'fulfilled') {
        setApplication(appRes.value.data);
        if (appRes.value.data.specialization) {
          setForm({
            specialization: appRes.value.data.specialization || '',
            fees: appRes.value.data.fees || '',
            experience: appRes.value.data.experience || '',
            qualifications: appRes.value.data.qualifications || '',
          });
        }
      }
      if (drRes.status === 'fulfilled' && drRes.value.data) {
        setDoctorProfile(drRes.value.data);
      }
    } catch {  }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await applicationAPI.submit({
        ...form, fees: Number(form.fees), experience: Number(form.experience),
      });
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
  };

  const isDoctor = user?.role === 'doctor' && doctorProfile?.isDoctor;

  if (isDoctor) {
    return (
      <div className="form-page">
        <div className="form-card">
          <div className="form-header">
            <i className="fas fa-check-circle" style={{ color: 'var(--success)' }} />
            <h2>You are a Doctor</h2>
          </div>
          <div className="detail-grid">
            <div><strong>Specialization:</strong> {doctorProfile.specialization}</div>
            <div><strong>Fees:</strong> Rs.{doctorProfile.fees}/-</div>
            <div><strong>Experience:</strong> {doctorProfile.experience} years</div>
            <div><strong>Qualifications:</strong> {doctorProfile.qualifications}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-header">
          <i className="fas fa-stethoscope" />
          <h2>Apply as Doctor</h2>
          <p>Fill in your professional details</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {application?.applicationStatus === 'pending' && (
          <div className="alert alert-info">Your application is currently <strong>pending</strong> approval.</div>
        )}
        {application?.applicationStatus === 'rejected' && (
          <div className="alert alert-error">Your application was rejected. You can reapply with updated information.</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="required">Specialization</label>
            <input type="text" name="specialization" value={form.specialization} onChange={handleChange} required placeholder="e.g., Cardiologist" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="required">Consultation Fees (Rupees)</label>
              <input type="number" name="fees" value={form.fees} onChange={handleChange} required placeholder="100" />
            </div>
            <div className="form-group">
              <label>Experience (years)</label>
              <input type="number" name="experience" value={form.experience} onChange={handleChange} placeholder="5" />
            </div>
          </div>
          <div className="form-group">
            <label>Qualifications</label>
            <textarea name="qualifications" value={form.qualifications} onChange={handleChange} rows="3" placeholder="MD, MBBS, etc." />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            {application?.applicationStatus === 'rejected' ? 'Reapply' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyDoctor;
