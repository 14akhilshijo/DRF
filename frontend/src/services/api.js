import axios from 'axios';

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          // Retry the original request
          error.config.headers.Authorization = `Bearer ${response.data.access}`;
          return axios.request(error.config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    return response.data;
  },
  
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await api.post('/auth/logout/', { refresh_token: refreshToken });
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};

// Assets API
export const assetsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/assets/', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/assets/${id}/`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/assets/', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/assets/${id}/`, data);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/assets/${id}/`);
  },
};

// Inventory API
export const inventoryAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/inventory/', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/inventory/${id}/`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/inventory/', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/inventory/${id}/`, data);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/inventory/${id}/`);
  },
  
  getLowStock: async () => {
    const response = await api.get('/inventory/low_stock/');
    return response.data;
  },
};

// Assignments API
export const assignmentsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/assignments/', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/assignments/${id}/`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/assignments/', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/assignments/${id}/`, data);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/assignments/${id}/`);
  },
  
  getToday: async () => {
    const response = await api.get('/assignments/today/');
    return response.data;
  },
};

// Tickets API
export const ticketsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/tickets/', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/tickets/${id}/`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/tickets/', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/tickets/${id}/`, data);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/tickets/${id}/`);
  },
  
  getOpen: async () => {
    const response = await api.get('/tickets/open/');
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats/');
    return response.data;
  },
};

export default api;