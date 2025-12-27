import React from 'react';
import { ReelPlayer } from './ReelPlayer';
import { MobileReels } from '../mobile/MobileReels';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

export const ReelsPage: React.FC = () => {
    const { user } = useAuthStore();
    const [reels, setReels] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchReels = async () => {
        try {
            setLoading(true);
            const res = await api.get('/reels');
            // Handle both array and { data: [...] } formats safely
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setReels(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch reels:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchReels();
    }, []);

    if (loading && reels.length === 0) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
    }

    // We use ReelPlayer but we want it to look like a page, not a modal.
    // ReelPlayer currently has a fixed inset-0 z-[200] backing.
    // We can just render it. It will cover everything.
    // However, ReelPlayer expects an `onClose` prop and `initialIndex`.

    return (
        <div className="bg-black min-h-screen">
            {/* Mobile View */}
            <div className="md:hidden">
                <MobileReels reels={reels} currentUser={user} onRefresh={fetchReels} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <ReelPlayer
                    reels={reels}
                    initialIndex={0}
                    onClose={() => { }} // No-op since it's a page
                    currentUser={user}
                />
            </div>
        </div>
    );
};
