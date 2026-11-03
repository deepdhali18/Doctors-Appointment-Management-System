const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true, trim: true },
    fees: { type: Number, required: true },
    experience: { type: Number, default: 0 },
    qualifications: { type: String, trim: true },
    isDoctor: { type: Boolean, default: false },
    applicationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
