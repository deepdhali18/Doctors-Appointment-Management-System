const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstname, lastname, age, gender, mobile, address } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (mobile) user.mobile = mobile;
    if (address) user.address = address;

    const updated = await user.save();
    res.json({ _id: updated._id, firstname: updated.firstname, lastname: updated.lastname,
      email: updated.email, role: updated.role, age: updated.age, gender: updated.gender,
      mobile: updated.mobile, address: updated.address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
