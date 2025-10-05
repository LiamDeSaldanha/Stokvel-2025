import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Health check
  checkHealth: async () => {
    const response = await apiClient.get('/api/v1/health');
    return response.data;
  },

  // Root endpoint
  getRoot: async () => {
    const response = await apiClient.get('/');
    return response.data;
  },

  // Add more API methods here as needed
};

export default apiClient;
