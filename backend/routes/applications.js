const express = require('express');
const router = express.Router();
const {
  submitApplication, getMyApplication, getAllApplications,
  approveApplication, rejectApplication,
} = require('../controllers/applicationController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, submitApplication);
router.get('/my-application', protect, getMyApplication);
router.get('/all', protect, adminOnly, getAllApplications);
router.put('/:id/approve', protect, adminOnly, approveApplication);
router.put('/:id/reject', protect, adminOnly, rejectApplication);

module.exports = router;
