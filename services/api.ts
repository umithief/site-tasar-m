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
        if (token && token !== 'null' && token !== 'undefined') {
            config.headers.Authorization = `Bearer ${token}`;
            // System Audit Tracer
            if (process.env.NODE_ENV === 'development') {
                console.debug('🔐 [API] Attaching Token:', token.substring(0, 10) + '...');
            }
        } else {
            // Ensure no invalid Authorization header is sent
            delete config.headers.Authorization;
            if (process.env.NODE_ENV === 'development') {
                console.warn('⚠️ [API] No valid token found in localStorage');
            }
        }
        return config;
    },
    (error) => {
        console.error('❌ [API] Request Error:', error);
        return Promise.reject(error);
    }
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
