import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Calendar, MessageCircle, Settings,
    Grid as GridIcon, Image as ImageIcon, Info, ShieldCheck,
    MoreHorizontal, Heart, MessageSquare, Share2, Camera,
    Trophy, Users as UsersIcon
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { socialService } from '../../services/socialService';
import { UserAvatar } from '../ui/UserAvatar';
import { FollowButton } from './FollowButton';
import { SocialPost } from '../../types';
import { useSocket } from '../../context/SocketContext';

// --- Types & Interfaces ---
interface ProfilePageProps {
    userId: string;
    onNavigate?: (view: string, data?: any) => void;
    onBack?: () => void;
}

// Stats Component for reuse
const StatItem = ({ label, value }: { label: string; value: number }) => (
    <div className="flex flex-col items-center group cursor-pointer">
        <span className="text-2xl md:text-3xl font-display font-black text-white group-hover:text-moto-accent transition-colors">
            {value}
        </span>
        <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-bold font-mono group-hover:text-white transition-colors">
            {label}
        </span>
    </div>
);

export const ProfilePage: React.FC<ProfilePageProps> = ({ userId, onNavigate, onBack }) => {
    const { user: currentUser } = useAuthStore();
    const { socket } = useSocket();
    const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'specs'>('posts');
    const [isOnline, setIsOnline] = useState(false);
    const [realtimeFollowers, setRealtimeFollowers] = useState<number | null>(null);

    const isOwnProfile = currentUser?._id === userId;

    // --- Data Fetching ---
    const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery({
        queryKey: ['profile', userId],
        queryFn: () => socialService.getUserProfile(userId),
        enabled: !!userId
    });

    const { data: posts, isLoading: isPostsLoading } = useQuery({
        queryKey: ['userPosts', userId],
        queryFn: () => socialService.getUserPosts(userId),
        enabled: !!userId
    });

    // --- socket.io Logic ---
    useEffect(() => {
        if (!socket || !userId) return;

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

    // --- Logic Wrappers ---
    const followerCount = realtimeFollowers ?? profile?.followers?.length ?? profile?.followersCount ?? 0;
    const followingCount = profile?.following?.length ?? profile?.followingCount ?? 0;
    const postCount = posts?.length || 0;

    const handleMessage = () => {
        if (onNavigate) {
            onNavigate('social-hub', { openChat: userId });
        }
    };

    // --- Loading & Error States ---
    if (isProfileLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#050505]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-white/10 border-t-moto-accent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-2 h-2 bg-moto-accent rounded-full animate-ping"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (profileError || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-center p-8">
                <Trophy className="w-24 h-24 text-gray-800 mb-6" />
                <h2 className="text-3xl font-display font-bold text-white mb-2">Sürücü Bulunamadı</h2>
                <p className="text-gray-500 mb-8 max-w-md">Aradığınız profil mevcut değil veya garajına çekilmiş.</p>
                <button
                    onClick={onBack}
                    className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                >
                    Rehbere Dön
                </button>
            </div>
        );
    }

    // --- Derived UI Data ---
    const coverImage = profile.coverImage || 'https://images.unsplash.com/photo-1625055088214-5d8f6155680d?q=80&w=2069&auto=format&fit=crop';

    // Safety check for name
    const safeName = profile.name || 'Unknown Rider';
    const safeUsername = profile.username || safeName.toLowerCase().replace(/\s/g, '');


    return (
        <div className="min-h-screen bg-[#050505] text-gray-200 font-sans pb-20 selection:bg-moto-accent/30 selection:text-white">

            {/* 1. Cinematic Hero Header */}
            <div className="relative h-[45vh] lg:h-[500px] w-full overflow-hidden group">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="w-full h-full"
                >
                    <img
                        src={coverImage}
                        alt="Garage Cover"
                        className="w-full h-full object-cover opacity-80"
                    />
                    {/* Heavy Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />

                    {/* Cinematic Noise Texture (Optional visual flair) */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                </motion.div>

                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="absolute top-safe-top left-6 z-50 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-moto-accent hover:text-black hover:border-moto-accent transition-all duration-300 group-hover:scale-110 shadow-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>
                </button>
            </div>

            {/* 2. Identity & Stats Core */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 z-20">
                <div className="flex flex-col lg:flex-row items-end gap-8 mb-12">

                    {/* Floating Avatar */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative mx-auto lg:mx-0"
                    >
                        <div className="relative rounded-full p-1.5 bg-[#050505] ring-1 ring-white/10">
                            <UserAvatar
                                name={safeName}
                                variant="beam"
                                size={140}
                                className="shadow-2xl border-4 border-[#050505]"
                            />
                            {/* Glowing Neon Border Effect */}
                            <div className="absolute inset-0 rounded-full border border-moto-accent/30 shadow-[0_0_30px_rgba(255,59,59,0.2)] pointer-events-none"></div>

                            {/* Online Status Pinger */}
                            {isOnline && (
                                <div className="absolute bottom-4 right-4 w-5 h-5 bg-green-500 border-[3px] border-[#050505] rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                            )}

                            {/* Verified Badge */}
                            {profile.rank === 'Yol Kaptanı' && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1 border-2 border-[#050505]">
                                    <ShieldCheck className="w-3 h-3" />
                                    ELITE
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Identity Info Panel */}
                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-none tracking-tight mb-2">
                                {safeName}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm font-mono text-gray-400 mb-6">
                                <span className="text-moto-accent">@{safeUsername}</span>
                                <span className="hidden sm:inline text-gray-700">|</span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {profile.location || 'Unknown Location'}
                                </span>
                                <span className="hidden sm:inline text-gray-700">|</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Since {new Date(profile.joinDate).getFullYear()}
                                </span>
                            </div>

                            {/* Bio Snippet */}
                            <p className="text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-6 font-light border-l-2 border-moto-accent/50 pl-4">
                                {profile.bio || "Rider bio not initialized."}
                            </p>
                        </motion.div>
                    </div>

                    {/* Dashboard Stats Box */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center gap-8 md:gap-12 shadow-2xl mx-auto lg:mx-0 w-full lg:w-auto justify-center"
                    >
                        <StatItem label="Followers" value={followerCount} />
                        <div className="w-px h-10 bg-white/10"></div>
                        <StatItem label="Following" value={followingCount} />
                        <div className="w-px h-10 bg-white/10"></div>
                        <StatItem label="Ride Outs" value={postCount} />
                    </motion.div>
                </div>

                {/* 3. Command Center (Actions) */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 border-t border-white/10 pt-8">
                    {isOwnProfile ? (
                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-black hover:bg-moto-accent font-black uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-moto-accent/50">
                            <Settings className="w-4 h-4" />
                            System Config
                        </button>
                    ) : (
                        <>
                            <div className="w-full sm:w-auto">
                                <FollowButton
                                    targetUserId={userId}
                                    isFollowing={profile.isFollowing}
                                    className="!w-full !px-8 !py-4 !text-base !font-black !uppercase !tracking-wider !rounded-xl"
                                />
                            </div>
                            <button
                                onClick={handleMessage}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-wider rounded-xl transition-all backdrop-blur-sm group"
                            >
                                <MessageCircle className="w-4 h-4 group-hover:text-moto-accent transition-colors" />
                                Initiate Chat
                            </button>
                        </>
                    )}

                    <button className="p-4 rounded-xl border border-white/10 text-gray-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-colors ml-auto hidden sm:block">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* 4. Content Content Vault (Tabs) */}
                <div className="mb-20">
                    <div className="flex items-center gap-8 border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'posts', label: 'Ride Log', icon: GridIcon },
                            { id: 'media', label: 'Garage & Media', icon: ImageIcon },
                            { id: 'specs', label: 'Rider Specs', icon: Info },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`relative pb-4 flex items-center gap-3 font-bold text-sm tracking-wide uppercase transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-moto-accent' : ''}`} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="active-tab-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-moto-accent shadow-[0_0_10px_#ff3b3b]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* POSTS GRID TAB */}
                            {activeTab === 'posts' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {isPostsLoading ? (
                                        [1, 2, 3].map(i => <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse" />)
                                    ) : posts && posts.length > 0 ? (
                                        posts.map((post: SocialPost) => (
                                            <div key={post._id} className="group relative aspect-square bg-[#111] rounded-2xl overflow-hidden border border-white/5 cursor-pointer hover:border-moto-accent/50 transition-colors">
                                                {/* Image or Text Placeholder */}
                                                {post.images && post.images.length > 0 ? (
                                                    <img src={post.images[0]} alt="Post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center p-6 text-center text-gray-500 bg-white/5">
                                                        <p className="line-clamp-4 text-sm font-mono">{post.content}</p>
                                                    </div>
                                                )}

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                                                    <div className="flex items-center gap-6 font-bold text-white">
                                                        <span className="flex items-center gap-2"><Heart className="w-5 h-5 fill-white" /> {post.likes || 0}</span>
                                                        <span className="flex items-center gap-2"><MessageSquare className="w-5 h-5 fill-white" /> {post.comments || 0}</span>
                                                    </div>
                                                    <button className="px-6 py-2 bg-white/10 hover:bg-moto-accent hover:text-black rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
                                                        View Data
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                                            <Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-400">No signals detected in the log.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* GARAGE TAB */}
                            {activeTab === 'media' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {profile.garage && profile.garage.length > 0 ? (
                                        profile.garage.map((bike: any) => (
                                            <div key={bike._id} className="group relative aspect-[16/9] rounded-2xl overflow-hidden bg-black/50 border border-white/10">
                                                <img
                                                    src={bike.image}
                                                    alt={`${bike.brand} ${bike.model}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-70 group-hover:opacity-100"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                                                    <h3 className="text-xl font-display font-bold text-white uppercase italic">{bike.brand} <span className="text-moto-accent">{bike.model}</span></h3>
                                                    <p className="text-gray-400 text-xs font-mono mt-1 flex items-center gap-4">
                                                        <span>{bike.year}</span>
                                                        <span>|</span>
                                                        <span>{bike.km.toLocaleString()} KM</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                                            <p className="text-gray-500">Garage is empty.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SPECS TAB */}
                            {activeTab === 'specs' && (
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-2xl">
                                    <h3 className="font-mono text-xs text-moto-accent uppercase tracking-widest mb-6">./RIDER_MANIFESTO.log</h3>
                                    <p className="text-gray-300 leading-relaxed font-light mb-8">
                                        {profile.bio || "No bio data available."}
                                    </p>

                                    {profile.equipment && (
                                        <div>
                                            <h4 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-4">./EQUIPMENT_LOADOUT</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.equipment.map((gear: string, idx: number) => (
                                                    <span key={idx} className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-gray-300">
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
    );
};

