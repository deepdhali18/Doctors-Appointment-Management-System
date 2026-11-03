import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import ApplyDoctor from './pages/ApplyDoctor';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import Chatbot from './components/Chatbot';
import './App.css';

import DemoPayment from './pages/demopayment';
import PaymentResult from './pages/paymentresult';

const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Home />;
};

const App = () => {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/apply-doctor" element={<ProtectedRoute><ApplyDoctor /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/payment/demo/:appointmentId" element={<DemoPayment />}/>
            <Route path="/payment/result" element={<PaymentResult />}/>
          </Routes>
        </main>
        <Chatbot />
        <footer className="footer">
          <p>&copy; 2026 MediConnect. All rights reserved.</p>
        </footer>
      </div>
    </AuthProvider>
  );
};

export default App;
