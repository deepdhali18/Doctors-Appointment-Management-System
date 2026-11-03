const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

dotenv.config();

// Create a demo account, or refresh it if it already exists.
async function saveUser(details) {
  let user = await User.findOne({ email: details.email.toLowerCase() });

  if (!user) {
    user = new User({ email: details.email.toLowerCase() });
  }

  user.firstname = details.firstname;
  user.lastname = details.lastname;
  user.password = details.password;
  user.role = details.role;
  user.age = details.age;
  user.gender = details.gender;
  user.mobile = details.mobile;
  user.address = details.address;
  user.status = 'active';

  // User.save() triggers the bcrypt password-hashing middleware.
  await user.save();
  return user;
}

// Each doctor needs a User login and a linked Doctor profile.
async function saveDoctor(details) {
  const user = await saveUser({ ...details, role: 'doctor' });
  let doctor = await Doctor.findOne({ user: user._id });

  if (!doctor) {
    doctor = new Doctor({ user: user._id });
  }

  doctor.specialization = details.specialization;
  doctor.fees = details.fees;
  doctor.experience = details.experience;
  doctor.qualifications = details.qualifications;
  doctor.isDoctor = true;
  doctor.applicationStatus = 'approved';

  await doctor.save();
  console.log(`Ready: Dr. ${details.firstname} ${details.lastname} (${details.specialization})`);
}

async function seedData() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    await saveUser({
      firstname: 'Admin', 
      lastname: 'User',
      email: 'admin@doctorapp.com', 
      password: 'admin123', 
      role: 'admin',
      age: 30, 
      gender: 'Male', 
      mobile: '8777801244', 
      address: 'Admin Office'
    });
    console.log('Ready: default admin');

    await saveUser({
      firstname: 'Demo', 
      lastname: 'Patient',
      email: 'user@doctorapp.com', 
      password: 'user123', 
      role: 'user',
      age: 25, 
      gender: 'Male', 
      mobile: '8777801244', 
      address: 'Kolkata, West Bengal'
    });
    console.log('Ready: default patient');

    const demoDoctors = [
      {
        firstname: 'Amit', 
        lastname: 'Sharma', 
        email: 'amit@doctorapp.com', 
        password: 'amit123',
        age: 42, 
        gender: 'Male', 
        mobile: '8777801244', 
        address: 'Kolkata, West Bengal',
        specialization: 'General Physician', 
        fees: 500, experience: 15,
        qualifications: 'MBBS, MD (Internal Medicine)'
      },
      {
        firstname: 'Priya', 
        lastname: 'Sen', 
        email: 'priya@doctorapp.com', 
        password: 'priya123',
        age: 38, 
        gender: 'Female', 
        mobile: '8777801244', 
        address: 'Kolkata, West Bengal',
        specialization: 'Dermatologist', 
        fees: 700, 
        experience: 11,
        qualifications: 'MBBS, MD (Dermatology)'
      },
      {
        firstname: 'Rahul', 
        lastname: 'Das', 
        email: 'rahul@doctorapp.com', 
        password: 'rahul123',
        age: 48, 
        gender: 'Male', 
        mobile: '8777801244', 
        address: 'Kolkata, West Bengal',
        specialization: 'Cardiologist', 
        fees: 1000, 
        experience: 20,
        qualifications: 'MBBS, MD, DM (Cardiology)'
      },
      {
        firstname: 'Ananya', 
        lastname: 'Roy',
        email: 'ananya@doctorapp.com', 
        password: 'ananya123',
        age: 40, 
        gender: 'Female', 
        mobile: '8777801244', 
        address: 'Kolkata, West Bengal',
        specialization: 'Gastroenterologist', 
        fees: 800, 
        experience: 13,
        qualifications: 'MBBS, MD, DM (Gastroenterology)'
      },
      {
        firstname: 'Sourav', 
        lastname: 'Mukherjee', 
        email: 'sourav@doctorapp.com', 
        password: 'sourav123',
        age: 45, 
        gender: 'Male', 
        mobile: '8777801244', 
        address: 'Kolkata, West Bengal',
        specialization: 'Pediatrician', 
        fees: 600, 
        experience: 17,
        qualifications: 'MBBS, MD (Pediatrics)'
      }
    ];

    for (const doctor of demoDoctors) {
      await saveDoctor(doctor);
    }

    console.log('\nDefault development accounts are ready.');
    
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

seedData();
