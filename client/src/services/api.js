import axios from 'axios';

// VITE_API_URL should be the full backend URL in production
// e.g. https://perilux-api.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || 
                (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token from localStorage as fallback (for cross-origin where cookies may not work)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;