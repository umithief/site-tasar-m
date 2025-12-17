// Bu dosya uygulamanın nerede çalıştığını (Local vs Canlı) otomatik algılar.

// Canlı API URL'i (Otomatik algılama: Localhost ise 5000, değilse Render)
export const API_URL = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'http://localhost:5000/api'
    : 'https://motovibe-api.onrender.com/api';

// Config nesnesi
export const CONFIG = {
    USE_MOCK_API: false,
    API_URL: API_URL,

    // Modu değiştir ve sayfayı yenile
    toggleApiMode: (useMock: boolean) => {
        localStorage.setItem('mv_use_mock_api', JSON.stringify(useMock));
        window.location.reload();
    }
};

console.log('🔌 [Config] Initialized:', {
    mode: CONFIG.USE_MOCK_API ? 'MOCK' : 'LIVE',
    url: CONFIG.API_URL
});
