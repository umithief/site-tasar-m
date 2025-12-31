import React, { useState, useEffect } from 'react';
import { ReelPlayer } from './ReelPlayer';
import { MobileReels } from '../mobile/MobileReels';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Loader2, Film } from 'lucide-react';
import { Button } from '../ui/Button';

// Mock Data for Fallback
const MOCK_REELS = [
    {
        _id: '1',
        videoUrl: 'https://cdn.pixabay.com/vimeo/328889028/motorcycle-22834.mp4?width=720&hash=123',
        user: { _id: 'u1', name: 'MotoMaster', avatar: 'https://i.pravatar.cc/150?u=1' },
        description: 'Viraj keyfi bambaşka! #motovibe #r25',
        likes: 1240,
        comments: 45,
        shares: 12
    },
    {
        _id: '2',
        videoUrl: 'https://cdn.pixabay.com/vimeo/140026369/motorcycle-866.mp4?width=720&hash=456',
        user: { _id: 'u2', name: 'SpeedDemon', avatar: 'https://i.pravatar.cc/150?u=2' },
        description: 'Gece sürüşü terapidir. 🌃',
        likes: 856,
        comments: 23,
        shares: 5
    }
];

export const ReelsPage: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
    const { user } = useAuthStore();
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReels = async () => {
        try {
            setLoading(true);
            const res = await api.get('/reels');
            // Handle both array and { data: [...] } formats safely
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);

            if (data.length > 0) {
                setReels(data);
            } else {
                setReels(MOCK_REELS); // Fallback to mock if API returns empty
            }
        } catch (error) {
            console.error('Failed to fetch reels:', error);
            setReels(MOCK_REELS); // Fallback on error
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchReels();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
                <Loader2 className="w-10 h-10 text-moto-accent animate-spin" />
                <p className="text-gray-400 text-sm animate-pulse">Akış yükleniyor...</p>
            </div>
        );
    }

    if (reels.length === 0) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white text-center px-4">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6">
                    <Film className="w-10 h-10 text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Henüz Video Yok</h2>
                <p className="text-gray-400 mb-6">İlk videoyu sen yükle ve topluluğa katıl!</p>
                <Button variant="primary" onClick={() => { }} className="bg-moto-accent text-black font-bold px-8 py-3 rounded-xl">
                    VİDEO YÜKLE
                </Button>
            </div>
        );
    }

    // Full screen player
    return (
        <div className="bg-black min-h-screen fixed inset-0 z-[50]">
            {/* Mobile View */}
            <div className="md:hidden h-full">
                <MobileReels reels={reels} currentUser={user} onRefresh={fetchReels} onBack={() => onNavigate('home')} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block h-full">
                <ReelPlayer
                    reels={reels}
                    initialIndex={0}
                    onClose={() => onNavigate('home')}
                    currentUser={user}
                />
            </div>
        </div>
    );
};
