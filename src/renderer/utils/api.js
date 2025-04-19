import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/auth/refresh', { refreshToken });
        const { token } = response.data;

        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, logout the user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error
      const errorMessage = error.response.data?.message || 'An error occurred';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error('No response from server'));
    } else {
      // Something happened in setting up the request
      return Promise.reject(new Error('Error setting up request'));
    }
  }
);

// API methods
export const stocksApi = {
  getAll: () => api.get('/stocks'),
  getDetails: (symbol) => api.get(`/stocks/${symbol}`),
  getHistory: (symbol, period) => api.get(`/stocks/${symbol}/history?period=${period}`),
  getNews: (symbol) => api.get(`/stocks/${symbol}/news`),
  getAnalysis: (symbol) => api.get(`/stocks/${symbol}/analysis`),
  getOpportunities: () => api.get('/stocks/opportunities'),
  follow: (symbol) => api.post(`/stocks/${symbol}/follow`),
  unfollow: (symbol) => api.delete(`/stocks/${symbol}/follow`),
  setAlert: (symbol, alertData) => api.post(`/stocks/${symbol}/alerts`, alertData),
  getFollowed: () => api.get('/stocks/user/followed'),
};

// WebSocket setup for real-time updates
export const setupWebSocket = (onMessage) => {
  const ws = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:3001');

  ws.onopen = () => {
    console.log('WebSocket connected');
    // Send authentication token
    const token = localStorage.getItem('token');
    if (token) {
      ws.send(JSON.stringify({ type: 'auth', token }));
    }
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    // Attempt to reconnect after 5 seconds
    setTimeout(() => setupWebSocket(onMessage), 5000);
  };

  return ws;
};

export default api; 