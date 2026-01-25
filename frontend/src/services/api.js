import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints
export const getTrains = () => api.get('/trains');
export const getSections = () => api.get('/sections');
export const getConflicts = () => api.get('/conflicts');

export default api;
