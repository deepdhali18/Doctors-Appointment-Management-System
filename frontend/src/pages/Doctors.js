import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';



const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchDoctors = async (p = page) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 12 };
      if (search) params.search = search;
      if (filter) params.specialization = filter;
      const { data } = await doctorAPI.getAll(params);
      setDoctors(data.doctors || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(1); setPage(1); }, [search, filter]);
  useEffect(() => { fetchDoctors(page); }, [page]);

  const specializations = [...new Set(doctors.map((d) => d.specialization))];

  const handleSearchChange = (e) => {
    setSearch(e.target.value);


  };

  if (loading && page === 1) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="doctors-page">
      <div className="page-header">
        <h2><i className="fas fa-user-md" /> Our Doctors</h2>
        <p>Browse verified healthcare professionals</p>
      </div>

      <div className="filter-bar" style={{ gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
          <i className="fas fa-search" />
          <input
            type="text" placeholder="Search doctors by name or specialization..."
            value={search} onChange={handleSearchChange}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
          />
        </div>
        <i className="fas fa-filter" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <option value="">All Specializations</option>
          {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="doctor-grid">
        {loading && <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p>}
        {!loading && doctors.length === 0 && <p className="no-data">No doctors found</p>}
        {doctors.map((doc) => (
          <div key={doc._id} className="doctor-card">
            <div className="doctor-avatar">
              <i className="fas fa-user-md" />
            </div>
            <h3>{doc.user?.firstname} {doc.user?.lastname}</h3>
            <p className="specialization">{doc.specialization}</p>
            <div className="doctor-info">
              <span><i className="fas fa-money-bill" /> Rs.{doc.fees}/-</span>
              <span><i className="fas fa-briefcase" /> {doc.experience || 0} yrs</span>
            </div>
            {doc.qualifications && <p className="qualifications">{doc.qualifications}</p>}
            {user && user.role === 'user' ? (
              <button className="btn btn-primary btn-block" onClick={() => navigate('/appointments?bookDoctor=' + doc._id)}>
                <i className="fas fa-calendar-plus" /> Book Appointment
              </button>
            ) : user && user.role === 'admin' ? (
              <button className="btn btn-outline btn-block" onClick={() => navigate('/admin')}>
                <i className="fas fa-shield-alt" /> Manage in Admin
              </button>
            ) : !user ? (
              <button className="btn btn-outline btn-block" onClick={() => navigate('/login')}>
                Login to Book
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </div>
  );
};

export default Doctors;
