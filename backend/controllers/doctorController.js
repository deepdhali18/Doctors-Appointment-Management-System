const Doctor = require('../models/Doctor');
const User = require('../models/User');

exports.getAllDoctors = async (req, res) => {
  try {
    const { search, specialization, page = 1, limit = 12 } = req.query;
    const query = { isDoctor: true };

    if (specialization) query.specialization = specialization;
    if (search) {
      query.$or = [
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Doctor.countDocuments(query);

    let doctors = await Doctor.find(query)
      .populate('user', 'firstname lastname email age gender mobile address role profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    if (search && doctors.length === 0) {
      const users = await User.find({
        $or: [
          { firstname: { $regex: search, $options: 'i' } },
          { lastname: { $regex: search, $options: 'i' } },
        ],
        role: 'doctor',
      }).select('_id');
      const userIds = users.map(u => u._id);
      doctors = await Doctor.find({ user: { $in: userIds }, isDoctor: true })
        .populate('user', 'firstname lastname email age gender mobile address role profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    res.json({ doctors, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'firstname lastname email age gender mobile address');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('user', 'firstname lastname email age gender mobile address');
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    const { specialization, fees, experience, qualifications } = req.body;
    let doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      doctor = await Doctor.create({ user: req.user._id });
    }
    if (specialization) doctor.specialization = specialization;
    if (fees) doctor.fees = fees;
    if (experience !== undefined) doctor.experience = experience;
    if (qualifications) doctor.qualifications = qualifications;

    const updated = await doctor.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await User.findByIdAndUpdate(doctor.user, { role: 'user' });
    await doctor.deleteOne();
    res.json({ message: 'Doctor removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
