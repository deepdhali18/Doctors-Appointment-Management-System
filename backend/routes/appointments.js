const express = require('express');
const router = express.Router();
const {
  bookAppointment, getUserAppointments, getDoctorAppointments,
  getAllAppointments, updateAppointmentStatus, cancelAppointment,
  getDoctorSlots,
} = require('../controllers/appointmentController');
const { protect, adminOnly, doctorOnly } = require('../middleware/auth');

router.post('/', protect, bookAppointment);
router.get('/my-appointments', protect, getUserAppointments);
router.get('/doctor-appointments', protect, doctorOnly, getDoctorAppointments);
router.get('/all', protect, adminOnly, getAllAppointments);
router.put('/:id/status', protect, updateAppointmentStatus);
router.put('/:id/cancel', protect, cancelAppointment);
router.get('/doctor-slots', getDoctorSlots);

module.exports = router;
