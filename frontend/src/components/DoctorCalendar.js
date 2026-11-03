import React, { useState, useEffect } from 'react';
import API from '../services/api';

const fmt = (h) => {
  const hour = Math.floor(h);
  const min = (h % 1) * 60;
  const ampm = h < 12 ? 'AM' : 'PM';
  const disp = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${disp}:${min === 0 ? '00' : '30'} ${ampm}`;
};

const ALL_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const start = 8 + i * 0.5;
  const end = start + 0.5;
  return `${fmt(start)} - ${fmt(end)}`;
});

const DoctorCalendar = ({ doctorUserId, selectedDate, onSlotSelect, readOnly = false }) => {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingSlots, setPendingSlots] = useState([]);

  useEffect(() => {
    if (!selectedDate || !doctorUserId) { setBookedSlots([]); setPendingSlots([]); return; }
    setLoading(true);
    API.get(`/appointments/doctor-slots?doctorUserId=${doctorUserId}&date=${selectedDate}`)
      .then(res => setBookedSlots(res.data.bookedSlots || []))
      .catch(() => setBookedSlots([]))
      .finally(() => setLoading(false));
  }, [selectedDate, doctorUserId]);

  if (!selectedDate) return <p style={{ fontSize: '13px', color: '#888', marginTop: '8px' }}>Select a date to see availability</p>;

  return (
    <div style={{ marginTop: '12px' }}>
      {loading && <p style={{ fontSize: '13px', color: '#888' }}>Loading slots...</p>}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '6px' }}>
          {ALL_SLOTS.map(slot => {
            const booked = bookedSlots.includes(slot);
            return (
              <div
                key={slot}
                onClick={() => !booked && !readOnly && onSlotSelect && onSlotSelect(slot)}
                style={{
                  padding: '6px 8px', borderRadius: '6px', cursor: booked || readOnly ? 'default' : 'pointer',
                  background: booked ? '#fce4e4' : '#e8f5e9',
                  color: booked ? '#c62828' : '#2e7d32',
                  textAlign: 'center', fontSize: '11px', fontWeight: 500,
                  border: booked ? '1px solid #ef9a9a' : '1px solid #a5d6a7',
                  opacity: booked ? 0.7 : 1,
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => { if (!booked && !readOnly) e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {slot}
                {booked && <span style={{ display: 'block', fontSize: '10px', marginTop: '2px' }}>Booked</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorCalendar;
