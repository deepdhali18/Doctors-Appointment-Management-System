const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.submitApplication = async (req, res) => {
  try {
    const { specialization, fees, experience, qualifications } = req.body;

    let doctor = await Doctor.findOne({ user: req.user._id });
    if (doctor) {
      if (doctor.isDoctor) return res.status(400).json({ message: 'You are already a doctor' });
      if (doctor.applicationStatus === 'pending') return res.status(400).json({ message: 'Application already pending' });
      doctor.specialization = specialization;
      doctor.fees = fees;
      doctor.experience = experience;
      doctor.qualifications = qualifications;
      doctor.applicationStatus = 'pending';
    } else {
      doctor = await Doctor.create({
        user: req.user._id, specialization, fees, experience, qualifications,
        isDoctor: false, applicationStatus: 'pending',
      });
    }

    await doctor.save();

    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        message: `New doctor application from ${req.user.firstname} ${req.user.lastname}`,
        type: 'info',
        link: '/admin/applications',
      });
    }

    res.status(201).json({ message: 'Application submitted successfully', doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyApplication = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'firstname lastname email');
    if (!doctor) return res.status(404).json({ message: 'No application found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Doctor.find({ applicationStatus: { $ne: 'approved' } })
      .populate('user', 'firstname lastname email age gender mobile address')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveApplication = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'firstname lastname');
    if (!doctor) return res.status(404).json({ message: 'Application not found' });

    doctor.isDoctor = true;
    doctor.applicationStatus = 'approved';
    await doctor.save();

    await User.findByIdAndUpdate(doctor.user._id, { role: 'doctor' });

    await Notification.create({
      user: doctor.user._id,
      message: `Congratulations ${doctor.user.firstname}! Your doctor application has been approved.`,
      type: 'success',
    });

    res.json({ message: 'Application approved', doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectApplication = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'firstname lastname');
    if (!doctor) return res.status(404).json({ message: 'Application not found' });

    doctor.applicationStatus = 'rejected';
    await doctor.save();

    await Notification.create({
      user: doctor.user._id,
      message: `Your doctor application has been rejected. You can reapply with updated information.`,
      type: 'error',
    });

    res.json({ message: 'Application rejected', doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
