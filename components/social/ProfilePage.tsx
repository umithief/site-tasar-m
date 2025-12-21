import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Calendar, Link as LinkIcon, MessageCircle,
    Settings, Grid, Image as ImageIcon, Info, ShieldCheck,
    MoreHorizontal, Camera
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { socialService } from '../../services/socialService';
import { UserAvatar } from '../ui/UserAvatar';
import { FollowButton } from './FollowButton';
import { PostCard } from './PostCard';
import { SocialPost, User, SocialProfile } from '../../types';
import { useSocket } from '../../context/SocketContext';

interface ProfilePageProps {
    userId: string;
    onNavigate?: (view: string, data?: any) => void;
    onBack?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ userId, onNavigate, onBack }) => {
    const { user: currentUser } = useAuthStore();
    const { socket } = useSocket();
    const [activeTab, setActiveTab] = useState<'posts' | 'garage' | 'about'>('posts');
    const [isOnline, setIsOnline] = useState(false);
    const [realtimeFollowers, setRealtimeFollowers] = useState<number | null>(null);

    const isOwnProfile = currentUser?._id === userId;

    // Fetch User Profile
    const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery({
        queryKey: ['userProfile', userId],
        queryFn: () => socialService.getUserProfile(userId),
        enabled: !!userId
    });

    // Fetch User Posts
    const { data: posts, isLoading: isPostsLoading } = useQuery({
        queryKey: ['userPosts', userId],
        queryFn: () => socialService.getUserPosts(userId),
        enabled: !!userId
    });

    // Real-time Online Status & Follower Updates
    useEffect(() => {
        if (!socket || !userId) return;

        // Check if user is online (emit event to server to check, or listen for status)
        // For now, assuming we listen for specific events if server supports it
        // Simulating online status check based on socket presence if needed
        socket.emit('check_online_status', { userId });

        const handleStatus = (data: { userId: string, isOnline: boolean }) => {
            if (data.userId === userId) setIsOnline(data.isOnline);
        };

        const handleNewFollower = (data: { targetUserId: string, newCount: number }) => {
            if (data.targetUserId === userId) {
                setRealtimeFollowers(data.newCount);
            }
        };

        socket.on('user_status', handleStatus);
        socket.on('follower_update', handleNewFollower);

        return () => {
            socket.off('user_status', handleStatus);
            socket.off('follower_update', handleNewFollower);
        };
    }, [socket, userId]);

    // Update followers count when profile loads or realtime update happens
    const followerCount = realtimeFollowers ?? profile?.followers?.length ?? profile?.followersCount ?? 0;
    const followingCount = profile?.following?.length ?? profile?.followingCount ?? 0;

    if (isProfileLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f9fafb]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moto-accent"></div>
            </div>
        );
    }

    if (profileError || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9fafb] text-center p-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Profil Bulunamadı</h2>
                <p className="text-gray-500 mb-6">Aradığınız sürücü profili mevcut değil veya erişilemiyor.</p>
                <button onClick={onBack} className="text-moto-accent font-bold hover:underline">Geri Dön</button>
            </div>
        );
    }

    // Determine Cover Image
    const coverImage = profile.coverImage || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop';

    const handleMessage = () => {
        if (onNavigate) {
            // Navigate to SocialHub with intent to chat
            onNavigate('social-hub', { openChat: userId });
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] pb-20">
            {/* 1. Cover Image */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-full"
                >
                    <img
                        src={coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </motion.div>

                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20 z-20">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-6 md:p-8">
                        {/* 2. Profile Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">

                            {/* Avatar & Info */}
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full md:w-auto">
                                <div className="relative -mt-16 md:-mt-20">
                                    <div className="p-1.5 bg-white rounded-full shadow-lg">
                                        <div className="relative">
                                            <UserAvatar
                                                name={profile.name}
                                                variant="beam"
                                                size={120}
                                                className="shadow-inner"
                                            />
                                            {isOnline && (
                                                <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full animate-pulse" />
                                            )}
                                        </div>
                                    </div>
                                    {profile.rank === 'Yol Kaptanı' && (
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" />
                                            Premium
                                        </div>
                                    )}
                                </div>

                                <div className="text-center md:text-left flex-1">
                                    <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                                        {profile.name}
                                        {profile.isVerified && (
                                            <span className="text-blue-500" title="Doğrulanmış Hesap">
                                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                                            </span>
                                        )}
                                    </h1>
                                    <p className="text-gray-500 font-medium">@{profile.username || (profile.name || '').toLowerCase().replace(/\s/g, '')}</p>

                                    {profile.bio && (
                                        <p className="mt-2 text-gray-600 max-w-md">{profile.bio}</p>
                                    )}

                                    <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm text-gray-500">
                                        {profile.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {profile.location}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Katıldı: {new Date(profile.joinDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats & Actions */}
                            <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto">
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{posts?.length || 0}</div>
                                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Posts</div>
                                    </div>
                                    <div className="text-center cursor-pointer hover:opacity-70 transition-opacity">
                                        <div className="text-2xl font-bold text-gray-900">{followerCount}</div>
                                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Followers</div>
                                    </div>
                                    <div className="text-center cursor-pointer hover:opacity-70 transition-opacity">
                                        <div className="text-2xl font-bold text-gray-900">{followingCount}</div>
                                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Following</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isOwnProfile ? (
                                        <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold transition-all">
                                            <Settings className="w-4 h-4" />
                                            Profili Düzenle
                                        </button>
                                    ) : (
                                        <>
                                            <FollowButton
                                                targetUserId={userId}
                                                className="!px-6 !py-2.5 !text-sm !rounded-xl"
                                                isFollowing={profile.isFollowing}
                                            />
                                            <button
                                                onClick={handleMessage}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 rounded-xl font-bold transition-all shadow-sm"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                Mesaj
                                            </button>
                                        </>
                                    )}
                                    <button className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3. Tabs System */}
                        <div className="border-b border-gray-100 mb-8">
                            <div className="flex justify-center md:justify-start gap-8">
                                {[
                                    { id: 'posts', label: 'Posts', icon: Grid },
                                    { id: 'garage', label: 'Garage & Media', icon: ImageIcon },
                                    { id: 'about', label: 'About', icon: Info },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`relative pb-4 px-2 flex items-center gap-2 font-bold text-sm transition-colors ${activeTab === tab.id ? 'text-moto-accent' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="active-tab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-moto-accent rounded-full"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Tab Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'posts' && (
                                    <div className="space-y-6 max-w-2xl mx-auto md:mx-0">
                                        {isPostsLoading ? (
                                            <div className="text-center py-10 text-gray-400">Yükleniyor...</div>
                                        ) : posts && posts.length > 0 ? (
                                            posts.map((post) => (
                                                <PostCard
                                                    key={post._id}
                                                    post={post}
                                                    currentUserId={currentUser?._id}
                                                />
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                <Camera className="w-12 h-12 mb-3 opacity-20" />
                                                <p>Henüz gönderi yok.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'garage' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {profile.garage && profile.garage.length > 0 ? (
                                            profile.garage.map((bike: any) => (
                                                <div key={bike._id} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/5">
                                                    <img
                                                        src={bike.image}
                                                        alt={`${bike.brand} ${bike.model}`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                        <h3 className="text-white font-bold">{bike.brand} {bike.model}</h3>
                                                        <p className="text-gray-300 text-xs">{bike.year} • {bike.km} km</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-12 text-gray-400">
                                                Garaj boş.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'about' && (
                                    <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
                                        <h3 className="font-display font-bold text-gray-900 mb-4">Hakkında</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {profile.bio || "Bu kullanıcı henüz bir biyografi eklemedi."}
                                        </p>

                                        {profile.equipment && (
                                            <div className="mt-8">
                                                <h4 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">Ekipmanlar</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.equipment.map((gear: string, idx: number) => (
                                                        <span key={idx} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600">
                                                            {gear}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                    </div>
                </div>
            </div>
        </div>
    );
};
