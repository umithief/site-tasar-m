
import React, { useEffect, useState } from 'react';
import { BadgeCard } from './BadgeCard';
// Mock service for frontend if backend not ready, but we will assume data comes in
import { achievementService } from '../../services/achievementService';
import { Trophy, ChevronLeft } from 'lucide-react';

// Temporary type re-definition if needed or import from unified types
interface Achievement {
    id: string;
    title: string;
    description: string;
    icon_key: string;
    category: string;
    isUnlocked: boolean;
    unlockedAt?: Date | null;
    progress?: number;
    requirement_value: number;
}

interface TrophyRoomProps {
    userId: string;
    onClose?: () => void;
}

export const TrophyRoom: React.FC<TrophyRoomProps> = ({ userId, onClose }) => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app we would call the API.
        // For demonstration, since the service logic is server-side (node),
        // we might need to mock this data on client OR create an API endpoint.
        // Assuming we built an API endpoint wrapper or sim for now:

        // Simulating data fetch
        const mockFetch = async () => {
            // This data should match the Seed check
            const mockData: Achievement[] = [
                {
                    id: '1',
                    title: 'Centurion',
                    description: 'Ride a total of 1000km',
                    icon_key: 'trophy',
                    category: 'DISTANCE',
                    requirement_value: 1000,
                    isUnlocked: true,
                    unlockedAt: new Date(),
                    progress: 1250,
                },
                {
                    id: '2',
                    title: 'Speed Demon',
                    description: 'Reach a speed of 100km/h',
                    icon_key: 'zap',
                    category: 'SPEED',
                    requirement_value: 100,
                    isUnlocked: false,
                    progress: 85,
                    unlockedAt: null
                },
                {
                    id: '3',
                    title: 'Explorer',
                    description: 'Complete 10 rides',
                    icon_key: 'map',
                    category: 'DISTANCE',
                    requirement_value: 10,
                    isUnlocked: false,
                    progress: 3,
                    unlockedAt: null
                },
                {
                    id: '4',
                    title: 'Social Butterfly',
                    description: 'Participate in 5 group events',
                    icon_key: 'medal',
                    category: 'SOCIAL',
                    requirement_value: 5,
                    isUnlocked: false,
                    progress: 0,
                    unlockedAt: null
                }
            ];

            // In real integration: 
            // const data = await fetch(`/api/users/${userId}/achievements`).then(res => res.json());

            setTimeout(() => {
                setAchievements(mockData);
                setLoading(false);
            }, 800);
        };

        mockFetch();
    }, [userId]);

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0D0D0D]">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full">
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-[#E2FF3B]" />
                            TROPHY ROOM
                        </h2>
                        <p className="text-xs text-gray-500 font-mono">
                            {achievements.filter(a => a.isUnlocked).length} / {achievements.length} UNLOCKED
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E2FF3B]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                        {achievements.map((achievement) => (
                            <BadgeCard key={achievement.id} achievement={achievement} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
