/// <reference types="vite/client" />
export const API_URL = import.meta.env.VITE_API_URL ||
    ((typeof window !== 'undefined')
        ? `http://${window.location.hostname}:5000/api`
        : 'http://localhost:5000/api');

export const CONFIG = {
    // FORCE SERVER MODE
    USE_MOCK_API: false,
    API_URL: API_URL,

    toggleApiMode: (useMock: boolean) => {
        // No-op or log warning as we are forcing server mode
        console.warn("Switching to mock mode is disabled in this version.");
    }
};

console.log('🔌 [Config] Initialized:', {
    mode: CONFIG.USE_MOCK_API ? 'MOCK' : 'LIVE',
    url: CONFIG.API_URL
});
