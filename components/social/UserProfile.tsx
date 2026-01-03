import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Grid, Bike, FolderHeart, Settings, MapPin, Gauge, Trophy, Package, LogOut, Edit3, X, Image as ImageIcon, LayoutDashboard, Shield, Plus } from 'lucide-react';
import { SocialPost, SocialProfile, User as UserType, Order, ViewState, UserBike } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { Button } from '../ui/Button';
import { orderService } from '../../services/orderService';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { storageService } from '../../services/storageService';
import { notify } from '../../services/notificationService';
import { useLanguage } from '../../contexts/LanguageProvider';
import { BikeDetailModal } from '../BikeDetailModal';
import { ZenGarage } from '../ZenGarage';
import { FollowButton } from './FollowButton';
import { UserListModal } from '../UserListModal';

// Extend SocialProfile or use UserType, we need a unified approach.
// The main App passes `user` which is `UserType`. We can cast or map it.
interface UserProfileProps {
    user: UserType; // Current Logged in User
    onLogout?: () => void;
    onUpdateUser?: (user: UserType) => void;
    onNavigate: (view: ViewState) => void;
    profile?: SocialProfile; // Target Profile to view
}

const MOCK_USER_POSTS: SocialPost[] = [
    {
        _id: 'p1',
        userId: 'current',
        userName: 'Ben',
        userAvatar: '',
        content: 'Bugün hava harikaydı, Riva virajlarında lastik ısıttık! 🏍️💨',
        images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop'],
        likes: 24,
        comments: 5,
        shares: 2,
        timestamp: '2 saat önce',
        isLiked: false
    },
    {
        _id: 'p2',
        userId: 'current',
        userName: 'Ben',
        userAvatar: '',
        content: 'Garaja yeni bir canavar eklendi. Bakımları yapıldı, sezona hazırız.',
        images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop'],
        likes: 56,
        comments: 12,
        shares: 5,
        timestamp: '3 gün önce',
        isLiked: true
    }
];

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onUpdateUser, onNavigate, profile: propProfile }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'tagged' | 'orders'>('posts');
    const [orders, setOrders] = useState<Order[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [myBikes, setMyBikes] = useState<UserBike[]>(user.garage || []);
    const [selectedBike, setSelectedBike] = useState<UserBike | null>(null);
    const [isAddBikeModalOpen, setIsAddBikeModalOpen] = useState(false); // We might need to expose this or use BikeDetailModal in 'new' mode

    const [editForm, setEditForm] = useState({
        name: user.name,
        bio: user.bio || '',
        location: user.address || '',
        phone: user.phone || ''
    });

    // User List Modal State
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [userListType, setUserListType] = useState<'followers' | 'following'>('followers');
    const [modalUsers, setModalUsers] = useState<any[]>([]);

    const handleOpenUserList = async (type: 'followers' | 'following') => {
        const list = type === 'followers' ? displayProfile.followers : displayProfile.following;

        // If list is empty or undefined, nothing to show (or show empty modal)
        if (!list || list.length === 0) {
            setModalUsers([]);
            setUserListType(type);
            setIsUserListOpen(true);
            return;
        }

        // If list items are objects with names, use them
        // Verify ALL items are objects (to handle mixed state from optimistic updates)
        const allObjects = list.every((item: any) => typeof item === 'object' && item !== null && (item._id || item.id || item.name));

        if (allObjects) {
            setModalUsers(list);
            setUserListType(type);
            setIsUserListOpen(true);
            return;
        }

        // Needs fetching (IDs only)
        try {
            // Using socialService to get full profile which populates these fields
            const targetId = displayProfile._id || displayProfile.id || user._id;
            const fullProfile = await import('../../services/socialService').then(m => m.socialService.getUserProfile(targetId));
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

    const isOwnProfile = !propProfile || propProfile._id === user._id;

    // Determine profile data (User or Prop)
    const displayProfile: any = propProfile || {
        ...user,
        coverImage: 'https://images.unsplash.com/photo-1625043484555-47841a752840?q=80&w=2000', // Default cover
        followersCount: user.followersCount || (Array.isArray(user.followers) ? user.followers.length : 0),
        followingCount: user.followingCount || (Array.isArray(user.following) ? user.following.length : 0),
        totalRides: 0, // Mock for now
        garage: user.garage || []
    };

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

    useEffect(() => {
        setEditForm({
            name: user.name,
            bio: user.bio || '',
            location: user.address || '',
            phone: user.phone || ''
        });
        if (user.garage) setMyBikes(user.garage);
    }, [user]);

    const fetchOrders = async () => {
        try {
            const userOrders = await orderService.getUserOrders(user._id);
            setOrders(userOrders);
        } catch (error) {
            console.error("Siparişler alınamadı", error);
        }
    };

    const handleSaveProfile = async () => {
        if (!onUpdateUser) return;
        try {
            const updatedUser = await authService.updateProfile({
                name: editForm.name,
                bio: editForm.bio,
                address: editForm.location,
                phone: editForm.phone
            });
            onUpdateUser(updatedUser);

            // Sync with global store
            useAuthStore.getState().updateProfile(updatedUser);

            setIsEditModalOpen(false);
            notify.success('Profil güncellendi!');
        } catch (error) {
            notify.error('Güncelleme başarısız.');
        }
    };

    const handleUpdateGarage = async (newGarage: UserBike[]) => {
        setMyBikes(newGarage);
        if (isOwnProfile && onUpdateUser) {
            await authService.updateProfile({ garage: newGarage });
            const updatedUser = await authService.getCurrentUser();
            if (updatedUser) {
                onUpdateUser(updatedUser);
                useAuthStore.getState().updateProfile(updatedUser);
            }
        }
    };

    return (
        <div className="bg-[#050505] min-h-screen text-white pt-24 pb-12">

            {/* Cover Section */}
            <div className="relative h-64 md:h-80 w-full mb-24 md:mb-16">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505] z-10" />
                <img
                    src={displayProfile.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover opacity-80"
                />

                {/* Header Actions */}
                <div className="absolute top-4 right-4 z-30 flex gap-2">
                    {!isOwnProfile && displayProfile._id && (
                        <FollowButton targetUserId={displayProfile._id} />
                    )}

                    {isOwnProfile && (
                        <>
                            {user.isAdmin && onNavigate && (
                                <button
                                    onClick={() => onNavigate('admin')}
                                    className="p-2 bg-blue-600/80 backdrop-blur text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                </button>
                            )}
                            {onUpdateUser && (
                                <button onClick={() => setIsEditModalOpen(true)} className="p-2 bg-white/10 backdrop-blur text-white rounded-full hover:bg-white/20 transition-colors">
                                    <Settings className="w-5 h-5" />
                                </button>
                            )}
                            {onLogout && (
                                <button onClick={onLogout} className="p-2 bg-red-500/80 backdrop-blur text-white rounded-full hover:bg-red-600 transition-colors">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Profile Stats Card - Floating */}
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 z-20 w-[95%] md:w-[600px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex items-center justify-between">
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-xl md:text-2xl font-display font-black text-white">{displayProfile.points}</span>
                        <span className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest font-bold">XP Points</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div
                        className="flex flex-col items-center flex-1 cursor-pointer group"
                        onClick={() => handleOpenUserList('followers')}
                    >
                        <span className="text-xl md:text-2xl font-display font-black text-white group-hover:text-moto-accent transition-colors">
                            {Array.isArray(displayProfile.followers) ? displayProfile.followers.length : (displayProfile.followersCount || 0)}
                        </span>
                        <span className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest font-bold group-hover:text-white transition-colors">Followers</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div
                        className="flex flex-col items-center flex-1 cursor-pointer group"
                        onClick={() => handleOpenUserList('following')}
                    >
                        <span className="text-xl md:text-2xl font-display font-black text-white group-hover:text-moto-accent transition-colors">
                            {Array.isArray(displayProfile.following) ? displayProfile.following.length : (displayProfile.followingCount || 0)}
                        </span>
                        <span className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest font-bold group-hover:text-white transition-colors">Following</span>
                    </div>

                    {/* Floating Avatar */}
                    <div className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 p-2 bg-[#050505] rounded-full">
                        <UserAvatar name={displayProfile.name} size={96} className="border-4 border-moto-accent w-20 h-20 md:w-24 md:h-24" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 mb-12 flex flex-col items-center text-center">
                <h1 className="text-3xl font-display font-black uppercase flex items-center gap-3">
                    {displayProfile.name}
                    {displayProfile.rank && <span className="bg-moto-accent text-black text-xs px-2 py-1 rounded font-bold">{displayProfile.rank}</span>}
                </h1>
                <p className="text-gray-400 max-w-lg mt-2 font-mono text-sm">{displayProfile.bio || "Rider. Explorer. Adrenaline Junkie."}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" /> {displayProfile.address || 'Unknown Location'}
                </div>
            </div>

            {/* The Garage (Zen Design) */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 mb-24">
                <ZenGarage
                    bikes={myBikes}
                    isEditable={isOwnProfile && !!onUpdateUser}
                    onAdd={() => setSelectedBike({ _id: '', brand: '', model: '', year: '', km: '', color: '', image: '', maintenance: [], modifications: [], isPublic: true } as UserBike)}
                    onBikeClick={setSelectedBike}
                />
            </div>

            {/* Content Feed */}
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex overflow-x-auto no-scrollbar justify-start md:justify-center mb-8 bg-white/5 p-1 rounded-full w-full md:w-fit mx-auto border border-white/10">
                    {[
                        { id: 'posts', icon: Grid, label: 'POSTS' },
                        { id: 'media', icon: FolderHeart, label: 'MEDIA' },
                        { id: 'orders', icon: Package, label: 'ORDERS' },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${isActive ? 'bg-moto-accent text-black shadow-lg shadow-moto-accent/20' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Icon className="w-3 h-3" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {activeTab === 'posts' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {MOCK_USER_POSTS.map(post => (
                            <div key={post._id} className="aspect-square bg-gray-800 rounded-2xl overflow-hidden relative group cursor-pointer border border-white/5">
                                <img src={post.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                                    <span className="flex items-center gap-1.5 font-bold"><Trophy className="w-4 h-4 text-moto-accent" /> {post.likes}</span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-white text-xs truncate font-medium">{post.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        {orders.length > 0 ? orders.map(order => (
                            <div key={order._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white/5 rounded-xl text-moto-accent">
                                            <Package className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Order No</div>
                                            <div className="text-white font-mono font-bold text-sm">#{order._id}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 font-bold uppercase">Date</div>
                                            <div className="text-gray-300 text-sm font-mono">{order.date}</div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${order.status === 'Teslim Edildi' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10'}`}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">{order.items.length} Items</span>
                                    <span className="text-xl font-bold text-moto-accent font-mono">₺{order.total.toLocaleString()}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No orders yet.</p>
                                <Button className="mt-4 bg-moto-accent text-black" onClick={() => onNavigate('shop')}>Go Shopping</Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Premium System Config (Edit Profile) */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-0 md:p-8 overflow-hidden"
                    >
                        {/* Background Decorative Elements */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-moto-accent animate-scan-v shadow-[0_0_15px_rgba(242,166,25,0.5)]" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(242,166,25,0.1),transparent_70%)]" />
                        </div>

                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className="bg-zinc-900/50 border border-white/10 w-full max-w-5xl h-full md:h-[85vh] rounded-none md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row relative shadow-[0_0_50px_rgba(0,0,0,1)]"
                        >
                            {/* Left Panel: Preview & Status */}
                            <div className="md:w-1/3 bg-black/40 border-r border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute top-4 left-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-moto-accent rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">System Link: Active</span>
                                    </div>
                                </div>

                                <div className="relative mb-8 group">
                                    <div className="absolute inset-0 bg-moto-accent rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                                    <UserAvatar name={editForm.name} size={160} className="relative z-10 border-4 border-white/5 shadow-2xl ring-1 ring-moto-accent/30" />
                                    <button className="absolute bottom-2 right-2 z-20 p-3 bg-moto-accent text-black rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all">
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">{editForm.name || "UNNAMED"}</h3>
                                    <div className="flex items-center justify-center gap-4 py-2 border-y border-white/5">
                                        <div className="text-center">
                                            <span className="block text-[8px] text-gray-500 font-black uppercase tracking-widest">Rank</span>
                                            <span className="text-xs text-moto-accent font-mono font-bold uppercase">{user.rank}</span>
                                        </div>
                                        <div className="w-[1px] h-6 bg-white/5" />
                                        <div className="text-center">
                                            <span className="block text-[8px] text-gray-500 font-black uppercase tracking-widest">XP</span>
                                            <span className="text-xs text-white font-mono font-bold">{user.points || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto w-full pt-8">

                                </div>
                            </div>

                            {/* Right Panel: Fields */}
                            <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar relative">
                                <div className="flex justify-between items-center mb-12">
                                    <div>
                                        <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">System Config</h2>
                                        <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-mono">Profile and Identity Synchronization</p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                    {/* Name Field */}
                                    <div className="col-span-1">
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full bg-transparent border-b-2 border-white/10 pt-6 pb-2 text-xl text-white outline-none focus:border-moto-accent transition-all peer"
                                                placeholder=" "
                                            />
                                            <label className="absolute left-0 top-0 text-[10px] font-black text-gray-500 uppercase tracking-widest transition-all peer-focus:text-moto-accent peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-[10px]">
                                                Operator Name
                                            </label>
                                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-moto-accent transition-all duration-300 group-focus-within:w-full" />
                                        </div>
                                    </div>

                                    {/* Location Field */}
                                    <div className="col-span-1">
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={editForm.location}
                                                onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                                className="w-full bg-transparent border-b-2 border-white/10 pt-6 pb-2 text-xl text-white outline-none focus:border-moto-accent transition-all peer"
                                                placeholder=" "
                                            />
                                            <label className="absolute left-0 top-0 text-[10px] font-black text-gray-500 uppercase tracking-widest transition-all peer-focus:text-moto-accent peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-[10px]">
                                                Current Sector (Location)
                                            </label>
                                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-moto-accent transition-all duration-300 group-focus-within:w-full" />
                                        </div>
                                    </div>

                                    {/* Bio Field */}
                                    <div className="col-span-full">
                                        <div className="relative group">
                                            <textarea
                                                value={editForm.bio}
                                                onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                                className="w-full bg-transparent border-b-2 border-white/10 pt-6 pb-2 text-xl text-white outline-none focus:border-moto-accent transition-all peer h-12 min-h-[48px] overflow-hidden resize-none"
                                                placeholder=" "
                                            />
                                            <label className="absolute left-0 top-0 text-[10px] font-black text-gray-500 uppercase tracking-widest transition-all peer-focus:text-moto-accent peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-[10px]">
                                                Operational Bio / Vision
                                            </label>
                                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-moto-accent transition-all duration-300 group-focus-within:w-full" />
                                        </div>
                                    </div>

                                    {/* Phone Field */}
                                    <div className="col-span-1">
                                        <div className="relative group">
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="w-full bg-transparent border-b-2 border-white/10 pt-6 pb-2 text-xl text-white outline-none focus:border-moto-accent transition-all peer"
                                                placeholder=" "
                                            />
                                            <label className="absolute left-0 top-0 text-[10px] font-black text-gray-500 uppercase tracking-widest transition-all peer-focus:text-moto-accent peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-[10px]">
                                                Comms Link (Phone)
                                            </label>
                                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-moto-accent transition-all duration-300 group-focus-within:w-full" />
                                        </div>
                                    </div>

                                    {/* Social: Instagram (Mock Field) */}
                                    <div className="col-span-1">
                                        <div className="relative group opacity-60 hover:opacity-100 transition-opacity">
                                            <input
                                                type="text"
                                                className="w-full bg-transparent border-b-2 border-white/10 pt-6 pb-2 text-xl text-white outline-none focus:border-moto-accent transition-all peer"
                                                placeholder="@username"
                                            />
                                            <label className="absolute left-0 top-0 text-[10px] font-black text-gray-500 uppercase tracking-widest transition-all peer-focus:text-moto-accent peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-[10px]">
                                                Instagram Signal
                                            </label>
                                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-moto-accent transition-all duration-300 group-focus-within:w-full" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-16 flex items-center justify-between pb-8">
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors py-4 px-8"
                                    >
                                        Abort Change
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="group relative px-12 py-5 bg-moto-accent text-black font-black uppercase tracking-[0.2em] text-sm rounded-none md:rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(242,166,25,0.3)] hover:shadow-[0_0_50px_rgba(242,166,25,0.5)] transition-all hover:scale-105"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 slant" />
                                        <span className="relative z-10 flex items-center gap-3">
                                            Synchronize Profile
                                            <Shield className="w-4 h-4" />
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Tactical Border Accents */}
                            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-moto-accent/30 rounded-tr-[2rem] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-moto-accent/30 rounded-bl-[2rem] pointer-events-none" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedBike && (
                <BikeDetailModal
                    isOpen={!!selectedBike}
                    onClose={() => setSelectedBike(null)}
                    bike={selectedBike}
                    onSave={(updated) => {
                        // If it's a new bike (no ID yet logic handles in service usually, but for local state update)
                        if (!updated._id) updated._id = String(Date.now());

                        const exists = myBikes.find(b => b._id === updated._id);
                        let newGarage;
                        if (exists) {
                            newGarage = myBikes.map(b => b._id === updated._id ? updated : b);
                        } else {
                            newGarage = [...myBikes, updated];
                        }
                        handleUpdateGarage(newGarage);
                    }}
                />
            )}

            <UserListModal
                isOpen={isUserListOpen}
                onClose={() => setIsUserListOpen(false)}
                title={userListType === 'followers' ? 'Takipçiler' : 'Takip Edilenler'}
                users={modalUsers}
                onNavigate={onNavigate}
            />

        </div>
    );
};
