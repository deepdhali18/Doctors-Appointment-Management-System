const express = require('express');
const router = express.Router();
const { message } = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

const patientOnly = (req, res, next) => {
  if (req.user?.role === 'user') return next();
  return res.status(403).json({ message: 'Chatbot is available only to patients.' });
};

router.post('/message', protect, patientOnly, message);

module.exports = router;
