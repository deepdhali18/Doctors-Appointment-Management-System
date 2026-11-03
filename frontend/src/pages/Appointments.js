import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI, doctorAPI, paymentAPI } from '../services/api';
import DoctorCalendar from '../components/DoctorCalendar';

const fmt = (h) => {
  const hour = Math.floor(h);
  const min = (h % 1) * 60;
  const ampm = h < 12 ? 'AM' : 'PM';
  const disp = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${disp}:${min === 0 ? '00' : '30'} ${ampm}`;
};
const timeSlots = Array.from({ length: 28 }, (_, i) => {
  const start = 8 + i * 0.5;
  const end = start + 0.5;
  return `${fmt(start)} - ${fmt(end)}`;
});

const parseSlotTime = (date, timeSlot, part) => {
  const str = timeSlot.split(' - ')[part];
  if (!str) return new Date(date);
  const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return new Date(date);
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (match[3].toUpperCase() === 'PM' && h !== 12) h += 12;
  if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
};

const useAutoDismiss = (initial = '') => {
  const [val, setVal] = useState(initial);
  const [timer, setTimer] = useState(null);
  const set = useCallback((v) => {
    if (timer) clearTimeout(timer);
    setVal(v);
    if (v) {
      const t = setTimeout(() => setVal(''), 6000);
      setTimer(t);
    }
  }, [timer]);
  return [val, set];
};

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidePanel, setSidePanel] = useState(false);
  const [form, setForm] = useState({ doctorId: '', date: '', timeSlot: '', reason: '', bloodGroup: '', familyDiseases: '' });
  const [msg, setMsg] = useAutoDismiss();
  const [error, setError] = useAutoDismiss();
  const [doctorUserId, setDoctorUserId] = useState('');
  const [doctorCalDate, setDoctorCalDate] = useState('');
  const [payments, setPayments] = useState([]); //

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookDoctor = params.get('bookDoctor');
    if (bookDoctor && user?.role === 'user') {
      setForm(prev => ({ ...prev, doctorId: bookDoctor }));
      const sel = doctors.find(d => d._id === bookDoctor);
      if (sel?.user?._id) setDoctorUserId(sel.user._id);
      setSidePanel(true);
      window.history.replaceState({}, '', '/appointments');
    }
  }, [user, doctors]);

  useEffect(() => {
    fetchData();
  }, [user]);


const fetchData = async () => {
    try {
      const [drRes] = await Promise.allSettled([
        doctorAPI.getAll({ limit: 100 })
      ]);

      if (drRes.status === 'fulfilled') {
        setDoctors(drRes.value.data.doctors || drRes.value.data);
      }

      if (user?.role === 'doctor') {
        const { data } = await appointmentAPI.getDoctorAppointments();
        setAppointments(Array.isArray(data) ? data : []);

        try {
          const paymentResponse = await paymentAPI.getDoctorPayments();
          setPayments(paymentResponse.data.payments || []);
        } catch (paymentError) {
          console.error('Failed to load doctor payments:', paymentError);
          setPayments([]);
        }
      } else {
        const { data } = await appointmentAPI.getMyAppointments();
        setAppointments(Array.isArray(data) ? data : []);
        setPayments([]);
      }
    } catch (error) {
      console.error('Failed to load appointment data:', error);
      setError('Failed to load appointments. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleBook = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    try {
      const selectedDoctor = doctors.find((d) => d._id === form.doctorId);
      if (!selectedDoctor?.user?._id) {
        setError('Please select a valid doctor.');
        return;
      }

      const response = await appointmentAPI.book({
        doctorId: form.doctorId,
        doctorUserId: selectedDoctor.user._id,
        date: form.date,
        timeSlot: form.timeSlot,
        reason: form.reason,
        bloodGroup: form.bloodGroup,
        familyDiseases: form.familyDiseases,
      });

      const appointment = response.data?.appointment || response.data;
      const appointmentId = appointment?._id;

      setSidePanel(false);
      setForm({ doctorId: '', date: '', timeSlot: '', reason: '', bloodGroup: '', familyDiseases: '' });
      setDoctorUserId('');

      if (appointmentId) {
        navigate(`/payment/demo/${appointmentId}`);
      } else {
        setMsg('Appointment booked successfully, but the payment page could not be opened.');
        await fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, status);
      setMsg(status === 'approved' ? 'Appointment approved' : status === 'completed' ? 'Marked as completed' : 'Status updated');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const handleCancel = async (id) => {
    try {
      await appointmentAPI.cancel(id);
      setMsg('Appointment cancelled');
      fetchData();
    } catch {  }
  };

  const canMarkCompleted = (apt) => {
    if (apt.status !== 'approved') return false;
    const today = new Date();
    const aptDate = new Date(apt.date);
    if (today.toDateString() !== aptDate.toDateString()) return false;
    const start = parseSlotTime(apt.date, apt.timeSlot, 0);
    return today >= start;
  };

  const openSidePanel = () => {
    setForm({ doctorId: '', date: '', timeSlot: '', reason: '', bloodGroup: '', familyDiseases: '' });
    setDoctorUserId('');
    setSidePanel(true);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const getStatusClass = (status) => `status-${status}`;

  

  return (
    <div className="appointments-page">
      <div className="page-header">
        <h2><i className="fas fa-calendar-check" /> Appointments</h2>
        {user?.role === 'user' && (
          <button className="btn btn-primary" onClick={openSidePanel}>
            <i className="fas fa-plus" /> Book Appointment
          </button>
        )}
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className={`side-overlay ${sidePanel ? 'active' : ''}`} onClick={() => setSidePanel(false)} />
      <div className={`side-panel ${sidePanel ? 'active' : ''}`}>
        <div className="side-panel-header">
          <h3>Book New Appointment</h3>
          <button className="side-close" onClick={() => setSidePanel(false)}>&times;</button>
        </div>
        <form onSubmit={handleBook}>
          <div className="form-group">
            <label className="required">Doctor</label>
            <select name="doctorId" value={form.doctorId} onChange={e => { handleChange(e); const sel = doctors.find(d => d._id === e.target.value); setDoctorUserId(sel?.user?._id || ''); }} required>
              <option value="">Select Doctor</option>
              {doctors.filter((d) => d.isDoctor).map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.user?.firstname} {d.user?.lastname} - {d.specialization} (Rs.{d.fees}/-)
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="required">Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="required">Time</label>
              <select name="timeSlot" value={form.timeSlot} onChange={handleChange} required>
                <option value="">Select Time</option>
                {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {doctorUserId && form.date && (
            <div style={{ marginBottom: '12px', padding: '10px', background: '#f9f9ff', borderRadius: '8px', border: '1px solid #e8e8ff' }}>
              <label style={{ fontWeight: 600, fontSize: '13px', color: '#555', display: 'block', marginBottom: '6px' }}>
                <i className="fas fa-calendar-alt" /> Available Slots
              </label>
              <DoctorCalendar
                doctorUserId={doctorUserId}
                selectedDate={form.date}
                onSlotSelect={(slot) => setForm({ ...form, timeSlot: slot })}
              />
            </div>
          )}
          <div className="form-group">
            <label className="required">Reason</label>
            <textarea name="reason" value={form.reason} onChange={handleChange} rows="2" required placeholder="Brief description" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="required">Blood Group</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
            </div>
            <div className="form-group">
              <label className="required">Family Diseases</label>
              <input type="text" name="familyDiseases" value={form.familyDiseases} onChange={handleChange} required placeholder="e.g. Diabetes, BP" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block">Confirm Booking</button>
        </form>
      </div>

      {user?.role === 'doctor' && (
        <div className="form-card" style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '8px' }}><i className="fas fa-calendar-alt" /> My Schedule</h4>
          <div className="form-group" style={{ marginBottom: '8px' }}>
            <label>Select Date to view your schedule</label>
            <input type="date" value={doctorCalDate} onChange={e => setDoctorCalDate(e.target.value)}
              style={{ width: '100%', maxWidth: '280px', padding: '8px', border: '1px solid #ddd', borderRadius: '8px' }} />
          </div>
          {doctorCalDate && (
            <DoctorCalendar
              doctorUserId={user?._id}
              selectedDate={doctorCalDate}
              readOnly
            />
          )}
        </div>
      )}

      <div className="appointments-list">
        {appointments.length === 0 && <p className="no-data">No appointments yet</p>}
        {appointments.map((apt) => (
          <div key={apt._id} className="appointment-card">
            <div className="apt-header">
              {user?.role === 'doctor' || user?.role === 'admin' ? (
                <h4>{apt.user?.firstname} {apt.user?.lastname}</h4>
              ) : (
                <h4>Dr. {apt.doctorUser?.firstname} {apt.doctorUser?.lastname}</h4>
              )}
              <span className={getStatusClass(apt.status)}>{apt.status}</span>
            </div>
            <div className="apt-details">
              <span><i className="fas fa-calendar" /> {new Date(apt.date).toLocaleDateString()}</span>
              <span><i className="fas fa-clock" /> {apt.timeSlot}</span>
              {apt.createdAt && <span><i className="fas fa-calendar-plus" /> Booked {new Date(apt.createdAt).toLocaleString()}</span>}
            </div>
            {user?.role === 'doctor' && (() => {
              const payment = payments.find((p) =>
                String(p.appointment?._id || p.appointment) === String(apt._id)
              );
              return (
                <div className="apt-details">
                  <span><strong>Payment:</strong> {payment ? `₹${payment.amount} ${payment.currency || 'INR'}` : 'Not paid'}</span>
                  <span><strong>Payment status:</strong> {payment?.status || 'Not paid'}</span>
                </div>
              );
            })()}
            {apt.reason && <p className="apt-reason"><strong>Reason:</strong> {apt.reason}</p>}
            {(user?.role === 'doctor' || user?.role === 'admin') && (
              <div className="apt-details">
                {apt.bloodGroup && <span><i className="fas fa-tint" /> Blood: {apt.bloodGroup}</span>}
                {apt.familyDiseases && <span><i className="fas fa-notes-medical" /> Family: {apt.familyDiseases}</span>}
              </div>
            )}

            <div className="apt-actions" style={{ flexWrap: 'wrap', gap: '6px' }}>
              {user?.role === 'doctor' && apt.status === 'pending' && (
                <>
                  <button className="btn btn-sm btn-success" onClick={() => handleStatus(apt._id, 'approved')}>Approve</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleStatus(apt._id, 'rejected')}>Reject</button>
                </>
              )}
              {user?.role === 'doctor' && apt.status === 'approved' && (
                <button
                  className={`btn btn-sm ${canMarkCompleted(apt) ? 'btn-success' : 'btn-outline'}`}
                  onClick={() => canMarkCompleted(apt) && handleStatus(apt._id, 'completed')}
                  disabled={!canMarkCompleted(apt)}
                  title={canMarkCompleted(apt) ? '' : 'Can only mark completed on the appointment date after the slot starts'}
                >
                  Mark Completed
                </button>
              )}
              {(user?.role === 'admin') && apt.status === 'pending' && (
                <>
                  <button className="btn btn-sm btn-success" onClick={() => handleStatus(apt._id, 'approved')}>Approve</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleStatus(apt._id, 'rejected')}>Reject</button>
                </>
              )}
              {user?.role === 'user' && (apt.status === 'pending' || apt.status === 'approved') && (
                <button className="btn btn-sm btn-danger" onClick={() => handleCancel(apt._id)}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Appointments;
