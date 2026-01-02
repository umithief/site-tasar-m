import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, SocialProfile, ViewState, SocialPost } from '../../types';
import { MotovibeSidebar } from '../layout/MotovibeSidebar';
import { WebGarageCard } from './WebGarageCard';
import { UserAvatar } from '../ui/UserAvatar';
import { socialService } from '../../services/socialService';
import { useAuthStore } from '../../store/authStore';
import {
    MapPin, Calendar, Heart, MessageCircle,
    Grid, Archive, Route, Award, Settings, LogOut
} from 'lucide-react';
import { notify } from '../../services/notificationService';
import { useFollow } from '../../hooks/useFollow';
import { UserListModal } from '../UserListModal';

interface WebProfileProps {
    user: User | SocialProfile;
    onNavigate: (view: ViewState, data?: any) => void;
    onLogout?: () => void;
    isOwnProfile?: boolean;
}

const TABS = [
    { id: 'feed', label: 'AKIŞ', icon: Grid },
    { id: 'garage', label: 'GARAJ', icon: Archive },
    { id: 'routes', label: 'KAYDEDİLEN ROTALAR', icon: Route },
    { id: 'achievements', label: 'BAŞARILAR', icon: Award },
];

export const WebProfile: React.FC<WebProfileProps> = ({ user, onNavigate, onLogout, isOwnProfile = false }) => {
    const { user: currentUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState('feed');
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [profileStats, setProfileStats] = useState({
        followers: 0,
        following: 0,
        totalKm: 12500, // Mock for now
        garageValue: '₺850.000', // Mock
    });

    // Modal State
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [userListTitle, setUserListTitle] = useState('');
    const [userListUsers, setUserListUsers] = useState<any[]>([]);

    // Follow Logic
    const { mutate: toggleFollow, isPending: isFollowPending } = useFollow();

    // Derive isFollowing properly from the current user's data
    const isFollowing = currentUser?.following?.some((f: any) =>
        (typeof f === 'string' ? f : f._id) === user._id
    ) ?? false;

    const handleFollow = () => {
        if (!currentUser) {
            notify.error('Lütfen giriş yapın');
            return;
        }

        const newStatus = !isFollowing;
        toggleFollow({ targetUserId: user._id, isCurrentlyFollowing: isFollowing });

        // Optimistic Update for displayed stats
        setProfileStats(prev => ({
            ...prev,
            followers: (typeof prev.followers === 'number' ? prev.followers : 0) + (newStatus ? 1 : -1)
        }));
    };

    const handleStatClick = (type: 'followers' | 'following') => {
        const list = type === 'followers' ? user.followers : user.following;
        const normalizedList = Array.isArray(list) ? list.map((u: any) => typeof u === 'string' ? { _id: u, name: 'User', avatar: '' } : u) : [];

        setUserListUsers(normalizedList);
        setUserListTitle(type === 'followers' ? 'Takipçiler' : 'Takip Edilenler');
        setIsUserListOpen(true);
    };

    // Fetch Extra Data
    useEffect(() => {
        const loadData = async () => {
            if (user._id) {
                try {
                    const fetchedPosts = await socialService.getUserPosts(user._id);
                    setPosts(fetchedPosts);
                } catch (e) {
                    console.error("Failed to load posts", e);
                }
            }

            setProfileStats({
                followers: user.followersCount || (Array.isArray(user.followers) ? user.followers.length : 0),
                following: user.followingCount || (Array.isArray(user.following) ? user.following.length : 0),
                totalKm: 12500,
                garageValue: '₺850.000'
            });
        };
        loadData();
    }, [user, isOwnProfile]);


    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const getAvatarSrc = () => {
        if ('profileImage' in user) return (user as any).profileImage;
        return user.avatar;
    };

    return (
        <div className="flex bg-[#050505] min-h-screen text-white font-sans selection:bg-moto-accent selection:text-black">
            <UserListModal
                isOpen={isUserListOpen}
                onClose={() => setIsUserListOpen(false)}
                title={userListTitle}
                users={userListUsers}
                onNavigate={onNavigate}
            />

            {/* 1. Sidebar Integration (Left Fixed) */}
            <MotovibeSidebar
                activeView="profile"
                onNavigate={onNavigate}
                isExpanded={isSidebarExpanded}
                onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
            />

            {/* 2. Main Stage (Right Area) */}
            <main className={`flex-1 relative overflow-x-hidden transition-all duration-300 ${isSidebarExpanded ? 'md:ml-[260px]' : 'md:ml-[80px]'} ml-0`}>

                {/* Hero Banner (Parallax) */}
                <div className="relative h-[450px] w-full overflow-hidden">
                    <img
                        src={user.coverImage || "https://images.unsplash.com/photo-1625043484555-47841a752840?q=80&w=2000"}
                        alt="Cover"
                        className="w-full h-full object-cover fixed-parallax-effect"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#050505]" />

                    {/* Dark gradient overlay at bottom for readability */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent" />
                </div>

                {/* Content Container - Overlapping the Banner */}
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative -mt-32 z-10">

                    {/* Identity & Stats Row */}
                    <div className="flex flex-col xl:flex-row items-end xl:items-center justify-between gap-8 mb-12">

                        {/* Floating Profile Card */}
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-end gap-6"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-moto-accent/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative p-1 bg-[#050505]/50 backdrop-blur-xl border border-white/10 rounded-3xl">
                                    <UserAvatar
                                        src={getAvatarSrc()}
                                        name={user.name}
                                        size={140}
                                        className="rounded-2xl"
                                    />
                                </div>
                                {isOwnProfile && (
                                    <button
                                        onClick={() => onNavigate('settings' as any)}
                                        className="absolute -right-3 -top-3 p-2 bg-moto-accent text-black rounded-full shadow-lg hover:scale-110 transition-transform z-20 border-2 border-black"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="mb-2 space-y-1">
                                <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter italic text-white flex items-center gap-4">
                                    {user.name}
                                    {user.rank && (
                                        <span className="text-sm not-italic font-bold bg-moto-accent text-black px-2 py-1 rounded-sm tracking-normal">
                                            {user.rank}
                                        </span>
                                    )}
                                </h1>
                                <p className="text-gray-400 font-mono text-xs md:text-sm max-w-md">
                                    @{user.username || 'rider'} • {user.bio || 'Adrenaline Junkie • Track Day Enthusiast'}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-bold uppercase tracking-wider mt-2">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-moto-accent" /> {user.address || 'Istanbul, TR'}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-moto-accent" /> Member since {user.joinDate ? new Date(user.joinDate).getFullYear() : '2024'}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats Bar */}
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-wrap items-center gap-8 xl:gap-12"
                        >
                            <StatItem
                                label="Takipçi"
                                value={profileStats.followers}
                                onClick={() => handleStatClick('followers')}
                            />
                            <div className="w-px h-8 bg-white/10 hidden md:block" />
                            <StatItem
                                label="Takip Edilen"
                                value={profileStats.following}
                                onClick={() => handleStatClick('following')}
                            />

                            {/* Desktop only dividers/stats for robustness */}
                            <div className="hidden md:flex items-center gap-12">
                                <div className="w-px h-8 bg-white/10" />
                                <StatItem label="Toplam KM" value="12.5k" isMono />
                                <div className="w-px h-8 bg-white/10" />
                                <StatItem label="Garaj Değeri" value={profileStats.garageValue} isMono highlight />
                            </div>

                            {/* Actions */}
                            <div className="ml-4 pl-8 border-l border-white/10 flex gap-3">
                                {isOwnProfile ? (
                                    <>
                                        <button
                                            onClick={() => onNavigate('settings' as any)}
                                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-white"
                                        >
                                            <Settings className="w-5 h-5" />
                                        </button>
                                        <button onClick={onLogout} className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-colors">
                                            <LogOut className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleFollow}
                                        disabled={isFollowPending}
                                        className={`px-8 py-3 font-bold uppercase tracking-wider rounded-xl transition-colors ${isFollowing
                                            ? 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                                            : 'bg-moto-accent text-black hover:bg-orange-400'
                                            }`}
                                    >
                                        {isFollowPending ? '...' : (isFollowing ? 'Takip Ediliyor' : 'Takip Et')}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* 4. Content Navigation (Sticky) */}
                    <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-y border-white/5 mb-8 -mx-8 px-8 py-2">
                        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`group flex items-center gap-2 py-4 relative text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-moto-accent' : 'text-gray-600 group-hover:text-white'}`} />
                                        {tab.label}
                                        {isActive && (
                                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-moto-accent shadow-[0_0_10px_orange]" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* CONTENT GRIDS using Framer Motion */}
                    <AnimatePresence mode="wait">

                        {/* FEED TAB */}
                        {activeTab === 'feed' && (
                            <motion.div
                                key="feed"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-24"
                            >
                                {posts.map((post) => (
                                    <motion.div
                                        key={post._id}
                                        variants={itemVariants}
                                        className="relative aspect-square bg-[#111] rounded-xl overflow-hidden group cursor-pointer border border-white/5"
                                        onClick={() => onNavigate && onNavigate('post-detail' as any, { postId: post._id })}
                                    >
                                        <img src={post.images?.[0] || 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop'} alt="Post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-white font-bold">
                                                    <Heart className="w-6 h-6 fill-white" />
                                                    {post.likes}
                                                </div>
                                                <div className="flex items-center gap-2 text-white font-bold">
                                                    <MessageCircle className="w-6 h-6 fill-white" />
                                                    {post.comments}
                                                </div>
                                            </div>
                                            <span className="text-moto-accent text-xs font-black uppercase tracking-widest border-b border-moto-accent pb-1">Gönderiyi Gör</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* GARAGE TAB */}
                        {activeTab === 'garage' && (
                            <motion.div
                                key="garage"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-24"
                            >
                                {user.garage && user.garage.length > 0 ? user.garage.map(bike => (
                                    <WebGarageCard
                                        key={bike._id}
                                        bike={bike}
                                        onClick={() => onNavigate('garage' as any)} // Or explicit bike detail
                                    />
                                )) : (
                                    <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                                        <p className="text-gray-400 font-mono">Garaj boş.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* OTHER TABS (Placeholders) */}
                        {(activeTab === 'routes' || activeTab === 'achievements') && (
                            <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-gray-500 font-mono uppercase tracking-widest">
                                Yapım Aşamasında • {activeTab}
                            </motion.div>
                        )}

                    </AnimatePresence>

                </div>
            </main>
        </div>
    );
};

// Helper Component for Stats
const StatItem = ({ label, value, isMono = false, highlight = false, onClick }: { label: string, value: string | number, isMono?: boolean, highlight?: boolean, onClick?: () => void }) => (
    <div
        className={`flex flex-col ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        onClick={onClick}
    >
        <span className={`text-2xl font-black ${isMono ? 'font-mono' : 'font-display'} ${highlight ? 'text-moto-accent' : 'text-white'}`}>
            {value}
        </span>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            {label}
        </span>
    </div>
);
