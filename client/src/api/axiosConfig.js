import axios from 'axios';
import { toast } from 'react-hot-toast';

// Use relative URL for same-origin requests, supports both dev and production
// In development, proxy handles /api -> localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle token expiration and errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
        } else if (error.response?.status === 403) {
            toast.error('You do not have permission to perform this action');
        } else if (error.response?.status === 502) {
            toast.error('Server temporarily unavailable. Please try again.');
            console.error('502 Bad Gateway - Server may be restarting or overloaded');
        } else if (error.response?.status === 500) {
            toast.error('Server error. Please try again later.');
        } else if (error.code === 'ECONNABORTED' || error.message === 'timeout of 30000ms exceeded') {
            toast.error('Request timeout. Please check your connection.');
        }
        return Promise.reject(error);
    }
);

export default api;
