import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  changePassword: (data) => API.put('/auth/change-password', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
};

export const userAPI = {
  getAll: () => API.get('/users'),
  getById: (id) => API.get(`/users/${id}`),
  updateProfile: (data) => API.put('/users/profile', data),
};

export const doctorAPI = {
  getAll: (params) => API.get('/doctors', { params }),
  getById: (id) => API.get(`/doctors/${id}`),
  getMyProfile: () => API.get('/doctors/my-profile'),
  updateProfile: (data) => API.put('/doctors/profile', data),
};

export const appointmentAPI = {
  book: (data) => API.post('/appointments', data),
  getMyAppointments: () => API.get('/appointments/my-appointments'),
  getDoctorAppointments: () => API.get('/appointments/doctor-appointments'),
  getAll: () => API.get('/appointments/all'),
  updateStatus: (id, status) => API.put(`/appointments/${id}/status`, { status }),
  cancel: (id) => API.put(`/appointments/${id}/cancel`),
};

export const applicationAPI = {
  submit: (data) => API.post('/applications', data),
  getMyApplication: () => API.get('/applications/my-application'),
  getAll: () => API.get('/applications/all'),
  approve: (id) => API.put(`/applications/${id}/approve`),
  reject: (id) => API.put(`/applications/${id}/reject`),
};

export const notificationAPI = {
  get: () => API.get('/notifications'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
};

export const analyticsAPI = {
  getDashboard: () => API.get('/analytics/dashboard'),
};

export default API;

export const chatbotAPI = {
  message: (message) => API.post('/chatbot/message', { message }),
  getDoctorSlots: (doctorUserId, date) => API.get('/appointments/doctor-slots', { params: { doctorUserId, date } }),
};




export const paymentAPI = {
  createDemoPayment: (appointmentId, method) =>
    API.post('/payments/demo', { appointmentId, method }),
  completeDemoPayment: (paymentId, outcome) =>
    API.post('/payments/demo/complete', { paymentId, outcome }),
  getPaymentStatus: (appointmentId) =>
    API.get(`/payments/appointment/${appointmentId}`),
  getDoctorPayments: () =>
    API.get('/payments/doctor'),
};
