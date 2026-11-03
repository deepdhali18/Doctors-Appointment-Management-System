import React, { useState, useEffect } from 'react';
import { applicationAPI, doctorAPI, userAPI, appointmentAPI, analyticsAPI } from '../services/api';
import Pagination from '../components/Pagination';

const AdminDashboard = () => {
  const [tab, setTab] = useState('analytics');
  const [applications, setApplications] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    fetchTabData();
  }, [tab]);

  const fetchTabData = async () => {
    setMsg('');
    setLoading(true);
    setPage(1);
    try {
      if (tab === 'applications') {
        const { data } = await applicationAPI.getAll();
        setApplications(data);
      } else if (tab === 'doctors') {
        const { data } = await doctorAPI.getAll({ limit: 100 });
        setDoctors(data.doctors || data);
      } else if (tab === 'users') {
        const { data } = await userAPI.getAll();
        setUsers(data);
      } else if (tab === 'appointments') {
        const { data } = await appointmentAPI.getAll();
        setAppointments(data);
      } else if (tab === 'analytics') {
        const { data } = await analyticsAPI.getDashboard();
        setStats(data);
      }
    } catch {  } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await applicationAPI.approve(id);
      setMsg('Application approved! Doctor created.');
      fetchTabData();
    } catch { setMsg('Failed to approve'); }
  };

  const handleReject = async (id) => {
    try {
      await applicationAPI.reject(id);
      setMsg('Application rejected.');
      fetchTabData();
    } catch { setMsg('Failed to reject'); }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Remove this doctor?')) return;
    try {
      await doctorAPI.updateProfile({ id }); 
      setMsg('Doctor removed');
      fetchTabData();
    } catch { setMsg('Failed to remove'); }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><i className="fas fa-shield-alt" /> Admin Dashboard</h2>
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      <div className="admin-tabs">
        {['analytics', 'applications', 'doctors', 'users', 'appointments'].map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            <i className={`fas fa-${t === 'analytics' ? 'chart-bar' : t === 'applications' ? 'file-alt' : t === 'doctors' ? 'user-md' : t === 'users' ? 'users' : 'calendar-check'}`} />
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {tab === 'analytics' && stats && (
          <div>
            <h3>Dashboard Analytics</h3>
            {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
              <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="stat-card"><i className="fas fa-users" style={{ color: '#667eea' }} /><h4>{stats.totalUsers}</h4><p>Total Users</p></div>
                <div className="stat-card"><i className="fas fa-user-md" style={{ color: '#764ba2' }} /><h4>{stats.totalDoctors}</h4><p>Doctors</p></div>
                <div className="stat-card"><i className="fas fa-calendar-check" style={{ color: '#2e7d32' }} /><h4>{stats.totalAppointments}</h4><p>Appointments</p></div>
                <div className="stat-card"><i className="fas fa-hourglass-half" style={{ color: '#ff9800' }} /><h4>{stats.pendingAppointments}</h4><p>Pending</p></div>
                <div className="stat-card"><i className="fas fa-check-circle" style={{ color: '#4caf50' }} /><h4>{stats.completedAppointments}</h4><p>Completed</p></div>
                <div className="stat-card"><i className="fas fa-star" style={{ color: '#ffc107' }} /><h4>{Number(stats.avgRating).toFixed(1)}</h4><p>Avg Rating</p></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-card">
                  <h4>Appointment Status Distribution</h4>
                  {stats.statusDistribution?.map(s => (
                    <div key={s._id} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                        <span>{s._id}</span><span>{s.count}</span>
                      </div>
                      <div style={{ height: '10px', background: '#f0f0f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(s.count / Math.max(...stats.statusDistribution.map(x => x.count))) * 100}%`, borderRadius: '5px', background: s._id === 'completed' ? '#4caf50' : s._id === 'pending' ? '#ff9800' : s._id === 'cancelled' ? '#f44336' : '#2196f3' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-card">
                  <h4>Role Distribution</h4>
                  {stats.roleDistribution?.map(r => (
                    <div key={r._id} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                        <span>{r._id}</span><span>{r.count}</span>
                      </div>
                      <div style={{ height: '10px', background: '#f0f0f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(r.count / Math.max(...stats.roleDistribution.map(x => x.count))) * 100}%`, borderRadius: '5px', background: r._id === 'admin' ? '#f44336' : r._id === 'doctor' ? '#764ba2' : '#667eea' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-card">
                  <h4>Doctor Registrations (Monthly)</h4>
                  {stats.doctorRegistrations?.slice(-6).map(d => (
                    <div key={d._id} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span>{d._id}</span><span>{d.count}</span>
                      </div>
                      <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(d.count / Math.max(...stats.doctorRegistrations.map(x => x.count))) * 100}%`, borderRadius: '4px', background: 'linear-gradient(90deg, #667eea, #764ba2)' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-card">
                  <h4>Appointment Trends (Monthly)</h4>
                  {stats.appointmentTrends?.slice(-6).map(a => (
                    <div key={a._id} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span>{a._id}</span><span>{a.count}</span>
                      </div>
                      <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(a.count / Math.max(...stats.appointmentTrends.map(x => x.count))) * 100}%`, borderRadius: '4px', background: 'linear-gradient(90deg, #4caf50, #8bc34a)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </>
            )}
          </div>
        )}

        {tab === 'applications' && (
          <div className="table-container">
            <h3>Pending Applications</h3>
            {loading ? <div className="loading-screen"><div className="spinner" /></div> : applications.length === 0 ? <p className="no-data">No pending applications</p> : (
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Specialization</th><th>Fees</th><th>Experience</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>{app.user?.firstname} {app.user?.lastname}</td>
                      <td>{app.user?.email}</td>
                      <td>{app.specialization}</td>
                      <td>${app.fees}</td>
                      <td>{app.experience || 0} yrs</td>
                      <td><span className={`status-${app.applicationStatus}`}>{app.applicationStatus}</span></td>
                      <td className="actions-cell">
                        {app.applicationStatus === 'pending' && (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => handleApprove(app._id)}>Approve</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleReject(app._id)}>Reject</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'doctors' && (
          <div className="table-container">
            <h3>All Doctors</h3>
            <div style={{ marginBottom: '12px' }}>
              <input type="text" placeholder="Search doctors..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', width: '100%', maxWidth: '300px' }} />
            </div>
            {loading ? <div className="loading-screen"><div className="spinner" /></div> : doctors.length === 0 ? <p className="no-data">No doctors</p> : (
              <>
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Specialization</th><th>Fees</th><th>Experience</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {doctors.filter(d => !search || d.specialization?.toLowerCase().includes(search.toLowerCase()) || d.user?.firstname?.toLowerCase().includes(search.toLowerCase()) || d.user?.lastname?.toLowerCase().includes(search.toLowerCase()))
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((doc) => (
                    <tr key={doc._id}>
                      <td>Dr. {doc.user?.firstname} {doc.user?.lastname}</td>
                      <td>{doc.specialization}</td>
                      <td>${doc.fees}</td>
                      <td>{doc.experience || 0} yrs</td>
                      <td><span className="status-active">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={page} pages={Math.ceil(doctors.filter(d => !search || d.specialization?.toLowerCase().includes(search.toLowerCase()) || d.user?.firstname?.toLowerCase().includes(search.toLowerCase()) || d.user?.lastname?.toLowerCase().includes(search.toLowerCase())).length / pageSize)} onPageChange={setPage} />
              </>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="table-container">
            <h3>All Users</h3>
            <div style={{ marginBottom: '12px' }}>
              <input type="text" placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', width: '100%', maxWidth: '300px' }} />
            </div>
            {loading ? <div className="loading-screen"><div className="spinner" /></div> : users.length === 0 ? <p className="no-data">No users</p> : (
              <>
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Mobile</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {users.filter(u => !search || u.firstname?.toLowerCase().includes(search.toLowerCase()) || u.lastname?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((u) => (
                    <tr key={u._id}>
                      <td>{u.firstname} {u.lastname}</td>
                      <td>{u.email}</td>
                      <td><span className="role-badge">{u.role}</span></td>
                      <td>{u.mobile || '-'}</td>
                      <td><span className={`status-${u.status}`}>{u.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={page} pages={Math.ceil(users.filter(u => !search || u.firstname?.toLowerCase().includes(search.toLowerCase()) || u.lastname?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())).length / pageSize)} onPageChange={setPage} />
              </>
            )}
          </div>
        )}

        {tab === 'appointments' && (
          <div className="table-container">
            <h3>All Appointments</h3>
            {loading ? <div className="loading-screen"><div className="spinner" /></div> : appointments.length === 0 ? <p className="no-data">No appointments</p> : (
              <>
              <table className="data-table">
                <thead>
                  <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {appointments.slice((page - 1) * pageSize, page * pageSize).map((apt) => (
                    <tr key={apt._id}>
                      <td>{apt.user?.firstname} {apt.user?.lastname}</td>
                      <td>Dr. {apt.doctorUser?.firstname} {apt.doctorUser?.lastname}</td>
                      <td>{new Date(apt.date).toLocaleDateString()}</td>
                      <td>{apt.timeSlot}</td>
                      <td><span className={`status-${apt.status}`}>{apt.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={page} pages={Math.ceil(appointments.length / pageSize)} onPageChange={setPage} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
