import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, SocialProfile, ViewState, SocialPost } from '../../types';
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
import { PostCard } from '../social/PostCard';

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

export const WebProfile: React.FC<WebProfileProps> = ({ user: initialUser, onNavigate, onLogout, isOwnProfile: propIsOwnProfile = false }) => {
    const { user: currentUser } = useAuthStore();

    // State to hold the displayed user data, starting with prompt but updating with full fetch
    const [profileUser, setProfileUser] = useState<any>(initialUser);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    const [activeTab, setActiveTab] = useState('feed');
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [profileStats, setProfileStats] = useState({
        followers: 0,
        following: 0,
        totalKm: 12500, // Mock for now
        garageValue: '₺850.000', // Mock
    });

    // Determine ownership robustly
    const isOwnProfile = propIsOwnProfile || (currentUser && profileUser && currentUser._id === profileUser._id);

    // Modal State
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [userListTitle, setUserListTitle] = useState('');
    const [userListUsers, setUserListUsers] = useState<any[]>([]);

    // Follow Logic
    const { mutate: toggleFollow, isPending: isFollowPending } = useFollow();

    // Derive isFollowing
    const isFollowing = currentUser?.following?.some((f: any) =>
        (typeof f === 'string' ? f : f._id) === profileUser._id
    ) ?? false;

    const handleFollow = () => {
        if (!currentUser) {
            notify.error('Lütfen giriş yapın');
            return;
        }

        const newStatus = !isFollowing;
        toggleFollow({ targetUserId: profileUser._id, isCurrentlyFollowing: isFollowing });

        // Optimistic Update
        setProfileStats(prev => ({
            ...prev,
            followers: (typeof prev.followers === 'number' ? prev.followers : 0) + (newStatus ? 1 : -1)
        }));
    };

    const handleStatClick = (type: 'followers' | 'following') => {
        const list = type === 'followers' ? profileUser.followers : profileUser.following;
        const normalizedList = Array.isArray(list) ? list.map((u: any) => typeof u === 'string' ? { _id: u, name: 'User', avatar: '' } : u) : [];

        setUserListUsers(normalizedList);
        setUserListTitle(type === 'followers' ? 'Takipçiler' : 'Takip Edilenler');
        setIsUserListOpen(true);
    };

    // Fetch Extra Data & Full Profile
    useEffect(() => {
        const loadData = async () => {
            if (initialUser._id) {
                // Determine if we need to fetch full profile (e.g. if we don't have garage or detailed stats)
                // For consistency, we try to fetch fresh data mostly
                try {
                    // Fetch Full Profile
                    setIsLoadingProfile(true);
                    const fullProfile = await socialService.getUserProfile(initialUser._id);
                    if (fullProfile) {
                        setProfileUser(fullProfile);

                        // Update stats from full profile
                        setProfileStats(prev => ({
                            ...prev,
                            followers: fullProfile.followersCount || (Array.isArray(fullProfile.followers) ? fullProfile.followers.length : 0),
                            following: fullProfile.followingCount || (Array.isArray(fullProfile.following) ? fullProfile.following.length : 0),
                        }));
                    }

                    // Fetch Posts
                    const fetchedPosts = await socialService.getUserPosts(initialUser._id);
                    setPosts(fetchedPosts);
                } catch (e) {
                    console.error("Failed to load profile data", e);
                } finally {
                    setIsLoadingProfile(false);
                }
            } else {
                // Fallback stats from initialUser if _id missing (unlikely)
                setProfileStats({
                    followers: (initialUser as any).followersCount || 0,
                    following: (initialUser as any).followingCount || 0,
                    totalKm: 12500,
                    garageValue: '₺850.000'
                });
            }
        };
        loadData();
    }, [initialUser, initialUser._id]); // Re-run if prop changes


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
        if ('profileImage' in profileUser) return (profileUser as any).profileImage;
        return profileUser.avatar;
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
            {/* 2. Main Stage (Right Area) */}
            <main className="flex-1 relative overflow-x-hidden transition-all duration-300 ml-0">

                {/* Hero Banner (Parallax) */}
                <div className="relative h-[450px] w-full overflow-hidden">
                    <img
                        src={profileUser.coverImage || "https://images.unsplash.com/photo-1625043484555-47841a752840?q=80&w=2000"}
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
                                        name={profileUser.name}
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
                                    {profileUser.name}
                                    {profileUser.rank && (
                                        <span className="text-sm not-italic font-bold bg-moto-accent text-black px-2 py-1 rounded-sm tracking-normal">
                                            {profileUser.rank}
                                        </span>
                                    )}
                                </h1>
                                <p className="text-gray-400 font-mono text-xs md:text-sm max-w-md">
                                    @{profileUser.username || 'rider'} • {profileUser.bio || 'Adrenaline Junkie • Track Day Enthusiast'}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-bold uppercase tracking-wider mt-2">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-moto-accent" /> {profileUser.address || 'Istanbul, TR'}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-moto-accent" /> Member since {profileUser.joinDate ? new Date(profileUser.joinDate).getFullYear() : '2024'}</span>
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
                                    <>
                                        <button
                                            onClick={handleFollow}
                                            disabled={isFollowPending}
                                            className={`px-8 py-3 font-bold uppercase tracking-wider rounded-xl transition-colors ${isFollowing
                                                ? 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                                                : 'bg-moto-accent text-black hover:bg-[#cbe62b]'
                                                }`}
                                        >
                                            {isFollowPending ? '...' : (isFollowing ? 'Takip Ediliyor' : 'Takip Et')}
                                        </button>

                                    </>
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
                                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-moto-accent shadow-[0_0_10px_#E2FF3B]" />
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
                                className="space-y-6 max-w-2xl mx-auto pb-24"
                            >
                                {posts.map((post) => (
                                    <PostCard key={post._id} post={post} />
                                ))}
                                {posts.length === 0 && (
                                    <div className="text-center py-20 text-gray-500">
                                        <p className="text-lg">Henüz gönderi yok.</p>
                                    </div>
                                )}
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
                                {profileUser.garage && profileUser.garage.length > 0 ? profileUser.garage.map((bike: any) => (
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
                        {activeTab === 'achievements' && (
                            <motion.div
                                key="achievements"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-center py-20"
                            >
                                <div className="text-center p-8 bg-[#0D0D0D] border border-[#E2FF3B]/20 rounded-2xl max-w-md cursor-pointer group hover:border-[#E2FF3B]/50 transition-colors"
                                    onClick={() => onNavigate('achievements' as any)}
                                >
                                    <div className="w-20 h-20 mx-auto bg-[#E2FF3B]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <Award className="w-10 h-10 text-[#E2FF3B]" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">TROPHY ROOM</h3>
                                    <p className="text-gray-400 mb-6">Badges, achievements and stats.</p>
                                    <button className="px-6 py-2 bg-[#E2FF3B] text-black font-bold rounded-lg hover:bg-[#cbe62b] transition-colors uppercase tracking-wider">
                                        Enter Room
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'routes' && (
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
