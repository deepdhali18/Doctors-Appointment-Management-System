const express = require('express');
const router = express.Router();
const { protect, doctorOnly } = require('../middleware/auth');
const {
  createDemoPayment,
  completeDemoPayment,
  getPaymentStatus,
  getDoctorPayments,
} = require('../controllers/paymentController');

router.use(protect);
router.post('/demo', createDemoPayment);
router.post('/demo/complete', completeDemoPayment);
router.get('/appointment/:appointmentId', getPaymentStatus);
router.get('/doctor', doctorOnly, getDoctorPayments);

module.exports = router;
