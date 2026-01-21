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
        <div className="min-h-screen bg-gray-50 pb-24 transition-colors duration-300">
            {/* 1. Header & Cover - Clean & Light */}
            <div className="relative">
                <div className="h-64 w-full overflow-hidden bg-gray-100 relative">
                    {user.coverImage ? (
                        <motion.img
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1 }}
                            src={user.coverImage}
                            alt="Kapak Fotoğrafı"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-gray-100`}>
                            <div className="flex flex-col items-center opacity-20">
                                <div className="w-16 h-16 text-gray-400 mb-2">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-black/20 pointer-events-none" />
                </div>

                <div className="absolute top-4 w-full px-4 z-10 flex justify-between">
                    {/* Left: Back Button (only if onBack provided) */}
                    <div>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-700 shadow-sm border border-gray-200"
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
                    )}
                </div>
            </div>

            {/* 2. Identity Section - Card Style */}
            <div className="px-4 -mt-20 relative z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl shadow-gray-200/50 border border-white/50 text-center transition-all">
                    <div className="relative inline-block mb-4">
                        <div className="p-1.5 bg-white rounded-full shadow-sm">
                            <UserAvatar name={user.name} src={user.avatar || user.profileImage} size={110} className="border-4 border-gray-50 shadow-inner" />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-moto-accent text-black p-1.5 rounded-full border-4 border-white shadow-md">
                            <Shield className="w-3.5 h-3.5 fill-current" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-display font-black text-gray-900 mb-1 tracking-tighter uppercase italic">{user.name}</h1>
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200/50">
                            @{user.username || 'rider'}
                        </span>
                        {user.rank && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-1 rounded-md">
                                {user.rank}
                            </span>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-6 mb-6">
                        <div onClick={() => handleOpenUserList('followers')} className="group active:scale-95 transition-transform cursor-pointer">
                            <div className="text-xl font-black text-gray-900 group-hover:text-moto-accent transition-colors">
                                {Array.isArray(user.followers) ? user.followers.length : (user.followersCount || 0)}
                            </div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600">Takipçi</div>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-100 absolute left-1/3 top-auto translate-y-2 opacity-50" />
                        <div onClick={() => handleOpenUserList('following')} className="group active:scale-95 transition-transform cursor-pointer">
                            <div className="text-xl font-black text-gray-900 group-hover:text-moto-accent transition-colors">
                                {Array.isArray(user.following) ? user.following.length : (user.followingCount || 0)}
                            </div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600">Takip</div>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-100 absolute right-1/3 top-auto translate-y-2 opacity-50" />
                        <div className="group">
                            <div className="text-xl font-black text-gray-900 group-hover:text-moto-accent transition-colors">{user.garage?.length || 0}</div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600">Garaj</div>
                        </div>
                    </div>

                    {/* Bio */}
                    {user.bio ? (
                        <p className="text-sm text-gray-600 leading-relaxed font-medium px-4 py-3 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                            "{user.bio}"
                        </p>
                    ) : (
                        <p className="text-xs text-gray-400 italic">Henüz bir biyografi eklenmemiş.</p>
                    )}
                </div>
            </div>

            {/* 3. Navigation Tabs - Sticky */}
            <div className="sticky top-0 z-30 pt-4 pb-2 mt-4 px-4 bg-gray-50/95 backdrop-blur-md">
                <div className="flex gap-1 justify-between bg-white/80 p-1.5 rounded-[1.5rem] border border-gray-200/50 shadow-sm relative isolate">
                    {[
                        { id: 'posts', label: 'Gönderiler', icon: Grid },
                        { id: 'reels', label: 'Reels', icon: Film },
                        { id: 'garage', label: 'Garaj', icon: Bike },
                        { id: 'saved', label: 'Kaydedilen', icon: Bookmark },
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`relative flex flex-1 items-center justify-center gap-2 py-3 px-3 rounded-2xl transition-all duration-300 ${isActive ? 'text-white shadow-lg shadow-black/10' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabBg"
                                        className="absolute inset-0 bg-gray-900 rounded-2xl z-[-1]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <tab.icon className={`w-4 h-4 z-10 ${isActive ? 'fill-moto-accent text-moto-accent' : 'text-current'}`} strokeWidth={isActive ? 2 : 2.5} />
                                <span className={`hidden sm:inline text-xs font-bold tracking-wide z-10 ${isActive ? 'text-white' : ''}`}>{tab.label}</span>
                            </button>
                        );
                    })}
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
                                <div className="text-center py-16 text-gray-400">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                        <Grid className="w-8 h-8 opacity-50" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">Henüz gönderi yok</h3>
                                    <p className="text-xs">Paylaşımlarınız burada görünecek.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reels' && (
                            <div className="grid grid-cols-3 gap-1 px-1">
                                {MOCK_REELS.map(reel => (
                                    <div key={reel.id} className="relative aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden border border-white/10 group cursor-pointer">
                                        <img src={reel.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] text-white font-bold drop-shadow-md z-1">
                                            <Play className="w-3 h-3 fill-white text-white" /> {reel.views}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'garage' && (
                            <div className="space-y-4 px-2">
                                {user.garage?.map(bike => (
                                    <div key={bike._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
                                        <div className="w-24 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                                            <img src={bike.image} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                        </div>
                                        <div className="flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="font-display font-black text-gray-900 text-lg leading-tight uppercase italic">{bike.brand}</h3>
                                                <p className="text-sm font-bold text-gray-400">{bike.model}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="px-2 py-0.5 bg-gray-50 rounded text-[9px] font-black text-gray-500 uppercase border border-gray-200">{bike.km} KM</span>
                                                <span className="px-2 py-0.5 bg-gray-50 rounded text-[9px] font-black text-gray-500 uppercase border border-gray-200">{bike.year}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!user.garage || user.garage.length === 0) && (
                                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm mx-2">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Bike className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-900 text-sm font-bold">Garajınız boş</p>
                                        <p className="text-gray-400 text-xs mt-1">İlk motosikletinizi ekleyin.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'saved' && (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                                <Bookmark className="w-12 h-12 mb-4 opacity-50" />
                                <h3 className="text-sm font-bold text-gray-900 mb-1">Henüz kaydedilen yok</h3>
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
