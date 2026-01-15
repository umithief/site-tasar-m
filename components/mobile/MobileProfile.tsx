import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Camera, Edit2, MapPin, Grid, Bookmark, Bell,
    Plus, Save, X, Trophy, Zap, Wind, Cpu, LogOut,
    LayoutDashboard, Shield, Bike, Image as ImageIcon,
    Activity, Calendar, MessageSquare, Play, Film, Share2, Heart, Award, Wrench, Gauge, ArrowUpRight, Check
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar } from '../ui/UserAvatar';
import { notify } from '../../services/notificationService';
import { PostCard } from '../social/PostCard'; // Using the unified PostCard
import { SocialPost, UserBike } from '../../types';
import { authService } from '../../services/auth';
import { gamificationService, RANKS } from '../../services/gamificationService';
import { UserListModal } from '../UserListModal';

// Mock Data
const MOCK_REELS = [
    { id: 'r1', thumbnail: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800', views: '12K', likes: '1.2K' },
    { id: 'r2', thumbnail: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800', views: '8.5K', likes: '950' },
    { id: 'r3', thumbnail: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=800', views: '22K', likes: '2.5K' },
];

export const MobileProfile: React.FC = () => {
    const { user, updateProfile, logout } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'garage' | 'saved'>('posts');
    const [isEditing, setIsEditing] = useState(false);
    const [rankProgress, setRankProgress] = useState(65); // Mock

    // User List Modal
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [userListType, setUserListType] = useState<'followers' | 'following'>('followers');

    const handleOpenUserList = (type: 'followers' | 'following') => {
        setUserListType(type);
        setIsUserListOpen(true);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* 1. Header & Cover - Clean & Light */}
            <div className="relative">
                <div className="h-48 w-full overflow-hidden">
                    <img
                        src={user.coverImage || 'https://images.unsplash.com/photo-1625055088214-5d8f6155680d?q=80&w=2069'}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90" />
                </div>

                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-700 shadow-sm border border-gray-200"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    <button
                        onClick={logout}
                        className="p-2 bg-red-50 backdrop-blur-md rounded-full text-red-600 shadow-sm border border-red-100"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* 2. Identity Section - Card Style */}
            <div className="px-4 -mt-16 relative z-10">
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 text-center">
                    <div className="relative inline-block mb-3">
                        <UserAvatar name={user.name} size={100} className="border-4 border-white shadow-lg" />
                        <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1.5 border-4 border-white">
                            {user.rank === 'Yol Kaptanı' ? <Shield className="w-3 h-3 text-white fill-current" /> : <Award className="w-3 h-3 text-white" />}
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-gray-900 mb-1">{user.name}</h1>
                    <p className="text-xs font-medium text-gray-500 mb-4 bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-100">
                        @{user.username || 'rider'}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 mb-4">
                        <div onClick={() => handleOpenUserList('followers')} className="active:scale-95 transition-transform">
                            <div className="text-lg font-black text-gray-900">{Array.isArray(user.followers) ? user.followers.length : (user.followersCount || 0)}</div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Followers</div>
                        </div>
                        <div onClick={() => handleOpenUserList('following')} className="active:scale-95 transition-transform">
                            <div className="text-lg font-black text-gray-900">{Array.isArray(user.following) ? user.following.length : (user.followingCount || 0)}</div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Following</div>
                        </div>
                        <div>
                            <div className="text-lg font-black text-gray-900">{user.garage?.length || 0}</div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Garage</div>
                        </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {user.bio || "Just riding along..."}
                    </p>
                </div>
            </div>

            {/* 3. Navigation Tabs - Sticky */}
            <div className="sticky top-16 z-30 bg-gray-50 pt-2 pb-2 mt-4 px-4 overflow-x-auto no-scrollbar">
                <div className="flex gap-3 justify-center">
                    {[
                        { id: 'posts', label: 'Feed', icon: Grid },
                        { id: 'reels', label: 'Reels', icon: Film },
                        { id: 'garage', label: 'Garage', icon: Bike },
                        { id: 'saved', label: 'Saved', icon: Bookmark },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex flex-col items-center gap-1 min-w-[70px] py-2 rounded-xl transition-all ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-md transform scale-105 border border-gray-100'
                                : 'text-gray-400 hover:bg-white hover:text-gray-600'
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'fill-current' : ''}`} strokeWidth={2} />
                            <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. Content Area */}
            <div className="px-2 mt-2 min-h-[300px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'posts' && (
                            <div className="space-y-4 pb-4">
                                {/* PostCard handles its own rendering. Just need to ensure they look good on mobile background. */}
                                {/* Example placeholder logic (we don't fetch posts here yet in this snippet) */}
                                <div className="text-center py-10 text-gray-400">
                                    <Grid className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                    <p className="text-xs font-bold">No posts yet</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reels' && (
                            <div className="grid grid-cols-2 gap-2">
                                {MOCK_REELS.map(reel => (
                                    <div key={reel.id} className="relative aspect-[9/16] bg-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <img src={reel.thumbnail} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-white font-bold drop-shadow-md">
                                            <Play className="w-3 h-3 fill-current" /> {reel.views}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'garage' && (
                            <div className="space-y-4">
                                {user.garage?.map(bike => (
                                    <div key={bike._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                            <img src={bike.image} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900">{bike.model}</h3>
                                            <p className="text-xs text-gray-500 font-bold uppercase">{bike.brand}</p>
                                            <div className="flex gap-2 mt-2">
                                                <span className="px-2 py-1 bg-gray-50 rounded-md text-[10px] font-mono text-gray-600 border border-gray-100">{bike.km} KM</span>
                                                <span className="px-2 py-1 bg-gray-50 rounded-md text-[10px] font-mono text-gray-600 border border-gray-100">{bike.year}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!user.garage || user.garage.length === 0) && (
                                    <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                                        <Bike className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                        <p className="text-gray-400 text-xs font-bold">Garage is empty</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'saved' && (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                                <Bookmark className="w-12 h-12 mb-3 text-gray-200" />
                                <p className="text-sm font-medium text-gray-500">Henüz kaydedilen yok</p>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>

            <UserListModal
                isOpen={isUserListOpen}
                onClose={() => setIsUserListOpen(false)}
                title={userListType === 'followers' ? 'Takipçiler' : 'Takip Edilenler'}
                users={userListType === 'followers' ? (user.followers || []) : (user.following || [])}
            />

            {/* Mobile Edit Profile Modal - Placeholder for full implementation */}
            {isEditing && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h2 className="text-lg font-black text-gray-900">Profili Düzenle</h2>
                        <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-50 rounded-full">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="flex-1 p-8 flex items-center justify-center text-gray-400">
                        <p>Edit Form Component Here</p>
                    </div>
                </div>
            )}
        </div>
    );
};
