import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Note: Authorization header is now added by AuthContext interceptors
// Token refresh is also handled by AuthContext

// Auth API
export const authAPI = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  refresh: () =>
    api.post('/auth/refresh'),
  
  me: () =>
    api.get('/auth/me')
};

// Projects API
export const projectsAPI = {
  getAll: () =>
    api.get('/projects'),
  
  getById: (id) =>
    api.get(`/projects/${id}`),
  
  create: (data) =>
    api.post('/projects', data),
  
  update: (id, data) =>
    api.put(`/projects/${id}`, data),
  
  delete: (id) =>
    api.delete(`/projects/${id}`)
};

// Tasks API
export const tasksAPI = {
  getAll: (projectId) =>
    api.get('/tasks', { params: { projectId } }),
  
  getById: (id) =>
    api.get(`/tasks/${id}`),
  
  create: (data) =>
    api.post('/tasks', data),
  
  update: (id, data) =>
    api.put(`/tasks/${id}`, data),
  
  delete: (id) =>
    api.delete(`/tasks/${id}`),
  
  updateStatus: (id, status) =>
    api.patch(`/tasks/${id}/status`, { status }),
  
  updateAssignment: (id, assigneeId) =>
    api.patch(`/tasks/${id}/assign`, { assigneeId })
};

// Risk Alerts API
export const risksAPI = {
  getAll: (projectId) =>
    api.get('/risks', { params: { projectId } }),
  
  getById: (id) =>
    api.get(`/risks/${id}`),
  
  resolve: (id) =>
    api.patch(`/risks/${id}/resolve`)
};

// Simulation API
export const simulationAPI = {
  run: (projectId, params) =>
    api.post('/simulation/run', { projectId, ...params })
};

// AI API
export const aiAPI = {
  getRecoveryRecommendations: (data) =>
    api.post('/ai/recovery', data)
};

export default api;
