import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Grid, Bike, FolderHeart, Settings, MapPin, Gauge, Trophy, Package, LogOut, Edit3, X, Image as ImageIcon, LayoutDashboard, Shield } from 'lucide-react';
import { SocialPost, SocialProfile, User as UserType, Order, ViewState, ColorTheme, UserBike } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { Button } from '../ui/Button';
import { orderService } from '../../services/orderService';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { storageService } from '../../services/storageService';
import { notify } from '../../services/notificationService';
import { useLanguage } from '../../contexts/LanguageProvider';
import { BikeDetailModal } from '../BikeDetailModal';

// Extend SocialProfile or use UserType, we need a unified approach.
// The main App passes `user` which is `UserType`. We can cast or map it.
interface UserProfileProps {
    user: UserType; // Current Logged in User
    onLogout?: () => void;
    onUpdateUser?: (user: UserType) => void;
    onNavigate?: (view: ViewState) => void;
    colorTheme?: ColorTheme;
    onColorChange?: (theme: ColorTheme) => void;
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

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onUpdateUser, onNavigate, colorTheme, onColorChange, profile: propProfile }) => {
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

    const isOwnProfile = !propProfile || propProfile._id === user._id || propProfile.id === user.id;

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

                {/* Header Actions - Only show for Own Profile */}
                {isOwnProfile && (
                    <div className="absolute top-4 right-4 z-30 flex gap-2">
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
                    </div>
                )}

                {/* Profile Stats Card - Floating */}
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 z-20 w-[95%] md:w-[600px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex items-center justify-between">
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-xl md:text-2xl font-display font-black text-white">{displayProfile.points}</span>
                        <span className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest font-bold">XP Points</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-xl md:text-2xl font-display font-black text-white">
                            {Array.isArray(displayProfile.followers) ? displayProfile.followers.length : (displayProfile.followersCount || 0)}
                        </span>
                        <span className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest font-bold">Followers</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-xl md:text-2xl font-display font-black text-white">
                            {Array.isArray(displayProfile.following) ? displayProfile.following.length : (displayProfile.followingCount || 0)}
                        </span>
                        <span className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest font-bold">Following</span>
                    </div>

                    {/* Floating Avatar */}
                    <div className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 p-2 bg-[#050505] rounded-full">
                        <UserAvatar name={displayProfile.name} size={96} className="border-4 border-moto-accent w-20 h-20 md:w-24 md:h-24" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-12 flex flex-col items-center text-center">
                <h1 className="text-3xl font-display font-black uppercase flex items-center gap-3">
                    {displayProfile.name}
                    {displayProfile.rank && <span className="bg-moto-accent text-black text-xs px-2 py-1 rounded font-bold">{displayProfile.rank}</span>}
                </h1>
                <p className="text-gray-400 max-w-lg mt-2 font-mono text-sm">{displayProfile.bio || "Rider. Explorer. Adrenaline Junkie."}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" /> {displayProfile.address || 'Unknown Location'}
                </div>
            </div>

            {/* The Garage (Horizontal Scroll) */}
            <div className="mb-16">
                <div className="max-w-7xl mx-auto px-4 mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-display font-bold flex items-center gap-2 text-white">
                        <Bike className="w-5 h-5 text-moto-accent" /> THE GARAGE
                    </h2>
                    <span className="text-xs text-gray-500 font-mono hidden md:block">{myBikes.length} BIKES IN COLLECTION</span>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-8 px-4 md:px-8 no-scrollbar snap-x snap-mandatory max-w-7xl mx-auto">
                    {/* Add Button */}
                    <motion.div
                        className="min-w-[280px] h-[350px] bg-white/5 border border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center text-gray-500 hover:bg-white/10 hover:text-white transition-colors cursor-pointer snap-center shrink-0"
                        whileHover={{ scale: 0.98 }}
                        onClick={() => setSelectedBike({ _id: '', brand: '', model: '', year: '', km: '', color: '', image: '', maintenance: [], modifications: [], isPublic: true } as UserBike)}
                    >
                        <Settings className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-widest">Add Machine</span>
                    </motion.div>

                    {myBikes.map((bike) => (
                        <motion.div
                            key={bike._id}
                            className="min-w-[280px] md:min-w-[320px] h-[350px] bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl overflow-hidden relative group snap-center shadow-lg cursor-pointer shrink-0"
                            whileHover={{ y: -10 }}
                            onClick={() => setSelectedBike(bike)}
                        >
                            <img src={bike.image} alt={bike.model} className="w-full h-3/5 object-cover" />
                            <div className="p-6">
                                <h3 className="text-lg font-bold font-display uppercase leading-tight mb-1 text-white">{bike.brand}</h3>
                                <p className="text-2xl font-black text-white font-display uppercase text-moto-accent">{bike.model}</p>

                                <div className="mt-4 flex items-center justify-between text-xs text-gray-400 font-mono">
                                    <span className="flex items-center gap-1"><Grid className="w-3 h-3" /> {bike.year}</span>
                                    <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {bike.km} KM</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
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
                            <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white/5 rounded-xl text-moto-accent">
                                            <Package className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Order No</div>
                                            <div className="text-white font-mono font-bold text-sm">#{order.id}</div>
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

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Edit3 className="w-5 h-5 text-moto-accent" /> Edit Profile</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Name</label>
                                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-moto-accent transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bio</label>
                                <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-moto-accent h-24 resize-none transition-colors" placeholder="Tell us about yourself..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location</label>
                                    <input type="text" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-moto-accent transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone</label>
                                    <input type="tel" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-moto-accent transition-colors" />
                                </div>
                            </div>

                            {/* Theme Selector Integration */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-4">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Settings className="w-4 h-4" /> App Theme</h4>
                                <div className="grid grid-cols-7 gap-2">
                                    {[
                                        { id: 'orange', color: '#F2A619' },
                                        { id: 'red', color: '#EF4444' },
                                        { id: 'blue', color: '#3B82F6' },
                                        { id: 'green', color: '#22C55E' },
                                        { id: 'purple', color: '#A855F7' },
                                        { id: 'cyan', color: '#06B6D4' },
                                        { id: 'yellow', color: '#EAB308' },
                                    ].map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => onColorChange && onColorChange(theme.id as any)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${colorTheme === theme.id ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                                            style={{ backgroundColor: theme.color }}
                                        >
                                            {colorTheme === theme.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-white/10 text-gray-400 hover:bg-white/5 hover:text-white">Cancel</Button>
                            <Button onClick={handleSaveProfile} className="px-8 bg-moto-accent text-black hover:bg-white">Save</Button>
                        </div>
                    </motion.div>
                </div>
            )}

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

        </div>
    );
};
