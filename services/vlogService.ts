
import { MotoVlog } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';

const MOCK_VLOGS: MotoVlog[] = [
    {
        _id: 'vlog_1',
        title: 'Beyşehir Yolu Gazlama - MT09',
        author: 'Tek Teker Arif',
        locationName: 'Konya - Beyşehir Yolu',
        coordinates: { lat: 37.8500, lng: 32.2000 },
        // YouTube Example (Legacy Support)
        videoUrl: 'https://www.youtube.com/watch?v=3sL0omwZH0A',
        thumbnail: 'https://images.unsplash.com/photo-1558981806-ec527fa84c3d?q=80&w=800&auto=format&fit=crop',
        views: '125B',
        productsUsed: [1, 3]
    },
    {
        _id: 'vlog_2',
        title: 'Antalya Sahil Virajları',
        author: 'MotoVibe Official',
        locationName: 'Kaş - Kalkan',
        coordinates: { lat: 36.2300, lng: 29.5100 },
        // YouTube Example
        videoUrl: 'https://www.youtube.com/watch?v=XIhA8d7767o',
        thumbnail: 'https://images.unsplash.com/photo-1580910543236-0c95332f7a9d?q=80&w=800&auto=format&fit=crop',
        views: '45B',
        productsUsed: [2, 6]
    },
    {
        _id: 'vlog_3',
        title: 'Orman İçi Sakin Sürüş',
        author: 'Nature Rider',
        locationName: 'Belgrad Ormanı',
        coordinates: { lat: 41.1900, lng: 28.9700 },
        // DIRECT MP4 EXAMPLE (Pexels) - Demonstrating new player
        videoUrl: 'https://videos.pexels.com/video-files/3004273/3004273-uhd_2560_1440_30fps.mp4',
        thumbnail: 'https://images.pexels.com/videos/3004273/pictures/preview-0.jpg',
        views: '12B',
        productsUsed: [4, 5]
    },
    {
        _id: 'vlog_4',
        title: 'İstanbul Park Pist Günü',
        author: 'Racing Spirit',
        locationName: 'Intercity İstanbul Park',
        coordinates: { lat: 40.9517, lng: 29.4050 },
        videoUrl: 'https://www.youtube.com/watch?v=5_St7_f99mc',
        thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop',
        views: '210B',
        productsUsed: [8, 1, 3]
    },
    {
        _id: 'vlog_5',
        title: 'Gece Sürüşü - POV',
        author: 'Night Owl',
        locationName: 'İstanbul - Levent',
        coordinates: { lat: 41.0800, lng: 29.0100 },
        // DIRECT MP4 EXAMPLE
        videoUrl: 'https://videos.pexels.com/video-files/5803208/5803208-uhd_2560_1440_30fps.mp4',
        thumbnail: 'https://images.pexels.com/videos/5803208/pictures/preview-0.jpg',
        views: '56B',
        productsUsed: [1, 2]
    }
];

const DB_KEY_VLOGS = 'mv_vlogs';

export const vlogService = {
    async getVlogs(): Promise<MotoVlog[]> {
        if (CONFIG.USE_MOCK_API) {
            await delay(500);
            const storedVlogs = getStorage<MotoVlog[]>(DB_KEY_VLOGS, []);
            if (storedVlogs.length === 0) {
                setStorage(DB_KEY_VLOGS, MOCK_VLOGS);
                return MOCK_VLOGS;
            }
            return storedVlogs;
        } else {
            // REAL BACKEND
            try {
                const response = await fetch(`${CONFIG.API_URL}/vlogs`);
                if (!response.ok) return MOCK_VLOGS;
                return await response.json();
            } catch (error) {
                console.error('Error fetching vlogs:', error);
                return MOCK_VLOGS;
            }
        }
    },

    async addVlog(vlog: Omit<MotoVlog, '_id' | 'views'>): Promise<MotoVlog> {
        if (CONFIG.USE_MOCK_API) {
            await delay(1000);
            const newVlog: MotoVlog = {
                ...vlog,
                _id: `vlog_${Date.now()}`,
                views: '0',
            };
            const vlogs = getStorage<MotoVlog[]>(DB_KEY_VLOGS, []);
            vlogs.unshift(newVlog);
            setStorage(DB_KEY_VLOGS, vlogs);
            return newVlog;
        } else {
            // REAL BACKEND
            const response = await fetch(`${CONFIG.API_URL}/vlogs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vlog)
            });
            if (!response.ok) throw new Error('Vlog eklenemedi');
            return await response.json();
        }
    }
};
