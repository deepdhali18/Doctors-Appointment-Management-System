# Doctors-Appointment-Management-System

MERN stack doctor appointment system with patient, doctor, and admin roles.
  1. Frontend: React 18 (Create React App) on http://localhost:3000
  2. Backend: Node/Express on http://localhost:5000
  3. Database: MongoDB

## Features:
1. New Patient registration and login.
2. Doctor registration and login.
3. Appointment booking with available-day and time-slot.
4. Appointment status flow: pending, approved, rejected, completed, cancelled.
5. Doctor and patient appointment views with status filters.
6. In-app notifications with deep links to the matching appointment filter.
7. Admin dashboard for overall system view.
8. Doctor Dashboard for doctor's scheduled appointments list and approving/cancellation appointments option by doctor.
9. Doctor Dashboard for payment status of the appontment.
10. A chat-bot feature for patients to choose the right doctor and their appointment as per their illness.
11. Demo payment page with payment status notification.


## Requirements

- Node.js 18 or newer
- MongoDB running locally (or a MongoDB Atlas connection string)

## Setup

### 1. Backend

```bash
cd backend
npm install
```

```bash
npm run seed
npm start
```

Backend runs on http://localhost:5000.

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs on http://localhost:3000.

## Seed accounts

| Role       | Specialization       | Email                  | Password  |
|------------|----------------------|------------------------|-----------|
| Admin      | -                    | admin@doctorapp.com    | admin123  |
| Demo User  | -                    | user@doctorapp.com     | user123   |
| Demo Doctor     | General Physician    | amit@doctorapp.com     | amit123   |
| Demo Doctor     | Dermatologist        | priya@doctorapp.com    | priya123  |
| Demo Doctor     | Cardiologist         | rahul@doctorapp.com    | rahul123  |
| Demo Doctor    | Gastroenterologist   | ananya@doctorapp.com   | ananya123 |
| Demo Doctor     | Pediatrician         | sourav@doctorapp.com   | sourav123 |

## Project Structure
```bash


doctor-app-chatbot/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── applicationController.js
│   │   ├── appointmentController.js
│   │   ├── authController.js
│   │   ├── chatbotController.js
│   │   ├── doctorController.js
│   │   ├── paymentController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── Appointment.js
│   │   ├── Doctor.js
│   │   ├── Notification.js
│   │   ├── payment.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── analytics.js
│   │   ├── applications.js
│   │   ├── appointments.js
│   │   ├── auth.js
│   │   ├── chatbot.js
│   │   ├── doctors.js
│   │   ├── notifications.js
│   │   ├── payments.js
│   │   └── users.js
│   │
│   ├── config/
│   │
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── seedAdmin.js
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chatbot.js
│   │   │   ├── DoctorCalendar.js
│   │   │   ├── Navbar.js
│   │   │   ├── NotificationBell.js
│   │   │   ├── Pagination.js
│   │   │   └── ProtectedRoute.js
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   │
│   │   ├── pages/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── ApplyDoctor.js
│   │   │   ├── Appointments.js
│   │   │   ├── demopayment.js
│   │   │   ├── Doctors.js
│   │   │   ├── ForgotPassword.js
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── paymentresult.js
│   │   │   ├── Profile.js
│   │   │   └── Register.js
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.css
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── package.json
│   └── package-lock.json
│
├── package-lock.json
├── .gitignore                



```

```bash 
Doctors and patients can registered from the app. 
```
