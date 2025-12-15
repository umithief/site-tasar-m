
// Bu dosya uygulamanın nerede çalıştığını (Local vs Canlı) otomatik algılar.

const getEnv = () => {
    try {
        // @ts-ignore
        return (import.meta && import.meta.env) ? import.meta.env : {};
    } catch {
        return {};
    }
};

const env = getEnv();

// LocalStorage'dan ayarı oku, yoksa varsayılan olarak TRUE (Mock) yap.
const getMockSetting = () => {
    const stored = localStorage.getItem('mv_use_mock_api');
    return stored !== null ? JSON.parse(stored) : false;
};

export const CONFIG = {
    USE_MOCK_API: getMockSetting(),
    API_URL: env.VITE_API_URL || 'https://motovibe-api.onrender.com/api',

    // Modu değiştir ve sayfayı yenile
    toggleApiMode: (useMock: boolean) => {
        localStorage.setItem('mv_use_mock_api', JSON.stringify(useMock));
        window.location.reload();
    }
};
