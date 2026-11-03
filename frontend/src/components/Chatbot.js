import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, chatbotAPI } from '../services/api';

const fmt = (h) => {
  const hour = Math.floor(h);
  const min = (h % 1) * 60;
  const ampm = h < 12 ? 'AM' : 'PM';
  const disp = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${disp}:${min === 0 ? '00' : '30'} ${ampm}`;
};
const allSlots = Array.from({ length: 28 }, (_, i) => `${fmt(8 + i * 0.5)} - ${fmt(8.5 + i * 0.5)}`);

const todayString = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const Chatbot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi ${user?.firstname || 'there'}! I’m the MediConnect health assistant. Tell me your main symptom and I’ll help you find an appropriate type of doctor. I can also help you continue to an appointment booking.`,
    },
  ]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [booking, setBooking] = useState({ date: '', timeSlot: '', reason: '', bloodGroup: '', familyDiseases: '' });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  const minDate = useMemo(() => todayString(), []);

  if (!user || user.role !== 'user') return null;

  const sendMessage = async (event) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setSending(true);
    try {
      const { data } = await chatbotAPI.message(text);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.message,
        urgent: data.urgent,
        specialization: data.specialization,
        doctors: data.doctors || [],
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: error.response?.data?.message || 'I could not connect to the assistant. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  const chooseDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setBooking({ date: '', timeSlot: '', reason: '', bloodGroup: '', familyDiseases: '' });
    setSlots([]);
    setBookingMessage('');
    setMessages(prev => [...prev, { role: 'assistant', text: `You selected ${doctor.name}. Choose a date below and I’ll check the available time slots.` }]);
  };

  const checkSlots = async (date) => {
    setBooking(prev => ({ ...prev, date, timeSlot: '' }));
    setSlots([]);
    setBookingMessage('');
    if (!date || !selectedDoctor?.doctorUserId) return;
    setLoadingSlots(true);
    try {
      const { data } = await chatbotAPI.getDoctorSlots(selectedDoctor.doctorUserId, date);
      const booked = new Set(data.bookedSlots || []);
      setSlots(allSlots.filter(slot => !booked.has(slot)));
    } catch (error) {
      setBookingMessage(error.response?.data?.message || 'Could not load time slots.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const updateBooking = (name, value) => setBooking(prev => ({ ...prev, [name]: value }));

  const confirmBooking = async (event) => {
    event.preventDefault();
    if (!selectedDoctor || !booking.date || !booking.timeSlot || !booking.reason || !booking.bloodGroup || !booking.familyDiseases) {
      setBookingMessage('Please complete all booking fields.');
      return;
    }

    setBookingBusy(true);
    setBookingMessage('');
    try {
      await appointmentAPI.book({
        doctorId: selectedDoctor.id,
        doctorUserId: selectedDoctor.doctorUserId,
        date: booking.date,
        timeSlot: booking.timeSlot,
        reason: booking.reason,
        bloodGroup: booking.bloodGroup,
        familyDiseases: booking.familyDiseases,
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `Appointment request submitted successfully with ${selectedDoctor.name} for ${new Date(`${booking.date}T00:00:00`).toLocaleDateString()} at ${booking.timeSlot}. You can see its status in My Appointments.`,
      }]);
      setSelectedDoctor(null);
      setBooking({ date: '', timeSlot: '', reason: '', bloodGroup: '', familyDiseases: '' });
      setSlots([]);
    } catch (error) {
      setBookingMessage(error.response?.data?.message || 'Booking failed. Please try another slot.');
    } finally {
      setBookingBusy(false);
    }
  };

  const quickPrompt = (text) => {
    setInput(text);
  };

  return (
    <>
      {open && (
        <div className="chatbot-window" role="dialog" aria-label="MediConnect health assistant">
          <div className="chatbot-header">
            <div>
              <strong><i className="fas fa-robot" /> MediConnect Assistant</strong>
              <small>Doctor navigation & appointment help</small>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close chatbot">&times;</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={`${index}-${msg.role}`} className={`chat-message ${msg.role} ${msg.urgent ? 'urgent' : ''}`}>
                <div className="chat-bubble">{msg.text}</div>
                {msg.doctors?.length > 0 && (
                  <div className="chat-doctor-list">
                    {msg.doctors.map(doctor => (
                      <div className="chat-doctor-card" key={doctor.id}>
                        <div className="chat-doctor-icon"><i className="fas fa-user-md" /></div>
                        <div className="chat-doctor-info">
                          <strong>{doctor.name}</strong>
                          <span>{doctor.specialization}</span>
                          <span>{doctor.experience} years experience · ₹{doctor.fees}</span>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => chooseDoctor(doctor)}>Book</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sending && <div className="chat-message assistant"><div className="chat-bubble chatbot-typing"><span /> <span /> <span /></div></div>}
          </div>

          {selectedDoctor && (
            <form className="chat-booking" onSubmit={confirmBooking}>
              <div className="chat-booking-title">
                <strong>Book with {selectedDoctor.name}</strong>
                <button type="button" onClick={() => setSelectedDoctor(null)} aria-label="Close booking">&times;</button>
              </div>
              <label>Date
                <input type="date" min={minDate} value={booking.date} onChange={e => checkSlots(e.target.value)} required />
              </label>
              {booking.date && (
                <label>Time slot
                  <select value={booking.timeSlot} onChange={e => updateBooking('timeSlot', e.target.value)} required>
                    <option value="">{loadingSlots ? 'Checking availability...' : 'Select available slot'}</option>
                    {!loadingSlots && slots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </label>
              )}
              <label>Reason
                <textarea value={booking.reason} onChange={e => updateBooking('reason', e.target.value)} placeholder="Briefly describe the reason for the visit" rows="2" required />
              </label>
              <div className="chat-booking-row">
                <label>Blood group
                  <select value={booking.bloodGroup} onChange={e => updateBooking('bloodGroup', e.target.value)} required>
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </label>
                <label>Family diseases
                  <input value={booking.familyDiseases} onChange={e => updateBooking('familyDiseases', e.target.value)} placeholder="e.g. Diabetes" required />
                </label>
              </div>
              {bookingMessage && <div className="chat-booking-error">{bookingMessage}</div>}
              <button className="btn btn-primary btn-block" disabled={bookingBusy} type="submit">
                {bookingBusy ? 'Submitting...' : 'Confirm Appointment'}
              </button>
            </form>
          )}

          <div className="chatbot-quick-actions">
            <button onClick={() => quickPrompt('I need help finding the right doctor')}>Find a doctor</button>
            <button onClick={() => quickPrompt('I want to book an appointment')}>Book appointment</button>
          </div>
          <form className="chatbot-input" onSubmit={sendMessage}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Describe your symptoms..." aria-label="Message" />
            <button type="submit" disabled={sending || !input.trim()} aria-label="Send"><i className="fas fa-paper-plane" /></button>
          </form>
          <div className="chatbot-disclaimer">For navigation only — not a diagnosis or emergency service.</div>
        </div>
      )}
      <button className={`chatbot-launcher ${open ? 'open' : ''}`} onClick={() => setOpen(v => !v)} aria-label="Open MediConnect Assistant">
        <i className={`fas ${open ? 'fa-times' : 'fa-comment-medical'}`} />
      </button>
    </>
  );
};

export default Chatbot;
