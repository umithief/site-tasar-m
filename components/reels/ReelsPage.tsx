import React from 'react';
import { ReelPlayer } from './ReelPlayer';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

export const ReelsPage: React.FC = () => {
    const { user } = useAuthStore();
    const [reels, setReels] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchReels = async () => {
            try {
                const res = await api.get('/reels');
                setReels(res.data);
            } catch (error) {
                console.error('Failed to fetch reels:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReels();
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
    }

    // We use ReelPlayer but we want it to look like a page, not a modal.
    // ReelPlayer currently has a fixed inset-0 z-[200] backing.
    // We can just render it. It will cover everything.
    // However, ReelPlayer expects an `onClose` prop and `initialIndex`.

    return (
        <div className="bg-black min-h-screen">
            <ReelPlayer
                reels={reels}
                initialIndex={0}
                onClose={() => { }} // No-op since it's a page
                currentUser={user}
            />
        </div>
    );
};
