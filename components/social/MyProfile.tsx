import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Camera, Edit2, MapPin, Grid, Bookmark, Bell,
    Plus, Save, X, Trophy, Zap, Wind, Cpu, LogOut,
    LayoutDashboard, Shield, Bike, Image as ImageIcon,
    Activity, Calendar, MessageSquare, Play, Film, Share2, Heart, Award, Wrench, Gauge, ArrowUpRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar } from '../ui/UserAvatar';
import { notify } from '../../services/notificationService';
import { PostCard } from './PostCard';
import { SocialPost, UserBike } from '../../types';
import { authService } from '../../services/auth';
import { gamificationService, RANKS } from '../../services/gamificationService';
import { ZenGarage } from '../ZenGarage';
import { UserListModal } from '../UserListModal';

// --- Types & Mocks ---

// Mock Reels for the 'Reels' tab
const MOCK_REELS = [
    { id: 'r1', thumbnail: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800', views: '12K', likes: '1.2K' },
    { id: 'r2', thumbnail: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800', views: '8.5K', likes: '950' },
    { id: 'r3', thumbnail: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=800', views: '22K', likes: '2.5K' },
];

const MOCK_MY_POSTS: SocialPost[] = [
    {
        _id: 'mp1',
        userId: 'current',
        userName: 'Ben',
        userAvatar: '',
        content: 'Yeni egzoz sistemi montajı tamamlandı. Ses efsane! 🏍️🔥',
        images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop'],
        likes: 142,
        comments: 18,
        shares: 5,
        timestamp: '2 gün önce',
        isLiked: true,
        bikeModel: 'Yamaha R6'
    },
    {
        _id: 'mp2',
        userId: 'current',
        userName: 'Ben',
        userAvatar: '',
        content: 'Hafta sonu rotası: Şile - Ağva. Katılmak isteyen?',
        images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop'],
        likes: 89,
        comments: 42,
        shares: 12,
        timestamp: '5 gün önce',
        isLiked: false
    }
];

export const MyProfile: React.FC = () => {
    const { user, updateProfile } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'garage' | 'saved'>('posts');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Gamification State
    const [nextRank, setNextRank] = useState<{ name: string; required: number; progress: number }>({ name: '', required: 0, progress: 0 });

    const [editForm, setEditForm] = useState({
        name: user?.name || '',
        username: user?.username || '',
        bio: user?.bio || '',
        location: user?.location || '',
        coverImage: user?.coverImage || ''
    });

    // User List Modal State
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [userListType, setUserListType] = useState<'followers' | 'following'>('followers');
    const [modalUsers, setModalUsers] = useState<any[]>([]);

    const handleOpenUserList = async (type: 'followers' | 'following') => {
        if (!user) return;

        const list = type === 'followers' ? user.followers : user.following;

        // If list is empty or undefined, nothing to show (or show empty modal if count > 0 but list empty? simplified logic for now)
        // If we have counts but empty list, we must fetch

        const count = type === 'followers' ? (user.followersCount || 0) : (user.followingCount || 0);

        if (count === 0 && (!list || list.length === 0)) {
            setModalUsers([]);
            setUserListType(type);
            setIsUserListOpen(true);
            return;
        }

        // Check if list items are objects
        // Verify ALL items are objects (to handle mixed state from optimistic updates)
        const allObjects = list.every((item: any) => typeof item === 'object' && item !== null && (item._id || item.id || item.name));

        if (list && list.length > 0 && allObjects) {
            setModalUsers(list);
            setUserListType(type);
            setIsUserListOpen(true);
            return;
        }

        // Fetch details
        try {
            const fullProfile = await import('../../services/socialService').then(m => m.socialService.getUserProfile(user._id));
            if (fullProfile) {
                setModalUsers(type === 'followers' ? (fullProfile.followers || []) : (fullProfile.following || []));
            }
        } catch (error) {
            console.error('Failed to fetch user list details', error);
            setModalUsers([]);
        }

        setUserListType(type);
        setIsUserListOpen(true);
    };

    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                username: user.username || '',
                bio: user.bio || '',
                location: user.location || '',
                coverImage: user.coverImage || ''
            });

            // Calculate Rank Progress
            const points = user.points || 0;
            let target = 0;
            let nextR = '';
            let prevTarget = 0;

            if (points < RANKS.BEGINNER.max) {
                target = RANKS.BEGINNER.max;
                nextR = RANKS.INTERMEDIATE.name;
                prevTarget = 0;
            } else if (points < RANKS.INTERMEDIATE.max) {
                target = RANKS.INTERMEDIATE.max;
                nextR = RANKS.EXPERT.name;
                prevTarget = RANKS.BEGINNER.max;
            } else {
                target = RANKS.EXPERT.max; // Infinity basically
                nextR = 'MAX LEVEL';
                prevTarget = RANKS.INTERMEDIATE.max;
            }

            const totalNeeded = target - prevTarget;
            const currentInLevel = points - prevTarget;
            const percentage = Math.min(100, Math.max(0, (currentInLevel / totalNeeded) * 100));

            setNextRank({
                name: nextR,
                required: target,
                progress: nextR === 'MAX LEVEL' ? 100 : percentage
            });
        }
    }, [user]);

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            await updateProfile(editForm);
            setIsEditing(false);
            notify.success('Profil güncellendi.');
        } catch (error: any) {
            notify.error('Hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    // --- Sub-Components ---

    const RankProgressBar = () => (
        <div className="w-full mt-6 mb-2">
            <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Current Rank</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 animate-pulse">Next: {nextRank.name}</span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${nextRank.progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-400"
                />
            </div>
            <div className="flex justify-between mt-1 text-[9px] font-mono text-gray-400">
                <span>{user.points || 0} XP</span>
                <span>{nextRank.required === Infinity ? '∞' : nextRank.required} XP</span>
            </div>
        </div>
    );

    const StatItem: React.FC<{ label: string, value: string | number, icon: any, onClick?: () => void }> = ({ label, value, icon: Icon, onClick }) => (
        <div
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:shadow-md transition-all group ${onClick ? 'cursor-pointer' : ''}`}
        >
            <Icon className="w-4 h-4 mb-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span className="text-lg font-display font-black text-gray-900">{value}</span>
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold group-hover:text-gray-900 transition-colors">{label}</span>
        </div>
    );

    const GarageCard: React.FC<{ bike?: UserBike, isAdd?: boolean }> = ({ bike, isAdd }) => {
        if (isAdd) return (
            <motion.button
                whileHover={{ scale: 0.99 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => notify.info('Yeni araç ekleme yakında!')}
                className="group relative h-[380px] w-full rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-400 hover:shadow-lg transition-all flex flex-col items-center justify-center overflow-hidden"
            >
                {/* Blueprint Grid Background */}
                <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

                <div className="relative z-10 w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-blue-500 transition-all duration-500 shadow-sm group-hover:shadow-blue-200">
                    <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                </div>

                <h3 className="relative z-10 text-lg font-display font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-widest transition-colors duration-300">
                    Acquire Machine
                </h3>
                <p className="relative z-10 text-[10px] text-gray-400 font-mono mt-2 uppercase tracking-widest group-hover:text-blue-500 transition-colors duration-300">
                    Initialize New Protocol
                </p>
            </motion.button>
        );

        return (
            <motion.div
                layoutId={`bike-card-${bike?._id}`}
                className="group relative h-[380px] w-full rounded-[2rem] overflow-hidden cursor-pointer bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-500"
            >
                {/* Image Layer - Full Bleed */}
                <div className="absolute inset-0 z-0">
                    <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        src={bike?.image}
                        alt={bike?.model}
                        className="w-full h-full object-cover transition-all duration-700"
                    />
                    {/* Light Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent opacity-60" />
                </div>

                {/* Floating Glass Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                    {/* Top: Status Badge */}
                    <div className="flex justify-between items-start">
                        <div className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">{bike?.brand}</span>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-md border border-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-500 hover:border-blue-500 hover:text-white hover:scale-110 shadow-sm">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Bottom: Info & Specs */}
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-2xl font-display font-black text-gray-900 uppercase leading-[0.9] mb-3 italic drop-shadow-sm">
                            {bike?.model}
                        </h3>

                        {/* Tech Specs Grid */}
                        <div className="grid grid-cols-2 gap-2 max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-white/50 flex flex-col justify-center shadow-sm">
                                <div className="flex items-center gap-1 mb-1">
                                    <Gauge className="w-3 h-3 text-blue-500" />
                                    <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Mileage</span>
                                </div>
                                <span className="text-sm font-mono font-bold text-gray-900 leading-none">{bike?.km} <span className="text-[9px] text-gray-500">KM</span></span>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-white/50 flex flex-col justify-center shadow-sm">
                                <div className="flex items-center gap-1 mb-1">
                                    <Calendar className="w-3 h-3 text-blue-500" />
                                    <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Year</span>
                                </div>
                                <span className="text-sm font-mono font-bold text-gray-900 leading-none">{bike?.year}</span>
                            </div>
                        </div>

                        {/* Default View (Hidden on Hover) */}
                        <div className="flex items-center gap-4 mt-2 group-hover:hidden transition-all delay-75">
                            <div className="flex items-center gap-2">
                                <Wrench className="w-3 h-3 text-gray-500" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{bike?.modifications?.length || 0} Improvements</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans pb-24">
            {/* 1. Cinematic Header */}
            <div className="relative h-72 lg:h-96 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white z-10" />
                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                    src={user.coverImage || 'https://images.unsplash.com/photo-1625055088214-5d8f6155680d?q=80&w=2069'}
                    alt="Cover"
                    className="w-full h-full object-cover opacity-90"
                />

                <div className="absolute top-6 right-6 z-20 flex gap-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="h-10 px-6 bg-white/80 backdrop-blur-md border border-white/50 rounded-full hover:bg-white hover:shadow-md transition-all text-xs font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2 shadow-sm"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="hidden md:inline">Edit Profile</span>
                    </button>
                    {user.isAdmin && (
                        <button className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg shadow-blue-200">
                            <Shield className="w-5 h-5 fill-current" />
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* 2. Sticky Sidebar (Left) */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-24">
                            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 relative overflow-hidden group">
                                {/* Ambient Light Effect */}
                                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-2xl pointer-events-none" />

                                <div className="relative flex flex-col items-center text-center z-10">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-10 animate-pulse" />
                                        <UserAvatar
                                            name={user.name}
                                            size={120}
                                            className="border-[6px] border-white relative z-20 shadow-2xl"
                                        />
                                        <div className="absolute bottom-1 right-1 z-30 bg-white border border-gray-100 p-1.5 rounded-full text-blue-600 shadow-lg">
                                            {user.rank === 'Yol Kaptanı' ? <Shield className="w-4 h-4 fill-current" /> : <Award className="w-4 h-4" />}
                                        </div>
                                    </div>

                                    <h1 className="text-3xl font-display font-black uppercase text-gray-900 tracking-tight mb-1">
                                        {user.name}
                                    </h1>
                                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6 border border-gray-100 px-3 py-1 rounded-full bg-gray-50">
                                        {user.rank || 'Rider'}
                                    </p>

                                    {/* Rank Progress */}
                                    <RankProgressBar />

                                    <div className="w-full h-[1px] bg-gray-100 my-6" />

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-3 w-full mb-6">
                                        <StatItem
                                            label="Followers"
                                            value={Array.isArray(user.followers) ? user.followers.length : (user.followersCount || 0)}
                                            icon={UserAvatar}
                                            onClick={() => handleOpenUserList('followers')}
                                        />
                                        <StatItem
                                            label="Following"
                                            value={Array.isArray(user.following) ? user.following.length : (user.followingCount || 0)}
                                            icon={UserAvatar}
                                            onClick={() => handleOpenUserList('following')}
                                        />
                                        <StatItem label="Garage" value={user.garage?.length || 0} icon={Bike} />
                                        <StatItem label="Rides" value={'42'} icon={MapPin} />
                                    </div>

                                    <div className="text-xs text-gray-400 font-mono text-center leading-relaxed px-2">
                                        {user.bio || "No bio yet. Just riding."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Main Content (Right) */}
                    <div className="lg:col-span-8 xl:col-span-9 pt-10 lg:pt-0">

                        {/* Tab Navigation */}
                        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-1 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'posts', label: 'Feed', icon: Grid },
                                { id: 'reels', label: 'Reels', icon: Film },
                                { id: 'garage', label: 'Garage', icon: Bike },
                                { id: 'saved', label: 'Saved', icon: Bookmark },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.id
                                        ? 'text-gray-900 bg-gray-100 shadow-sm border border-gray-100'
                                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                                        }`}
                                >
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : ''}`} />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 shadow-sm"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="min-h-[400px]"
                            >
                                {activeTab === 'posts' && (
                                    <div className="max-w-2xl px-1">
                                        {MOCK_MY_POSTS.map(post => (
                                            <PostCard key={post._id} post={post} />
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'reels' && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {MOCK_REELS.map(reel => (
                                            <div key={reel.id} className="group relative aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden cursor-pointer border border-gray-100 hover:shadow-lg transition-all">
                                                <img src={reel.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/50">
                                                        <Play className="w-5 h-5 fill-current ml-1" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                                                    <div className="flex items-center gap-3 text-xs font-bold text-white">
                                                        <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {reel.views}</span>
                                                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {reel.likes}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Create Reel Placeholder */}
                                        <div
                                            onClick={() => notify.info('Reel yükleme yakında!')}
                                            className="aspect-[9/16] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white hover:border-blue-400 hover:shadow-md transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                                <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-blue-500">New Reel</span>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'garage' && (
                                    <ZenGarage
                                        bikes={user.garage || []}
                                        isEditable={true}
                                        onAdd={() => notify.info('Yeni araç ekleme yakında!')}
                                        onBikeClick={(bike) => notify.info(`Viewing ${bike.model}`)}
                                    />
                                )}

                                {activeTab === 'saved' && (
                                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                                        <Bookmark className="w-10 h-10 text-gray-300 mb-4" />
                                        <h3 className="text-gray-900 font-bold mb-1">Boş Koleksiyon</h3>
                                        <p className="text-gray-500 text-xs">Henüz bir içerik kaydetmedin.</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* --- Premium Edit Modal --- */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white border border-gray-100 w-full max-w-5xl h-[90vh] md:max-h-[800px] rounded-[2rem] overflow-hidden flex shadow-2xl relative"
                        >
                            <button
                                onClick={() => setIsEditing(false)}
                                className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 text-gray-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Decorative Grid */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

                            <div className="w-full h-full flex flex-col md:flex-row relative z-10">
                                {/* Left: Visual Preview */}
                                <div className="md:w-[40%] bg-gray-50 border-r border-gray-100 p-10 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="relative group cursor-pointer mb-8">
                                        <div className="absolute inset-0 bg-blue-500 rounded-full opacity-0 group-hover:opacity-20 blur-3xl transition-all duration-700" />
                                        <UserAvatar name={editForm.name} size={180} className="border-4 border-white relative z-10 shadow-2xl" />
                                        <div className="absolute bottom-2 right-2 z-20 bg-white text-black p-3 rounded-full hover:scale-110 cursor-pointer shadow-lg transition-transform border border-gray-100">
                                            <Camera className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-display font-black text-gray-900 uppercase text-center">{editForm.name || 'GUEST'}</h2>
                                    <p className="text-sm font-mono text-blue-600 uppercase tracking-widest mt-2">@{editForm.username}</p>
                                </div>

                                {/* Right: Form Fields */}
                                <div className="flex-1 p-10 md:p-14 overflow-y-auto custom-scrollbar">
                                    <h2 className="text-2xl font-display font-black text-gray-900 uppercase mb-10 flex items-center gap-3">
                                        <Settings className="w-6 h-6 text-blue-600" />
                                        System Configuration
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-blue-600 transition-colors">Operator Name</label>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-bold text-gray-900 focus:border-blue-600 outline-none transition-colors placeholder-gray-300"
                                                placeholder="Enter name"
                                            />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-blue-600 transition-colors">Callsign (Username)</label>
                                            <input
                                                type="text"
                                                value={editForm.username}
                                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-bold text-gray-900 focus:border-blue-600 outline-none transition-colors placeholder-gray-300"
                                                placeholder="@username"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group mb-8">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-blue-600 transition-colors">Bio / Mission Statement</label>
                                        <textarea
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 focus:border-blue-600 focus:bg-white outline-none transition-all min-h-[120px] resize-none placeholder-gray-400"
                                            placeholder="Describe your profile..."
                                        />
                                    </div>

                                    <div className="space-y-2 group mb-12">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-blue-600 transition-colors">Base Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={editForm.location}
                                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-200 py-3 pl-8 text-lg font-bold text-gray-900 focus:border-blue-600 outline-none transition-colors placeholder-gray-300"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-4">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="px-10 py-4 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center gap-2"
                                        >
                                            {loading ? 'Saving...' : 'Save Configuration'}
                                            <Save className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <UserListModal
                isOpen={isUserListOpen}
                onClose={() => setIsUserListOpen(false)}
                title={userListType === 'followers' ? 'Takipçiler' : 'Takip Edilenler'}
                users={modalUsers}
            />
        </div>
    );
};
