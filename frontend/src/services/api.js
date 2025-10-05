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
  
  // Member endpoints
  addMember: (stokvelId, memberData) => api.post(`/stokvels/${stokvelId}/members/`, memberData),
  getMembers: (stokvelId) => api.get(`/stokvels/${stokvelId}/members/`),
  
  // Contribution endpoints
  makeContribution: (data) => api.post('/contributions/', data),
  getContributions: (stokvelId) => api.get(`/stokvels/${stokvelId}/contributions/`),
  getMemberContributions: (memberId) => api.get(`/members/${memberId}/contributions/`),
  
  // Payments endpoints
  getAllPayments: () => api.get('/payments/'),
  getStokvelPayments: (stokvelId) => api.get(`/stokvels/${stokvelId}/payments/`),
  getUserPayments: (userId) => api.get(`/users/${userId}/payments/`),
  createPayment: (data) => api.post('/payments/', data),
  
  // Dashboard
  getDashboard: (stokvelId) => api.get(`/dashboard/${stokvelId}`),
}

export default api
