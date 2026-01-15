

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
import { User, SocialPost, ViewState } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { ProfileEditModal } from './ProfileEditModal';
import { UserListModal } from '../UserListModal';

// --- Types & Interfaces ---
interface ProfilePageProps {
    userId: string;
    onNavigate: (view: ViewState, data?: any) => void;
    onBack?: () => void;
}

// Stats Component for reuse
const StatItem = ({ label, value, onClick }: { label: string; value: number; onClick?: () => void }) => (
    <div onClick={onClick} className={`flex flex-col items-center group ${onClick ? 'cursor-pointer' : ''}`}>
        <span className="text-2xl md:text-3xl font-display font-black text-gray-900 group-hover:text-blue-600 transition-colors">
            {value}
        </span>
        <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest font-bold font-mono group-hover:text-gray-900 transition-colors">
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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // User List Modal State
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [userListType, setUserListType] = useState<'followers' | 'following'>('followers');

    const handleOpenUserList = (type: 'followers' | 'following') => {
        setUserListType(type);
        setIsUserListOpen(true);
    };

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
            onNavigate('social-hub' as ViewState, { openChat: userId });
        }
    };

    // --- Loading & Error States ---
    if (isProfileLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-100 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (profileError || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center p-8">
                <Trophy className="w-24 h-24 text-gray-200 mb-6" />
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Sürücü Bulunamadı</h2>
                <p className="text-gray-500 mb-8 max-w-md">Aradığınız profil mevcut değil veya garajına çekilmiş.</p>
                <button
                    onClick={onBack}
                    className="px-8 py-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-900 rounded-xl font-bold transition-all"
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
        <div className="min-h-screen bg-white text-gray-900 font-sans pb-20 selection:bg-blue-100 selection:text-blue-900">

            {/* 1. Cinematic Hero Header */}
            <div className="relative h-[45vh] lg:h-[400px] w-full overflow-hidden group">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="w-full h-full"
                >
                    <img
                        src={coverImage}
                        alt="Garage Cover"
                        className="w-full h-full object-cover opacity-90"
                    />
                    {/* Light Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                </motion.div>

                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="absolute top-safe-top left-6 z-50 p-3 bg-white/80 backdrop-blur-xl border border-white/50 rounded-full text-gray-900 hover:bg-black hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>
                </button>
            </div>

            {/* 2. Identity & Stats Core */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 z-20">
                <div className="flex flex-col lg:flex-row items-end gap-8 mb-12">

                    {/* Floating Avatar */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative mx-auto lg:mx-0"
                    >
                        <div className="relative rounded-full p-1.5 bg-white ring-1 ring-gray-100 shadow-2xl">
                            <UserAvatar
                                name={safeName}
                                variant="beam"
                                size={140}
                                className="shadow-none border-4 border-white"
                            />

                            {/* Online Status Pinger */}
                            {isOnline && (
                                <div className="absolute bottom-4 right-4 w-5 h-5 bg-green-500 border-[3px] border-white rounded-full animate-pulse shadow-sm" />
                            )}

                            {/* Verified Badge */}
                            {profile.rank === 'Yol Kaptanı' && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1 border-2 border-white">
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
                            <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 leading-none tracking-tight mb-2">
                                {safeName}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm font-mono text-gray-500 mb-6">
                                <span className="text-blue-600 font-bold">@{safeUsername}</span>
                                <span className="hidden sm:inline text-gray-300">|</span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {profile.location || 'Unknown Location'}
                                </span>
                                <span className="hidden sm:inline text-gray-300">|</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Since {new Date(profile.joinDate).getFullYear()}
                                </span>
                            </div>

                            {/* Bio Snippet */}
                            <p className="text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-6 font-medium border-l-2 border-blue-500 pl-4">
                                {profile.bio || "Rider bio not initialized."}
                            </p>
                        </motion.div>
                    </div>

                    {/* Dashboard Stats Box */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-6 flex items-center gap-8 md:gap-12 shadow-xl shadow-gray-200/50 mx-auto lg:mx-0 w-full lg:w-auto justify-center"
                    >
                        <StatItem label="Followers" value={followerCount} onClick={() => handleOpenUserList('followers')} />
                        <div className="w-px h-10 bg-gray-200"></div>
                        <StatItem label="Following" value={followingCount} onClick={() => handleOpenUserList('following')} />
                        <div className="w-px h-10 bg-gray-200"></div>
                        <StatItem label="Ride Outs" value={postCount} />
                    </motion.div>
                </div>

                {/* 3. Command Center (Actions) */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 border-t border-gray-100 pt-8">
                    {isOwnProfile ? (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 text-white hover:bg-black font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-xl"
                        >
                            <Settings className="w-4 h-4" />
                            Ayarları Düzenle
                        </button>
                    ) : (
                        <>
                            <div className="w-full sm:w-auto">
                                <FollowButton
                                    targetUserId={userId}
                                    isFollowing={profile.isFollowing}
                                    className="!w-full !px-8 !py-3.5 !text-base !font-bold !uppercase !tracking-wider !rounded-xl"
                                />
                            </div>
                            <button
                                onClick={handleMessage}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm group"
                            >
                                <MessageCircle className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                Mesaj Gönder
                            </button>
                        </>
                    )}

                    <button className="p-3.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-colors ml-auto hidden sm:block">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* 4. Content Content Vault (Tabs) */}
                <div className="mb-20">
                    <div className="flex items-center gap-8 border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'posts', label: 'Ride Log', icon: GridIcon },
                            { id: 'media', label: 'Garage & Media', icon: ImageIcon },
                            { id: 'specs', label: 'Rider Specs', icon: Info },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`relative pb-4 flex items-center gap-3 font-bold text-sm tracking-wide uppercase transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : ''}`} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="active-tab-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 shadow-sm"
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
                                        [1, 2, 3].map(i => <div key={i} className="aspect-square bg-gray-50 rounded-2xl animate-pulse" />)
                                    ) : posts && posts.length > 0 ? (
                                        posts.map((post: SocialPost) => (
                                            <div key={post._id} className="group relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-lg transition-all">
                                                {/* Image or Text Placeholder */}
                                                {post.images && post.images.length > 0 ? (
                                                    <img src={post.images[0]} alt="Post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center p-6 text-center text-gray-500 bg-gray-50">
                                                        <p className="line-clamp-4 text-sm font-medium">{post.content}</p>
                                                    </div>
                                                )}

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                                                    <div className="flex items-center gap-6 font-bold text-white">
                                                        <span className="flex items-center gap-2"><Heart className="w-5 h-5 fill-white" /> {post.likes || 0}</span>
                                                        <span className="flex items-center gap-2"><MessageSquare className="w-5 h-5 fill-white" /> {post.comments || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 text-center border border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                                            <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-400 font-medium">No signals detected in the log.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* GARAGE TAB */}
                            {activeTab === 'media' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {profile.garage && profile.garage.length > 0 ? (
                                        profile.garage.map((bike: any) => (
                                            <div key={bike._id} className="group relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                                <img
                                                    src={bike.image}
                                                    alt={`${bike.brand} ${bike.model}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                                    <h3 className="text-xl font-display font-bold text-white uppercase italic">{bike.brand} <span className="text-blue-400">{bike.model}</span></h3>
                                                    <p className="text-gray-300 text-xs font-mono mt-1 flex items-center gap-4">
                                                        <span>{bike.year}</span>
                                                        <span>|</span>
                                                        <span>{bike.km.toLocaleString()} KM</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                                            <p className="text-gray-400 font-medium">Garage is empty.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SPECS TAB */}
                            {activeTab === 'specs' && (
                                <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-2xl shadow-sm">
                                    <h3 className="font-mono text-xs text-blue-600 uppercase tracking-widest mb-6">./RIDER_MANIFESTO.log</h3>
                                    <p className="text-gray-600 leading-relaxed font-medium mb-8">
                                        {profile.bio || "No bio data available."}
                                    </p>

                                    {profile.equipment && (
                                        <div>
                                            <h4 className="font-mono text-xs text-gray-400 uppercase tracking-widest mb-4">./EQUIPMENT_LOADOUT</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.equipment.map((gear: string, idx: number) => (
                                                    <span key={idx} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-mono text-gray-600 font-bold">
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

            <UserListModal
                isOpen={isUserListOpen}
                onClose={() => setIsUserListOpen(false)}
                title={userListType === 'followers' ? 'Takipçiler' : 'Takip Edilenler'}
                users={userListType === 'followers' ? (profile?.followers || []) : (profile?.following || [])}
                onNavigate={onNavigate}
            />

            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        </div>
    );
};
