import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Camera, Edit2, MapPin, Grid, Bookmark, Bell,
    Plus, Save, X, Trophy, Zap, Wind, Cpu, LogOut,
    LayoutDashboard, Shield, Bike, Image as ImageIcon,
    Activity, Calendar, MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar } from '../ui/UserAvatar';
import { notify } from '../../services/notificationService';
import { PostCard } from './PostCard';
import { SocialPost, UserBike } from '../../types';
import { authService } from '../../services/auth';

// --- Types & Mocks ---

// Mock Posts for the feed (In a real app, this would come from an API)
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
    const [activeTab, setActiveTab] = useState<'posts' | 'garage' | 'saved' | 'activity'>('posts');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [editForm, setEditForm] = useState({
        name: user?.name || '',
        username: user?.username || '',
        bio: user?.bio || '',
        location: user?.location || '',
        coverImage: user?.coverImage || ''
    });

    // Update local form state when user changes
    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                username: user.username || '',
                bio: user.bio || '',
                location: user.location || '',
                coverImage: user.coverImage || ''
            });
        }
    }, [user]);

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            await updateProfile(editForm);
            setIsEditing(false);
            notify.success('Profil başarıyla güncellendi.');
        } catch (error: any) {
            notify.error('Profil güncellenemedi.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    // --- Components ---

    const StatItem = ({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) => (
        <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group">
            <Icon className="w-5 h-5 mb-2 text-gray-500 group-hover:text-moto-accent transition-colors" />
            <span className="text-xl font-display font-bold text-white mb-0.5">{value}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</span>
        </div>
    );

    const GarageItem = ({ bike, isAdd }: { bike?: UserBike, isAdd?: boolean }) => {
        if (isAdd) {
            return (
                <button
                    onClick={() => notify.info('Araç ekleme özelliği yakında aktif olacak.')}
                    className="h-[200px] w-full rounded-3xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-4 group hover:bg-white/10 hover:border-moto-accent/50 transition-all"
                >
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-moto-accent group-hover:text-black transition-colors">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Araç Ekle</span>
                </button>
            );
        }

        if (!bike) return null;

        return (
            <div className="relative h-[200px] w-full rounded-3xl overflow-hidden group border border-white/5 bg-zinc-900">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                <img
                    src={bike.image || 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87'}
                    alt={bike.model}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4 right-4 z-20">
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-[10px] font-bold text-moto-accent uppercase tracking-wider">{bike.brand}</span>
                            <h3 className="text-xl font-display font-bold text-white leading-none mt-1">{bike.model}</h3>
                        </div>
                        <span className="text-xs font-mono text-gray-400 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-md">
                            {bike.year}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
            {/* 1. Professional Cover Image */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/20 to-[#050505] z-10" />
                <img
                    src={user.coverImage || 'https://images.unsplash.com/photo-1625055088214-5d8f6155680d?q=80&w=2069'}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />

                {/* Action Bar (Top Right) */}
                <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20 flex gap-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wide"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="hidden md:inline">Profili Düzenle</span>
                    </button>
                    {user.isAdmin && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-moto-accent text-black rounded-full hover:bg-white transition-colors text-xs font-bold uppercase tracking-wide shadow-lg shadow-moto-accent/20">
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="hidden md:inline">Admin</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* 2. Left Column: Sticky Profile Card */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden sticky top-24">
                            {/* Profile Info */}
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="absolute -inset-1 bg-gradient-to-br from-moto-accent to-orange-600 rounded-full opacity-70 blur-md" />
                                    <UserAvatar
                                        name={user.name}
                                        size={120}
                                        className="border-4 border-[#0A0A0A] relative z-10 w-32 h-32"
                                    />
                                    <div className="absolute bottom-0 right-0 z-20 bg-black border border-white/20 p-1.5 rounded-full text-moto-accent">
                                        <Shield className="w-4 h-4 fill-current" />
                                    </div>
                                </div>

                                <h1 className="text-2xl font-display font-black uppercase text-white mb-1">
                                    {user.name}
                                </h1>
                                <p className="text-sm text-gray-500 font-medium mb-4">@{user.username || user.name.toLowerCase().replace(/\s+/g, '')}</p>

                                <div className="flex items-center gap-2 mb-6 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <MapPin className="w-3 h-3 text-moto-accent" />
                                    {user.location || 'Konum belirtilmedi'}
                                </div>

                                <p className="text-sm text-gray-400 leading-relaxed font-light mb-8 px-2">
                                    {user.bio || "Henüz bir biyografi eklenmedi."}
                                </p>

                                {/* Stats Grid in Sidebar */}
                                <div className="grid grid-cols-2 gap-3 w-full mb-8">
                                    <StatItem label="TAKİPÇİ" value={user.followersCount || 0} icon={UserAvatar} />
                                    <StatItem label="TAKİP" value={user.followingCount || 0} icon={Activity} />
                                    <StatItem label="SÜRÜŞ" value={142} icon={Wind} />
                                    <StatItem label="GARAGE" value={user.garage?.length || 0} icon={Bike} />
                                </div>

                                <div className="w-full pt-6 border-t border-white/5">
                                    <button
                                        onClick={() => authService.logout()}
                                        className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-bold"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Çıkış Yap
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Right Column: Content Feed & Tabs */}
                    <div className="lg:col-span-8 xl:col-span-9">

                        {/* Custom Tab Navigation */}
                        <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                            {[
                                { id: 'posts', label: 'Akış', icon: Grid },
                                { id: 'garage', label: 'Garaj', icon: Bike },
                                { id: 'saved', label: 'Kaydedilenler', icon: Bookmark },
                                { id: 'activity', label: 'Aktivite', icon: Activity },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${activeTab === tab.id
                                            ? 'bg-moto-accent text-black border-moto-accent shadow-lg shadow-moto-accent/20'
                                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Transitions for Tab Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'posts' && (
                                    <div className="max-w-2xl">
                                        {/* New Post Input Placeholder */}
                                        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-4 mb-8 flex gap-4 items-center cursor-text hover:border-white/20 transition-colors">
                                            <UserAvatar name={user.name} size={40} />
                                            <p className="text-gray-500 text-sm">Bugün neler yaptın, {user.name}?</p>
                                        </div>

                                        <div className="space-y-6">
                                            {MOCK_MY_POSTS.map(post => (
                                                <PostCard key={post._id} post={post} currentUserId={user._id} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'garage' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <GarageItem isAdd />
                                        {user.garage?.map((bike) => (
                                            <GarageItem key={bike._id} bike={bike} />
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'saved' && (
                                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                            <Bookmark className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <h3 className="text-white font-bold text-lg">Henüz bir şey kaydetmedin</h3>
                                        <p className="text-gray-500 text-sm mt-1 max-w-xs">Beğendiğin ürünleri, rotaları veya gönderileri buraya kaydedebilirsin.</p>
                                    </div>
                                )}

                                {activeTab === 'activity' && (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="bg-[#0A0A0A] border border-white/10 p-4 rounded-2xl flex gap-4 items-center">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <Trophy className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white"><span className="font-bold text-white">Viraj Ustası</span> rozetini kazandın!</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">2 gün önce</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* --- Edit Profile Modal (System Config Style) --- */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#0A0A0A] border border-white/10 w-full max-w-4xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
                        >
                            {/* Modal Header for Mobile */}
                            <div className="md:hidden flex justify-between items-center p-6 border-b border-white/10">
                                <span className="text-lg font-bold font-display uppercase tracking-widest text-white">Profil Düzenle</span>
                                <button onClick={() => setIsEditing(false)} className="text-white"><X /></button>
                            </div>

                            {/* Left Side: Avatar & Quick Info */}
                            <div className="md:w-1/3 bg-white/5 border-r border-white/10 p-8 flex flex-col items-center justify-center relative">
                                <div className="relative group cursor-pointer mb-6">
                                    <div className="absolute inset-0 bg-moto-accent rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-all" />
                                    <UserAvatar name={editForm.name} size={140} className="border-4 border-[#0A0A0A] relative z-10 shadow-xl" />
                                    <div className="absolute bottom-0 right-0 z-20 bg-moto-accent text-black p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                                        <Camera className="w-5 h-5" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-display font-black text-white uppercase text-center mb-1">{editForm.name || 'İsimsiz'}</h3>
                                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-8">{user.rank}</p>

                                <div className="hidden md:block w-full">
                                    <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                                            <span>Profile Strength</span>
                                            <span className="text-moto-accent font-bold">85%</span>
                                        </div>
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-moto-accent w-[85%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Form Fields */}
                            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                                <div className="hidden md:flex justify-between items-center mb-10">
                                    <div>
                                        <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Sistem Ayarları</h2>
                                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Kişisel Bilgilerini Güncelle</p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ad Soyad</label>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-moto-accent focus:bg-white/10 outline-none transition-all"
                                                placeholder="Adınız"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kullanıcı Adı</label>
                                            <input
                                                type="text"
                                                value={editForm.username}
                                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-moto-accent focus:bg-white/10 outline-none transition-all"
                                                placeholder="@kullaniciadi"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Biyografi</label>
                                        <textarea
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-moto-accent focus:bg-white/10 outline-none transition-all min-h-[100px] resize-none"
                                            placeholder="Kendinden bahset..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Konum</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text"
                                                value={editForm.location}
                                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-moto-accent focus:bg-white/10 outline-none transition-all"
                                                placeholder="İstanbul, Türkiye"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end gap-3">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-3 rounded-xl text-gray-400 font-bold hover:text-white transition-colors"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="px-8 py-3 bg-moto-accent text-black rounded-xl font-bold uppercase tracking-wide hover:shadow-lg hover:shadow-moto-accent/20 transition-all hover:-translate-y-1 flex items-center gap-2"
                                        >
                                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                                            {!loading && <Save className="w-4 h-4" />}
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
