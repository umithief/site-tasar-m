import axios from 'axios';
import { CONFIG } from './config';

// Create Axios Instance
export const api = axios.create({
    baseURL: CONFIG.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Errors (Global 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Session expired or unauthorized. Redirecting to login...');
            // Optional: Clear token and redirect
            // localStorage.removeItem('token');
            // window.location.href = '/login'; // Or use a global event emitter to trigger Auth Modal
        }
        const message = error.response?.data?.message || 'Bir hata oluştu.';
        return Promise.reject(new Error(message));
    }
);
