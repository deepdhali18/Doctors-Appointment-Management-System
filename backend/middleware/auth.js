const User = require('../models/User');

const protect = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authorized, no session' });
  }
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Account is deactivated' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

const doctorOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'doctor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Doctor access required' });
  }
};

module.exports = { protect, adminOnly, doctorOnly };
