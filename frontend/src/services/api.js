import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const login = (credentials) => api.post('/api/auth/login', credentials);
export const register = (userData) => api.post('/api/auth/register', userData);
export const logout = () => api.post('/api/auth/logout');
export const refreshToken = () => api.post('/api/auth/refresh');

// Train Management APIs
export const getTrains = () => api.get('/api/trains');
export const getTrain = (id) => api.get(`/api/trains/${id}`);
export const createTrain = (trainData) => api.post('/api/trains', trainData);
export const updateTrain = (id, trainData) => api.put(`/api/trains/${id}`, trainData);
export const deleteTrain = (id) => api.delete(`/api/trains/${id}`);

// Section Management APIs
export const getSections = () => api.get('/api/sections');
export const getSection = (id) => api.get(`/api/sections/${id}`);
export const createSection = (sectionData) => api.post('/api/sections', sectionData);
export const updateSection = (id, sectionData) => api.put(`/api/sections/${id}`, sectionData);

// Conflict Management APIs
export const getConflicts = () => api.get('/api/conflicts');
export const getConflict = (id) => api.get(`/api/conflicts/${id}`);
export const resolveConflict = (id, resolution) => api.post(`/api/conflicts/${id}/resolve`, resolution);

// Optimization APIs
export const optimizeSchedule = (optimizationData) => api.post('/api/optimize', optimizationData);
export const getOptimizationHistory = () => api.get('/api/optimize/history');

// AI Recommendation APIs
export const getRecommendations = (conflictId) => api.get(`/api/recommendations/${conflictId}`);
export const acceptRecommendation = (recommendationId) => api.post(`/api/recommendations/${recommendationId}/accept`);
export const overrideRecommendation = (recommendationId, reason) => 
  api.post(`/api/recommendations/${recommendationId}/override`, { reason });

// Analytics APIs
export const getKPIs = (timeRange = '24h') => api.get(`/api/analytics/kpis?range=${timeRange}`);
export const getPerformanceMetrics = () => api.get('/api/analytics/performance');
export const getSystemHealth = () => api.get('/api/analytics/health');

// User Management APIs (Admin only)
export const getUsers = () => api.get('/api/users');
export const createUser = (userData) => api.post('/api/users', userData);
export const updateUser = (id, userData) => api.put(`/api/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/api/users/${id}`);

// Audit Log APIs
export const getAuditLogs = (filters = {}) => api.get('/api/audit', { params: filters });
export const exportAuditLogs = (format = 'csv') => api.get(`/api/audit/export?format=${format}`);

// Simulation APIs
export const simulateScenario = (scenarioData) => api.post('/api/simulate', scenarioData);
export const getSimulationHistory = () => api.get('/api/simulate/history');
export const saveSimulation = (simulationData) => api.post('/api/simulate/save', simulationData);

// Real-time Data APIs
export const getRealtimeStatus = () => api.get('/api/realtime/status');
export const subscribeToUpdates = (callback) => {
  // WebSocket connection for real-time updates
  const ws = new WebSocket(`ws://localhost:5000`);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    callback(data);
  };
  
  return ws;
};

// Gaming Features APIs
export const updateScore = (scoreData) => api.post('/api/gaming/score', scoreData);
export const getLeaderboard = () => api.get('/api/gaming/leaderboard');
export const getUserStats = () => api.get('/api/gaming/stats');
export const unlockAchievement = (achievementId) => api.post(`/api/gaming/achievements/${achievementId}`);

// Export default api instance for custom requests
export default api;