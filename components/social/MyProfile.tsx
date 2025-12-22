import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Camera, Edit2, MapPin, Grid, Bookmark, Bell,
    Plus, Save, X, Trophy, Zap, Wind, Cpu, LogOut,
    LayoutDashboard, Shield, Bike, Image as ImageIcon,
    Activity, Calendar, MessageSquare, Play, Film, Share2, Heart, Award, Wrench
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar } from '../ui/UserAvatar';
import { notify } from '../../services/notificationService';
import { PostCard } from './PostCard';
import { SocialPost, UserBike } from '../../types';
import { authService } from '../../services/auth';
import { gamificationService, RANKS } from '../../services/gamificationService';

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
                <span className="text-[10px] font-black uppercase tracking-widest text-moto-accent animate-pulse">Next: {nextRank.name}</span>
            </div>
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${nextRank.progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-moto-accent to-orange-500"
                />
            </div>
            <div className="flex justify-between mt-1 text-[9px] font-mono text-gray-500">
                <span>{user.points || 0} XP</span>
                <span>{nextRank.required === Infinity ? '∞' : nextRank.required} XP</span>
            </div>
        </div>
    );

    const StatItem: React.FC<{ label: string, value: string | number, icon: any }> = ({ label, value, icon: Icon }) => (
        <div className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all group cursor-pointer hover:border-white/10">
            <Icon className="w-4 h-4 mb-2 text-gray-600 group-hover:text-moto-accent transition-colors" />
            <span className="text-lg font-display font-black text-white">{value}</span>
            <span className="text-[9px] text-gray-600 uppercase tracking-widest font-bold group-hover:text-gray-400 transition-colors">{label}</span>
        </div>
    );

    const GarageCard: React.FC<{ bike?: UserBike, isAdd?: boolean }> = ({ bike, isAdd }) => {
        if (isAdd) return (
            <button
                onClick={() => notify.info('Yeni araç ekleme yakında!')}
                className="aspect-[4/5] w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-4 group hover:bg-white/10 hover:border-moto-accent/40 transition-all"
            >
                <div className="w-14 h-14 rounded-full bg-black border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform text-gray-500 group-hover:text-white">
                    <Plus className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Add Bike</span>
            </button>
        );

        return (
            <div className="group relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-moto-accent/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opactiy-80" />
                <img src={bike?.image} alt={bike?.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

                <div className="absolute bottom-4 left-4 right-4 z-20">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-moto-accent text-black text-[10px] font-black uppercase rounded">{bike?.brand}</span>
                        {bike?.year && <span className="px-2 py-0.5 bg-white/20 backdrop-blur text-white text-[10px] font-bold rounded">{bike.year}</span>}
                    </div>
                    <h3 className="text-xl font-display font-black text-white leading-none uppercase italic">{bike?.model}</h3>

                    <div className="mt-3 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                        <div className="flex items-center gap-1 text-[10px] text-gray-300">
                            <Wrench className="w-3 h-3 text-moto-accent" />
                            <span>{bike?.modifications?.length || 0} Mods</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-300">
                            <Activity className="w-3 h-3 text-moto-accent" />
                            <span>{bike?.km} km</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans pb-24">
            {/* 1. Cinematic Header */}
            <div className="relative h-72 lg:h-96 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505] z-10" />
                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                    src={user.coverImage || 'https://images.unsplash.com/photo-1625055088214-5d8f6155680d?q=80&w=2069'}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />

                <div className="absolute top-6 right-6 z-20 flex gap-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="h-10 px-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="hidden md:inline">Edit Profile</span>
                    </button>
                    {user.isAdmin && (
                        <button className="h-10 w-10 flex items-center justify-center bg-moto-accent text-black rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(242,166,25,0.4)]">
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
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
                                {/* Ambient Light Effect */}
                                <div className="absolute -inset-1 bg-gradient-to-tr from-moto-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-2xl pointer-events-none" />

                                <div className="relative flex flex-col items-center text-center z-10">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-moto-accent rounded-full blur-2xl opacity-20 animate-pulse" />
                                        <UserAvatar
                                            name={user.name}
                                            size={120}
                                            className="border-[6px] border-[#0A0A0A] relative z-20 shadow-2xl"
                                        />
                                        <div className="absolute bottom-1 right-1 z-30 bg-zinc-900 border border-white/20 p-1.5 rounded-full text-moto-accent shadow-lg">
                                            {user.rank === 'Yol Kaptanı' ? <Shield className="w-4 h-4 fill-current" /> : <Award className="w-4 h-4" />}
                                        </div>
                                    </div>

                                    <h1 className="text-3xl font-display font-black uppercase text-white tracking-tight mb-1">
                                        {user.name}
                                    </h1>
                                    <p className="text-xs font-mono text-moto-accent uppercase tracking-widest mb-6 border border-moto-accent/20 px-3 py-1 rounded-full bg-moto-accent/5">
                                        {user.rank || 'Rider'}
                                    </p>

                                    {/* Rank Progress */}
                                    <RankProgressBar />

                                    <div className="w-full h-[1px] bg-white/5 my-6" />

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-3 w-full mb-6">
                                        <StatItem label="Followers" value={user.followersCount || 0} icon={UserAvatar} />
                                        <StatItem label="Reels" value={'12'} icon={Film} />
                                        <StatItem label="Garage" value={user.garage?.length || 0} icon={Bike} />
                                        <StatItem label="Rides" value={'42'} icon={MapPin} />
                                    </div>

                                    <div className="text-xs text-gray-500 font-mono text-center leading-relaxed px-2">
                                        {user.bio || "No bio yet. Just riding."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Main Content (Right) */}
                    <div className="lg:col-span-8 xl:col-span-9 pt-10 lg:pt-0">

                        {/* Tab Navigation */}
                        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-1 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'posts', label: 'Feed', icon: Grid },
                                { id: 'reels', label: 'Reels', icon: Film },
                                { id: 'garage', label: 'Garage', icon: Bike },
                                { id: 'saved', label: 'Saved', icon: Bookmark },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-1 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.id
                                        ? 'text-white'
                                        : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-moto-accent' : ''}`} />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-moto-accent shadow-[0_0_10px_#F2A619]"
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
                                            <PostCard key={post._id} post={post} currentUserId={user._id} />
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'reels' && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {MOCK_REELS.map(reel => (
                                            <div key={reel.id} className="group relative aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-moto-accent/50 transition-colors">
                                                <img src={reel.thumbnail} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                                        <Play className="w-5 h-5 fill-current ml-1" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
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
                                            className="aspect-[9/16] bg-white/5 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/10 hover:border-moto-accent/30 transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Plus className="w-6 h-6 text-gray-500 group-hover:text-white" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">New Reel</span>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'garage' && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <GarageCard isAdd />
                                        {user.garage?.map((bike) => (
                                            <GarageCard key={bike._id} bike={bike} />
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'saved' && (
                                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                                        <Bookmark className="w-10 h-10 text-gray-600 mb-4" />
                                        <h3 className="text-white font-bold mb-1">Boş Koleksiyon</h3>
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
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#0F0F0F] border border-white/10 w-full max-w-5xl h-[90vh] md:max-h-[800px] rounded-[2rem] overflow-hidden flex shadow-2xl relative"
                        >
                            <button
                                onClick={() => setIsEditing(false)}
                                className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Decorative Grid */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

                            <div className="w-full h-full flex flex-col md:flex-row relative z-10">
                                {/* Left: Visual Preview */}
                                <div className="md:w-[40%] bg-white/5 border-r border-white/10 p-10 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="relative group cursor-pointer mb-8">
                                        <div className="absolute inset-0 bg-moto-accent rounded-full opacity-0 group-hover:opacity-40 blur-3xl transition-all duration-700" />
                                        <UserAvatar name={editForm.name} size={180} className="border-4 border-white/10 relative z-10 shadow-2xl" />
                                        <div className="absolute bottom-2 right-2 z-20 bg-white text-black p-3 rounded-full hover:scale-110 cursor-pointer shadow-lg transition-transform">
                                            <Camera className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-display font-black text-white uppercase text-center">{editForm.name || 'GUEST'}</h2>
                                    <p className="text-sm font-mono text-moto-accent uppercase tracking-widest mt-2">@{editForm.username}</p>
                                </div>

                                {/* Right: Form Fields */}
                                <div className="flex-1 p-10 md:p-14 overflow-y-auto custom-scrollbar">
                                    <h2 className="text-2xl font-display font-black text-white uppercase mb-10 flex items-center gap-3">
                                        <Settings className="w-6 h-6 text-moto-accent" />
                                        System Configuration
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-focus-within:text-moto-accent transition-colors">Operator Name</label>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full bg-transparent border-b border-white/20 py-3 text-lg font-bold text-white focus:border-moto-accent outline-none transition-colors placeholder-gray-700"
                                                placeholder="Enter name"
                                            />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-focus-within:text-moto-accent transition-colors">Callsign (Username)</label>
                                            <input
                                                type="text"
                                                value={editForm.username}
                                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                                className="w-full bg-transparent border-b border-white/20 py-3 text-lg font-bold text-white focus:border-moto-accent outline-none transition-colors placeholder-gray-700"
                                                placeholder="@username"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group mb-8">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-focus-within:text-moto-accent transition-colors">Bio / Mission Statement</label>
                                        <textarea
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-moto-accent focus:bg-white/10 outline-none transition-all min-h-[120px] resize-none"
                                            placeholder="Describe your profile..."
                                        />
                                    </div>

                                    <div className="space-y-2 group mb-12">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-focus-within:text-moto-accent transition-colors">Base Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="text"
                                                value={editForm.location}
                                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                className="w-full bg-transparent border-b border-white/20 py-3 pl-8 text-lg font-bold text-white focus:border-moto-accent outline-none transition-colors placeholder-gray-700"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-4">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="px-10 py-4 bg-moto-accent text-black rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(242,166,25,0.4)] transition-all transform hover:-translate-y-1 flex items-center gap-2"
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
        </div>
    );
};
