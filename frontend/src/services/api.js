import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const stokvelAPI = {
  // Health check
  checkHealth: () => api.get('/health'),
  
  // Stokvel endpoints
  createStokvel: (data) => api.post('/stokvels/', data),
  getAllStokvels: () => api.get('/stokvels/'),
  getStokvel: (id) => api.get(`/stokvels/${id}`),
  
  // User endpoints
  createUser: (data) => api.post('/users/', data),
  getAllUsers: () => api.get('/users/'),
  getUser: (id) => api.get(`/users/${id}`),
  
  // Enrollment endpoints
  createEnrollment: (data) => api.post('/enrollments/', data),
  getStokvelEnrollments: (stokvelId) => api.get(`/enrollments/stokvel/${stokvelId}`),
  
  // Payment endpoints
  createPayment: (data) => api.post('/payments/', data),
  getUserPayments: (userId) => api.get(`/payments/user/${userId}`),
  
  // Payments endpoints
  getAllPayments: () => api.get('/payments/'),
  getStokvelPayments: (stokvelId) => api.get(`/stokvels/${stokvelId}/payments/`),
  getUserPayments: (userId) => api.get(`/users/${userId}/payments/`),
  createPayment: (data) => api.post('/payments/', data),
  
  // Dashboard
  getDashboard: (stokvelId) => api.get(`/dashboard/${stokvelId}`),
  
  // AI Chat endpoints
  sendChatMessage: (message) => api.post('/chat', { message }),
  checkChatHealth: () => api.get('/chat/health'),
}

export default api
