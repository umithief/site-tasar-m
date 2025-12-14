
import { MusicTrack } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';

// Varsayılan YouTube Sürüş Listesi
const DEFAULT_YOUTUBE_PLAYLIST: MusicTrack[] = [
    { 
        id: 'yt-1', 
        title: 'Kerosene (Slowed)', 
        artist: 'Crystal Castles', 
        url: 'https://www.youtube.com/watch?v=H33Xo5qR3gY', 
        addedAt: new Date().toLocaleDateString() 
    },
    { 
        id: 'yt-2', 
        title: 'Murder In My Mind', 
        artist: 'Kordhell', 
        url: 'https://www.youtube.com/watch?v=w-sQRS-Lc9k', 
        addedAt: new Date().toLocaleDateString() 
    },
    {
        id: 'yt-3',
        title: 'Metamorphosis',
        artist: 'Interworld',
        url: 'https://www.youtube.com/watch?v=HlM9X38Z3YQ',
        addedAt: new Date().toLocaleDateString()
    },
    {
        id: 'yt-4',
        title: 'Nightcall',
        artist: 'Kavinsky',
        url: 'https://www.youtube.com/watch?v=MV_3Dpw-BRY',
        addedAt: new Date().toLocaleDateString()
    }
];

export const musicService = {
    // Helper to extract ID
    getYouTubeID(url: string): string | null {
        if (!url) return null;
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7] && match[7].length === 11) ? match[7] : null;
    },

    async getMusic(): Promise<MusicTrack[]> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            const stored = getStorage<MusicTrack[]>(DB.MUSIC, []);
            if (stored.length === 0) {
                setStorage(DB.MUSIC, DEFAULT_YOUTUBE_PLAYLIST);
                return DEFAULT_YOUTUBE_PLAYLIST;
            }
            return stored;
        } else {
            // REAL BACKEND
            try {
                const response = await fetch(`${CONFIG.API_URL}/music`);
                if (!response.ok) return DEFAULT_YOUTUBE_PLAYLIST;
                return await response.json();
            } catch {
                return DEFAULT_YOUTUBE_PLAYLIST;
            }
        }
    },

    async addMusic(url: string, title: string, artist: string): Promise<MusicTrack> {
        // SADECE YOUTUBE VALIDATION
        const videoId = this.getYouTubeID(url);

        if (!videoId) {
             throw new Error('Lütfen geçerli bir YouTube linki girin (youtube.com veya youtu.be)');
        }

        // Temizlenmiş URL'i kaydet (Embed veya Watch formatı fark etmez, player ID kullanacak)
        const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;

        const newTrack: MusicTrack = {
            id: `track-${Date.now()}`,
            title,
            artist,
            url: cleanUrl,
            addedAt: new Date().toLocaleDateString('tr-TR')
        };

        if (CONFIG.USE_MOCK_API) {
            await delay(500);
            const list = getStorage<MusicTrack[]>(DB.MUSIC, []);
            list.push(newTrack);
            setStorage(DB.MUSIC, list);
            return newTrack;
        } else {
            // REAL BACKEND
            const response = await fetch(`${CONFIG.API_URL}/music`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTrack)
            });
            if(!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Hata');
            }
            return await response.json();
        }
    },

    async updateMusic(track: MusicTrack): Promise<void> {
        const videoId = this.getYouTubeID(track.url);
        if (!videoId) throw new Error('Geçersiz YouTube Linki');

        // Normalize URL for update
        const updatedTrack = { ...track, url: `https://www.youtube.com/watch?v=${videoId}` };

        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            const list = getStorage<MusicTrack[]>(DB.MUSIC, []);
            const index = list.findIndex(m => m.id === track.id);
            if (index !== -1) {
                list[index] = updatedTrack;
                setStorage(DB.MUSIC, list);
            }
        } else {
            // REAL BACKEND
            await fetch(`${CONFIG.API_URL}/music/${track.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTrack)
            });
        }
    },

    async deleteMusic(id: string): Promise<void> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            const list = getStorage<MusicTrack[]>(DB.MUSIC, []);
            const filtered = list.filter(m => m.id !== id);
            setStorage(DB.MUSIC, filtered);
        } else {
            // REAL BACKEND
            await fetch(`${CONFIG.API_URL}/music/${id}`, {
                method: 'DELETE'
            });
        }
    },

    async resetToDefaults(): Promise<MusicTrack[]> {
         if (CONFIG.USE_MOCK_API) {
            await delay(500);
            setStorage(DB.MUSIC, DEFAULT_YOUTUBE_PLAYLIST);
            return DEFAULT_YOUTUBE_PLAYLIST;
         } else {
             return DEFAULT_YOUTUBE_PLAYLIST;
         }
    },

    async importSoundCloudTrending(): Promise<MusicTrack[]> {
        return [];
    }
};
