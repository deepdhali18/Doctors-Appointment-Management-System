const express = require('express');
const router = express.Router();
const {
  getAllDoctors, getDoctorById, getMyDoctorProfile,
  updateDoctorProfile, deleteDoctor,
} = require('../controllers/doctorController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getAllDoctors);
router.get('/my-profile', protect, getMyDoctorProfile);
router.get('/:id', getDoctorById);
router.put('/profile', protect, updateDoctorProfile);
router.delete('/:id', protect, adminOnly, deleteDoctor);

module.exports = router;
