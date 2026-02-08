import axios from 'axios';

// Use environment variable or default to development URL
// In production (Docker), this will be handled by Nginx proxy
const baseURL = import.meta.env.VITE_API_URL || 
                (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;