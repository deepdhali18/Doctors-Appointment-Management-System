const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, doctorUserId, date, timeSlot, reason, bloodGroup, familyDiseases } = req.body;

    const existing = await Appointment.findOne({ doctorUserId, date, timeSlot, status: { $ne: 'cancelled' } });
    if (existing) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    const appointment = await Appointment.create({
      user: req.user._id, doctor: doctorId, doctorUser: doctorUserId,
      date, timeSlot, status: 'pending', reason, bloodGroup, familyDiseases,
    });

    await Notification.create({
      user: doctorUserId,
      message: `New appointment request from ${req.user.firstname} ${req.user.lastname} on ${new Date(date).toLocaleDateString()} at ${timeSlot}`,
      type: 'info',
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate({ path: 'doctorUser', select: 'firstname lastname email' })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstname lastname' } })
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorUser: req.user._id })
      .populate({ path: 'user', select: 'firstname lastname email mobile age gender' })
      .populate({ path: 'doctor', select: 'specialization fees' })
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({ path: 'user', select: 'firstname lastname email' })
      .populate({ path: 'doctorUser', select: 'firstname lastname email' })
      .populate({ path: 'doctor', select: 'specialization fees' })
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate('user', 'firstname lastname');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.status = status;
    await appointment.save();

    const statusMsg = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : status;
    await Notification.create({
      user: appointment.user._id,
      message: `Your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot} has been ${statusMsg}`,
      type: status === 'approved' ? 'success' : 'error',
    });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.status = 'cancelled';
    await appointment.save();

    await Notification.create({
      user: appointment.doctorUser,
      message: `Appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot} was cancelled by the patient`,
      type: 'warning',
    });

    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorSlots = async (req, res) => {
  try {
    const { doctorUserId, date } = req.query;
    if (!doctorUserId || !date) return res.status(400).json({ message: 'Missing doctorUserId or date' });

    const appointments = await Appointment.find({
      doctorUser: doctorUserId,
      date: new Date(date),
      status: { $nin: ['cancelled'] },
    }).select('timeSlot');

    const bookedSlots = appointments.map(a => a.timeSlot);
    res.json({ bookedSlots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


