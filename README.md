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

| Role  | Email                  | Password |
|-------|------------------------|----------|
| Admin | admin@doctorapp.com    | admin123 |
| Demo user | user@doctorapp.com  | user123 |

## Project Structure
```bash

```

```bash 
Doctors and patients can registered from the app. 
```
