import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Settings, Share2, MapPin, Calendar, Grid, Bookmark, Map as MapIcon, Edit2, LogOut, Camera } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { garageService, GarageVehicle } from '../../services/garageService';
import GarageCard from './GarageCard';
import { notify } from '../../services/notificationService';

// Placeholder Components for Tabs
const ContentGrid = ({ userId }: { userId: string }) => (
    <div className="grid grid-cols-3 gap-0.5 pb-20">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
            <div key={item} className="aspect-square bg-zinc-900 relative">
                <img
                    src={`https://images.unsplash.com/photo-${1550000000000 + item}?auto=format&fit=crop&w=400&q=80`}
                    className="w-full h-full object-cover"
                    alt="Post"
                />
            </div>
        ))}
    </div>
);

const MobileProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: authUser, logout } = useAuthStore();
    const [profileUser, setProfileUser] = useState<any>(null);
    const [garage, setGarage] = useState<GarageVehicle[]>([]);
    const [activeTab, setActiveTab] = useState<'posts' | 'routes' | 'saved'>('posts');
    const [isLoading, setIsLoading] = useState(true);

    // Parallax logic
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: containerRef }); // If we had a scrollable container context
    // Since we likely scroll the window or a main layout, we might need global window scroll.
    // For now, assuming this component is inside a scrollable div in layout or we use document scroll.
    // Simplifying parallax to just CSS or basic motion for this context if accurate scroll target isn't easily grabbed without more context.

    const isOwner = !username || (authUser?.username === username);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                // Determine ID or Username to fetch. 
                // If it's "me", use authUser ID. If param exists, find by ID/Username.
                // Our API `getProfile` expects an ID currently. 
                // We might need to adjust logic if we want to fetch by username.
                // For simplified "My Profile" flow, we use authUser.

                let targetId = authUser?._id;

                // Real-world: Should fetch by username if provided. 
                // For this demo, we'll assume we are viewing the logged-in user if isOwner.
                if (!isOwner && username) {
                    // Need an endpoint to resolve username -> id or update fetching
                    // Skipping for "My Profile" focus as per prompt instructions
                }

                if (targetId) {
                    const res = await api.get(`/users/${targetId}`);
                    setProfileUser(res.data.data.user);
                    setGarage(res.data.data.user.garage || []);
                }
            } catch (error) {
                console.error("Profile fetch error", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (authUser) fetchProfile();
    }, [authUser, username, isOwner]);

    const handleAddVehicle = async () => {
        // In a real app, this would open a modal form.
        // For demo, we add a mock bike.
        try {
            const mockBike = {
                brand: "Yamaha",
                model: "R1M",
                year: 2024,
                image: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800"
            };
            const res = await garageService.addToGarage(mockBike);
            setGarage(res.data.data.garage);
            notify.success("Motosiklet garaja eklendi!");
        } catch (error) {
            notify.error("Hata oluştu.");
        }
    };

    const handleRemoveVehicle = async (id: string) => {
        if (!confirm('Silmek istediğine emin misin?')) return;
        try {
            const res = await garageService.removeFromGarage(id);
            setGarage(res.data.data.garage);
            notify.success("Motosiklet silindi.");
        } catch (error) {
            notify.error("Silinemedi.");
        }
    };

    if (isLoading || !profileUser) {
        return <div className="h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-black text-white pb-20 overflow-x-hidden">
            {/* Parallax Hero */}
            <div className="relative h-64 w-full overflow-hidden">
                <motion.div
                    className="absolute inset-0"

                >
                    <img
                        src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1920"
                        alt="Cover"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
                </motion.div>

                {/* Top Nav Actions */}
                <div className="absolute top-4 right-4 flex gap-3 z-10">
                    <button className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white/80 hover:bg-white/10">
                        <Share2 size={20} />
                    </button>
                    {isOwner && (
                        <button
                            onClick={logout}
                            className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white/80 hover:bg-red-500/20 hover:text-red-500"
                        >
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Info (Floating) */}
            <div className="px-4 -mt-20 relative z-10 mb-6">
                <div className="flex justify-between items-end mb-4">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full p-1 bg-black ring-2 ring-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)] overflow-hidden">
                            <img
                                src={profileUser.avatar || "https://ui-avatars.com/api/?background=random"}
                                alt="Avatar"
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                        {isOwner && (
                            <div className="absolute bottom-0 right-0 bg-zinc-800 p-1.5 rounded-full border border-black cursor-pointer hover:bg-orange-500 transition-colors">
                                <Camera size={14} className="text-white" />
                            </div>
                        )}
                    </div>

                    {isOwner ? (
                        <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors border border-white/10 flex items-center gap-2">
                            <Edit2 size={14} /> Düzenle
                        </button>
                    ) : (
                        <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2 rounded-full text-sm font-bold shadow-[0_0_15px_-5px_orange] transition-all">
                            Takip Et
                        </button>
                    )}
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-wide">{profileUser.name}</h1>
                    <p className="text-zinc-400 text-sm">@{profileUser.username || 'rider'}</p>
                </div>

                <p className="mt-3 text-zinc-300 text-sm leading-relaxed max-w-sm">
                    {profileUser.bio || "Yolun sonu görünüyorsa, yeterince hızlı gitmiyorsun demektir. 🏍️💨"}
                </p>

                <div className="flex gap-4 mt-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                        <MapPin size={12} strokeWidth={2.5} />
                        <span>{profileUser.location || "İstanbul, TR"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar size={12} strokeWidth={2.5} />
                        <span>Katıldı {profileUser.joinDate || "2024"}</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 px-4 mb-8">
                <div className="bg-zinc-900/50 rounded-xl p-3 text-center border border-white/5">
                    <div className="text-lg font-mono font-bold text-white">{profileUser.followersCount || 0}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Takipçi</div>
                </div>
                <div className="bg-zinc-900/50 rounded-xl p-3 text-center border border-white/5">
                    <div className="text-lg font-mono font-bold text-white">{profileUser.followingCount || 0}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Takip</div>
                </div>
                <div className="bg-zinc-900/50 rounded-xl p-3 text-center border border-white/5">
                    <div className="text-lg font-mono font-bold text-white">{profileUser.points || 0}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Puan</div>
                </div>
            </div>

            {/* THE GARAGE */}
            <div className="mb-8">
                <div className="px-4 mb-4 flex items-center justify-between">
                    <h2 className="text-md font-bold tracking-widest text-zinc-400 flex items-center gap-2">
                        <div className="w-1 h-4 bg-orange-500 rounded-full" />
                        GARAJ
                    </h2>
                    <span className="text-xs text-zinc-600 font-mono">{garage.length} ARAÇ</span>
                </div>

                <div className="flex overflow-x-auto gap-4 px-4 pb-4 scrollbar-hide snap-x">
                    {garage.map((bike) => (
                        <div key={bike._id} className="snap-start">
                            <GarageCard
                                vehicle={bike}
                                isOwner={isOwner}
                                onRemove={handleRemoveVehicle}
                            />
                        </div>
                    ))}
                    {isOwner && (
                        <div className="snap-start">
                            <GarageCard isAddCard onAdd={handleAddVehicle} />
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="bg-black sticky top-0 z-20 border-b border-white/10 backdrop-blur-xl bg-black/80">
                <div className="flex gap-8 px-4">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`py-4 relative text-sm font-bold tracking-wide transition-colors ${activeTab === 'posts' ? 'text-white' : 'text-zinc-500'}`}
                    >
                        GÖNDERİLER
                        {activeTab === 'posts' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 shadow-[0_0_10px_orange]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('routes')}
                        className={`py-4 relative text-sm font-bold tracking-wide transition-colors ${activeTab === 'routes' ? 'text-white' : 'text-zinc-500'}`}
                    >
                        ROTALAR
                        {activeTab === 'routes' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 shadow-[0_0_10px_orange]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`py-4 relative text-sm font-bold tracking-wide transition-colors ${activeTab === 'saved' ? 'text-white' : 'text-zinc-500'}`}
                    >
                        KAYDEDİLENLER
                        {activeTab === 'saved' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 shadow-[0_0_10px_orange]" />}
                    </button>
                </div>
            </div>

            <div className="min-h-[300px]">
                {activeTab === 'posts' && <ContentGrid userId={profileUser._id} />}
                {activeTab === 'routes' && (
                    <div className="p-8 text-center text-zinc-600">
                        <MapIcon className="mx-auto mb-3 opacity-50" size={32} />
                        <p>Henüz paylaşılan rota yok.</p>
                    </div>
                )}
                {activeTab === 'saved' && (
                    <div className="p-8 text-center text-zinc-600">
                        <Bookmark className="mx-auto mb-3 opacity-50" size={32} />
                        <p>Kaydedilen içerik yok.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default MobileProfile;
