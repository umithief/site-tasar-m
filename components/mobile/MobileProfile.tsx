import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Grid, Bookmark, LogOut,
    Shield, Bike, Play, Film, Award, MapPin, ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { SocialPost, User, ViewState } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { UserListModal } from '../UserListModal';
import { MobileEditProfile } from './MobileEditProfile';
import { PostCard } from '../social/PostCard'; // Ensure this handles mobile view via internal logic or unified props

// Mock Data
const MOCK_REELS = [
    { id: 'r1', thumbnail: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800', views: '12K', likes: '1.2K' },
    { id: 'r2', thumbnail: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800', views: '8.5K', likes: '950' },
    { id: 'r3', thumbnail: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=800', views: '22K', likes: '2.5K' },
];

interface MobileProfileProps {
    user?: User;
    userId?: string;
    onNavigate?: (view: ViewState, data?: any) => void;
    onBack?: () => void;
}

export const MobileProfile: React.FC<MobileProfileProps> = ({ user: propUser, userId, onNavigate, onBack }) => {
    const { user: authUser, logout } = useAuthStore();

    const [posts, setPosts] = useState<SocialPost[]>([]);
    // Determine which user to show
    const user = propUser || authUser;

    // Check if it's the own profile
    const isOwnProfile = authUser && user && authUser._id === user._id;
    const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'garage' | 'saved'>('posts');
    const [isEditing, setIsEditing] = useState(false);

    // User List Modal
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [userListType, setUserListType] = useState<'followers' | 'following'>('followers');

    const handleOpenUserList = (type: 'followers' | 'following') => {
        setUserListType(type);
        setIsUserListOpen(true);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-24 transition-colors duration-300">
            {/* 1. Header & Cover - Clean & Light */}
            <div className="relative">
                <div className="h-48 w-full overflow-hidden bg-gray-200 dark:bg-[#111] relative">
                    {user.coverImage ? (
                        <img
                            src={user.coverImage}
                            alt="Kapak Fotoğrafı"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black`}>
                            {/* Large Logo for Cover Placeholder */}
                            <div className="flex flex-col items-center opacity-30">
                                <div className="w-16 h-16 text-white mb-2">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-moto-accent fill-current"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/90 dark:to-black/90 pointer-events-none" />
                </div>

                <div className="absolute top-4 w-full px-4 z-10 flex justify-between">
                    {/* Left: Back Button (only if onBack provided) */}
                    <div>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full text-gray-700 dark:text-white shadow-sm border border-gray-200 dark:border-white/10"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Right: Actions (only if own profile) */}
                    {isOwnProfile && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full text-gray-700 dark:text-white shadow-sm border border-gray-200 dark:border-white/10"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                            <button
                                onClick={logout}
                                className="p-2 bg-red-50 dark:bg-red-500/10 backdrop-blur-md rounded-full text-red-600 shadow-sm border border-red-100 dark:border-transparent"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Identity Section - Card Style */}
            <div className="px-4 -mt-16 relative z-10">
                <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 text-center transition-colors">
                    <div className="relative inline-block mb-3">
                        <UserAvatar name={user.name} src={user.avatar || user.profileImage} size={100} className="border-4 border-white dark:border-[#111] shadow-lg" />
                        <div className="absolute bottom-0 right-0 bg-moto-accent rounded-full p-1.5 border-4 border-white dark:border-[#111]">
                            <Shield className="w-3 h-3 text-black fill-current" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">{user.name}</h1>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-white/5 inline-block px-3 py-1 rounded-full border border-gray-100 dark:border-white/5">
                        @{user.username || 'rider'}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 border-t border-gray-100 dark:border-white/5 pt-4 mb-4">
                        <div onClick={() => handleOpenUserList('followers')} className="active:scale-95 transition-transform cursor-pointer">
                            <div className="text-lg font-black text-gray-900 dark:text-white">
                                {Array.isArray(user.followers) ? user.followers.length : (user.followersCount || 0)}
                            </div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Takipçi</div>
                        </div>
                        <div onClick={() => handleOpenUserList('following')} className="active:scale-95 transition-transform cursor-pointer">
                            <div className="text-lg font-black text-gray-900 dark:text-white">
                                {Array.isArray(user.following) ? user.following.length : (user.followingCount || 0)}
                            </div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Takip</div>
                        </div>
                        <div>
                            <div className="text-lg font-black text-gray-900 dark:text-white">{user.garage?.length || 0}</div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Garaj</div>
                        </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium px-2">
                        {user.bio || "Henüz bir biyografi eklenmemiş."}
                    </p>
                </div>
            </div>

            {/* 3. Navigation Tabs - Sticky */}
            <div className="sticky top-0 z-30 bg-gray-50 dark:bg-black pt-4 pb-2 mt-2 px-4 overflow-x-auto no-scrollbar backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90">
                <div className="flex gap-2 justify-center bg-white dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                    {[
                        { id: 'posts', label: 'Gönderiler', icon: Grid },
                        { id: 'reels', label: 'Reels', icon: Film },
                        { id: 'garage', label: 'Garaj', icon: Bike },
                        { id: 'saved', label: 'Kaydedilenler', icon: Bookmark },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex flex-1 items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-all ${activeTab === tab.id
                                ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                                : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'fill-current' : ''}`} strokeWidth={2.5} />
                            <span className="hidden sm:inline text-xs font-bold tracking-wide">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. Content Area */}
            <div className="px-2 mt-4 min-h-[300px]">
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
                                {posts.map((post) => (
                                    <PostCard key={post._id} post={post} />
                                ))}
                                <div className="text-center py-16 text-gray-400 dark:text-gray-600">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                                        <Grid className="w-8 h-8 opacity-50" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Henüz gönderi yok</h3>
                                    <p className="text-xs">Paylaşımlarınız burada görünecek.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reels' && (
                            <div className="grid grid-cols-3 gap-1">
                                {MOCK_REELS.map(reel => (
                                    <div key={reel.id} className="relative aspect-[9/16] bg-gray-200 dark:bg-zinc-900 overflow-hidden">
                                        <img src={reel.thumbnail} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/10" />
                                        <div className="absolute bottom-1 left-1 flex items-center gap-1 text-[9px] text-white font-bold drop-shadow-md">
                                            <div className="w-0 h-0 border-l-[3px] border-l-white border-y-[2px] border-y-transparent" /> {reel.views}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'garage' && (
                            <div className="space-y-4 px-2">
                                {user.garage?.map(bike => (
                                    <div key={bike._id} className="bg-white dark:bg-[#111] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex gap-4">
                                        <div className="w-24 h-20 bg-gray-100 dark:bg-black rounded-xl overflow-hidden shrink-0">
                                            <img src={bike.image} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 dark:text-white text-lg leading-tight">{bike.brand}</h3>
                                            <p className="text-sm text-gray-500 mb-2">{bike.model}</p>
                                            <div className="flex gap-2">
                                                <span className="px-2 py-1 bg-gray-50 dark:bg-white/5 rounded-md text-[10px] font-bold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-white/5">{bike.km} KM</span>
                                                <span className="px-2 py-1 bg-gray-50 dark:bg-white/5 rounded-md text-[10px] font-bold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-white/5">{bike.year}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!user.garage || user.garage.length === 0) && (
                                    <div className="text-center py-10 bg-white dark:bg-[#111] rounded-2xl border-2 border-dashed border-gray-100 dark:border-white/10">
                                        <Bike className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                                        <p className="text-gray-400 text-xs font-bold">Garajınız boş</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'saved' && (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 dark:text-gray-600">
                                <Bookmark className="w-12 h-12 mb-4 opacity-50" />
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Henüz kaydedilen yok</h3>
                                <p className="text-xs">Beğendiğiniz gönderileri daha sonra görmek için kaydedin.</p>
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

            <AnimatePresence>
                {isEditing && (
                    <MobileEditProfile
                        onClose={() => setIsEditing(false)}
                        onSuccess={() => setIsEditing(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
