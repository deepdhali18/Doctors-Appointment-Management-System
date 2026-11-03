
const Payment = require('../models/payment');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// Create a payment record for an existing appointment
exports.createDemoPayment = async (req, res) => {
  try {
    const { appointmentId, method } = req.body;
    const patientId = req.session.userId;

    if (!appointmentId || !['upi', 'card', 'netbanking'].includes(method)) {
      return res.status(400).json({
        message: 'Appointment and valid payment method are required.'
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: patientId
    }).populate('doctor');

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found.'
      });
    }

    if (['cancelled', 'rejected'].includes(appointment.status)) {
      return res.status(400).json({
        message: 'Payment is not available for this appointment.'
      });
    }

    const amount = Number(appointment.doctor?.fees);

    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({
        message: 'The consultation fee is invalid.'
      });
    }

    let payment = await Payment.findOne({
      appointment: appointment._id
    });

    if (payment?.status === 'paid') {
      return res.status(409).json({
        message: 'This appointment has already been paid.',
        payment
      });
    }

    if (payment) {
      payment.method = method;
      payment.amount = amount;
      payment.status = 'pending';
      payment.paidAt = null;
      await payment.save();
    } else {
      payment = await Payment.create({
        appointment: appointment._id,
        patient: patientId,
        amount,
        method,
        status: 'pending',
        provider: 'demo'
      });
    }

    return res.status(201).json({
      message: 'Demo payment created.',
      payment
    });
  } catch (error) {
    console.error('Create demo payment error:', error);
    return res.status(500).json({
      message: 'Could not create the payment.'
    });
  }
};


// Simulate a demo payment result
exports.completeDemoPayment = async (req, res) => {
  try {
    const { paymentId, outcome } = req.body;

    if (!['success', 'failure', 'cancel'].includes(outcome)) {
      return res.status(400).json({
        message: 'Invalid demo payment outcome.'
      });
    }

    const payment = await Payment.findOne({
      _id: paymentId,
      patient: req.session.userId,
      provider: 'demo'
    });

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found.'
      });
    }

    if (payment.status === 'paid') {
      return res.json({
        message: 'Payment is already marked as paid.',
        payment
      });
    }

    payment.status =
      outcome === 'success'
        ? 'paid'
        : outcome === 'failure'
          ? 'failed'
          : 'cancelled';

    payment.paidAt =
      outcome === 'success' ? new Date() : null;

    await payment.save();

    return res.json({
      message:
        outcome === 'success'
          ? 'Demo payment successful.'
          : outcome === 'failure'
            ? 'Demo payment failed.'
            : 'Demo payment cancelled.',
      payment
    });
  } catch (error) {
    console.error('Complete demo payment error:', error);
    return res.status(500).json({
      message: 'Could not update the payment.'
    });
  }
};


// Get payment status for a patient's appointment
exports.getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      appointment: req.params.appointmentId,
      patient: req.session.userId
    }).populate('appointment');

    if (!payment) {
      return res.status(404).json({
        message: 'Payment record not found.'
      });
    }

    return res.json({ payment });
  } catch (error) {
    console.error('Get payment status error:', error);
    return res.status(500).json({
      message: 'Could not retrieve payment status.'
    });
  }
};


//doctors view for payment
exports.getDoctorPayments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.session.userId
    });

    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found.'
      });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id
    }).select('_id user date timeSlot status');

    const appointmentIds = appointments.map(
      appointment => appointment._id
    );

    const payments = await Payment.find({
      appointment: { $in: appointmentIds }
    })
      .populate('patient', 'firstname lastname')
      .populate('appointment', 'date timeSlot status')
      .sort({ createdAt: -1 });

    return res.json({ payments });
  } catch (error) {
    console.error('Get doctor payments error:', error);

    return res.status(500).json({
      message: 'Could not retrieve doctor payments.'
    });
  }
};
