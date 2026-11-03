import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, doctorAPI, applicationAPI, authAPI } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ firstname: '', lastname: '', age: '', gender: '', mobile: '', address: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' });
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [myApplication, setMyApplication] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        firstname: user.firstname || '', lastname: user.lastname || '',
        age: user.age || '', gender: user.gender || '',
        mobile: user.mobile || '', address: user.address || '',
      });
    }
    fetchDoctorData();
  }, [user]);

  const fetchDoctorData = async () => {
    try {
      const [drRes, appRes] = await Promise.allSettled([
        doctorAPI.getMyProfile(),
        applicationAPI.getMyApplication(),
      ]);
      if (drRes.status === 'fulfilled') setDoctorProfile(drRes.value.data);
      if (appRes.status === 'fulfilled') setMyApplication(appRes.value.data);
    } catch {  }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePassChange = (e) => setPassForm({ ...passForm, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const { data } = await userAPI.updateProfile(form);
      setMsg('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const { data } = await authAPI.changePassword(passForm);
      setMsg(data.message);
      setPassForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <i className="fas fa-user-circle" />
        </div>
        <div>
          <h2>{user?.firstname} {user?.lastname}</h2>
          <p className="role-badge">{user?.role}</p>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="form-card">
          <h3><i className="fas fa-edit" /> Edit Profile</h3>
          {msg && <div className="alert alert-success">{msg}</div>}
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="required">First Name</label>
                <input type="text" name="firstname" value={form.firstname} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="required">Last Name</label>
                <input type="text" name="lastname" value={form.lastname} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Mobile</label>
              <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} pattern="^\+?\d{7,15}$" title="7-15 digits, optional + prefix" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>

        <div className="form-card">
          <h3><i className="fas fa-lock" /> Change Password</h3>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="required">Current Password</label>
              <input type="password" name="currentPassword" value={passForm.currentPassword} onChange={handlePassChange} required placeholder="Enter current password" />
            </div>
            <div className="form-group">
              <label className="required">New Password</label>
              <input type="password" name="newPassword" value={passForm.newPassword} onChange={handlePassChange} required placeholder="Min 6 characters" minLength="6" />
            </div>
            <button type="submit" className="btn btn-primary">Update Password</button>
          </form>
        </div>

        {user?.role === 'doctor' && doctorProfile && (
          <div className="form-card">
            <h3><i className="fas fa-stethoscope" /> Doctor Details</h3>
            <div className="detail-grid">
              <div><strong>Specialization:</strong> {doctorProfile.specialization}</div>
              <div><strong>Fees:</strong> Rs.{doctorProfile.fees}</div>
              <div><strong>Experience:</strong> {doctorProfile.experience} years</div>
              <div><strong>Qualifications:</strong> {doctorProfile.qualifications}</div>
              <div><strong>Status:</strong> <span className={`status-${doctorProfile.isDoctor ? 'active' : 'pending'}`}>{doctorProfile.isDoctor ? 'Active' : doctorProfile.applicationStatus}</span></div>
            </div>
          </div>
        )}

        {myApplication && !myApplication.isDoctor && (
          <div className="form-card">
            <h3><i className="fas fa-file-alt" /> Application Status</h3>
            <p>Status: <strong className={`status-${myApplication.applicationStatus}`}>{myApplication.applicationStatus}</strong></p>
            {myApplication.specialization && <p>Specialization: {myApplication.specialization}</p>}
            {myApplication.applicationStatus === 'rejected' && <p>Your application was rejected. You can reapply.</p>}
          </div>
        )}

      </div>
    </div>
  );
};
  export default Profile;
