/// <reference types="vite/client" />
// Dynamic API URL determination
const getApiUrl = () => {
    // If running on server side (SSR) or test
    if (typeof window === 'undefined') return 'http://localhost:5000/api';

    const hostname = window.location.hostname;

    // Production (Render, Vercel, etc.)
    if (hostname.includes('onrender.com') || hostname.includes('vercel.app')) {
        if (hostname.includes('onrender.com') || hostname.includes('vercel.app')) {
            return 'https://motovibe-api.onrender.com/api'; // Use ABSOLUTE backend URL for cross-domain reqs
        }
    }

    // Local Development - Force Production API for Cloud Sync
    // Change this back to localhost if you have a local backend running
    return 'https://motovibe-api.onrender.com/api';
    // return import.meta.env.VITE_API_URL || `http://${hostname}:5000/api`;
};

export const API_URL = getApiUrl();

export const CONFIG = {
    // FORCE SERVER MODE
    USE_MOCK_API: false, // Ensure this is false for real data
    API_URL: API_URL,

    toggleApiMode: (useMock: boolean) => {
        console.warn("Switching to mock mode is disabled in this version.");
    }
};

console.log('🔌 [Config] Initialized:', {
    mode: CONFIG.USE_MOCK_API ? 'MOCK' : 'LIVE',
    url: CONFIG.API_URL
});
