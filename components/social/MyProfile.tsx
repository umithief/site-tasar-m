import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import {
    Settings, Camera, Edit2, Shield, Box, Activity, MapPin,
    Calendar, Grid, Image as ImageIcon, Bookmark, Bell, Plus, Save, X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar } from '../ui/UserAvatar';
import { MediaUploader } from '../ui/MediaUploader';
import { useQuery } from '@tanstack/react-query';
import { socialService } from '../../services/socialService';

// --- Types ---
interface StatGaugeProps {
    value: number;
    max: number;
    label: string;
    color: string;
    icon: React.ReactNode;
}

// --- Radial Gauge Component ---
const StatGauge: React.FC<StatGaugeProps> = ({ value, max, label, color, icon }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const circumference = 2 * Math.PI * 40; // r=40
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center group relative">
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Background Ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-800"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r="40"
                        stroke={color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                {/* Center Icon/Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-${color} mb-1`}>{icon}</div>
                    <span className="text-xl font-mono font-bold text-white">{value}</span>
                </div>

                {/* Glowing Blur Behind */}
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 bg-${color}`} style={{ backgroundColor: color }} />
            </div>
            <span className="mt-2 text-xs font-mono text-gray-400 uppercase tracking-widest">{label}</span>
        </div>
    );
};

// --- Digital Garage Card ---
const GarageCard = ({ bike, isAdd = false, onClick }: { bike?: any, isAdd?: boolean, onClick?: () => void }) => {
    if (isAdd) {
        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClick}
                className="min-w-[280px] h-[360px] rounded-3xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-moto-accent/50 hover:bg-white/10 transition-all group"
            >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-moto-accent group-hover:text-black transition-colors">
                    <Plus className="w-8 h-8 text-gray-400 group-hover:text-black" />
                </div>
                <span className="font-display font-bold text-gray-400 group-hover:text-white uppercase tracking-wider">Add Machine</span>
            </motion.div>
        );
    }

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="relative min-w-[280px] h-[360px] rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 group shadow-2xl"
        >
            <div className="absolute top-4 left-4 z-10">
                {bike.isPrimary && (
                    <span className="px-3 py-1 bg-moto-accent text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-moto-accent/20">
                        Primary Unit
                    </span>
                )}
            </div>

            <div className="h-2/3 w-full overflow-hidden">
                <img
                    src={bike.image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070'}
                    alt={bike.model}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
            </div>

            <div className="absolute bottom-0 inset-x-0 p-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-1">{bike.brand}</h3>
                        <h2 className="text-2xl font-display font-black text-white leading-none">{bike.model}</h2>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-[10px] font-mono text-gray-400">
                    <span>{bike.year} MODEL</span>
                    <span>{bike.km?.toLocaleString()} KM</span>
                </div>
            </div>
        </motion.div>
    );
};

export const MyProfile: React.FC = () => {
    const { user, updateProfile } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'feed' | 'saved' | 'notifications'>('feed');
    const [editForm, setEditForm] = useState({
        name: user?.name || '',
        username: user?.username || '',
        bio: user?.bio || '',
        location: user?.location || '',
    });

    const [loading, setLoading] = useState(false);

    // Mouse Parallax Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            mouseX.set((clientX - innerWidth / 2) / 50);
            mouseY.set((clientY - innerHeight / 2) / 50);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Fetch User Posts Stats (Mocking functionality for now or using useQuery if needed)
    // To calculate influence properly we would need more data, mocking for UI
    const totalLikes = 1204; // Mock
    const totalPosts = 45; // Mock
    const influenceScore = Math.floor((totalLikes / totalPosts) * 10) || 0;

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            await updateProfile(editForm);
            setIsEditing(false);
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-moto-accent/30">
            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* 1. Parallax Hero Header */}
            <div className="relative h-[60vh] overflow-hidden group">
                <motion.div
                    style={{ x: springX, y: springY, scale: 1.1 }}
                    className="absolute inset-0 w-full h-full"
                >
                    <img
                        src={user.coverImage || 'https://images.unsplash.com/photo-1625055088214-5d8f6155680d?q=80&w=2069'}
                        className="w-full h-full object-cover opacity-60"
                        alt="Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#050505]/50 to-[#050505]" />
                </motion.div>

                {/* Edit & Settings Quick Actions */}
                <div className="absolute top-24 right-8 flex gap-4 z-20">
                    <button className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/10 transition-colors group">
                        <Settings className="w-5 h-5 text-gray-300 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
                    </button>
                    <button
                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                        className={`flex items-center gap-2 px-6 py-3 backdrop-blur-xl border rounded-full font-bold uppercase text-xs tracking-widest transition-all ${isEditing
                                ? 'bg-moto-accent text-black border-moto-accent hover:brightness-110'
                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            }`}
                    >
                        {isEditing ? (
                            <>
                                {loading ? 'Saving...' : 'Save Profile'}
                                <Save className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Edit Profile
                                <Edit2 className="w-4 h-4" />
                            </>
                        )}
                    </button>
                    {isEditing && (
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-3 bg-red-500/20 text-red-500 border border-red-500/30 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Core Identity Layer */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 z-10 text-center px-4">
                    {/* Status Ring Avatar */}
                    <div className="relative mb-8 group">
                        <div className="absolute inset-0 bg-moto-accent rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>

                        {/* Status Indicator Ring (SVG) */}
                        <svg className="absolute -inset-4 w-[120%] h-[120%] animate-spin-slow opacity-60" viewBox="0 0 100 100">
                            <path id="curve" d="M 50 50 m -40 0 a 40 40 0 1 1 80 0 a 40 40 0 1 1 -80 0" fill="transparent" />
                            <text className="text-[6px] font-mono tracking-[0.2em] fill-moto-accent uppercase font-bold">
                                <textPath href="#curve">
                                    Operator Status • Active • Ready to Ride •
                                </textPath>
                            </text>
                        </svg>

                        <div className="relative w-32 h-32 md:w-40 md:h-40 p-1.5 bg-[#050505] rounded-full border border-white/10">
                            <UserAvatar
                                name={user.name}
                                size={145}
                                className="w-full h-full rounded-full border-4 border-[#050505]"
                            />
                            {/* Camera Icon Overlay for Edit */}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center cursor-pointer backdrop-blur-sm border-2 border-dashed border-white/30 hover:border-moto-accent transition-colors">
                                    <Camera className="w-8 h-8 text-white/80" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Info Inputs */}
                    <div className="space-y-4 max-w-2xl w-full">
                        {isEditing ? (
                            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-2xl font-display font-bold text-center text-white focus:border-moto-accent focus:ring-1 focus:ring-moto-accent outline-none transition-all placeholder-white/20"
                                    placeholder="Rider Name"
                                />
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={editForm.username}
                                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono text-center text-moto-accent focus:border-moto-accent outline-none"
                                        placeholder="@username"
                                    />
                                    <input
                                        type="text"
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono text-center text-gray-400 focus:border-moto-accent outline-none"
                                        placeholder="Location"
                                    />
                                </div>
                                <textarea
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-moto-accent outline-none resize-none text-center"
                                    placeholder="Enter your rider bio protocol..."
                                />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-white mb-2">
                                    {user.name}
                                </h1>
                                <div className="flex items-center justify-center gap-4 text-sm font-mono text-gray-400">
                                    <span className="text-moto-accent">@{user.username || user.name.toLowerCase().replace(/\s/g, '')}</span>
                                    <span>|</span>
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {user.location || 'Unknown Location'}</span>
                                    <span>|</span>
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-white text-[10px] uppercase font-bold tracking-wider">{user.rank || 'Rider'}</span>
                                </div>
                                <p className="text-gray-400 max-w-lg mx-auto leading-relaxed border-t border-white/5 pt-4 mt-4">
                                    {user.bio || "No mission profile initialized."}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. The Performance Dashboard */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex justify-around items-center shadow-xl"
                    >
                        <StatGauge value={influenceScore} max={100} label="Influence" color="#ef4444" icon={<Activity className="w-6 h-6" />} />
                        <div className="h-16 w-px bg-white/10" />
                        <StatGauge value={user.followersCount || user.followers?.length || 0} max={1000} label="Net Reach" color="#3b82f6" icon={<Shield className="w-6 h-6" />} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2 bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col justify-center"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Box className="w-5 h-5 text-moto-accent" />
                                Garage Completion
                            </h3>
                            <span className="font-mono text-moto-accent">85%</span>
                        </div>
                        {/* Custom Progress Bar */}
                        <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                            {/* Striped Pattern Overlay */}
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '85%' }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-moto-accent to-orange-600 relative"
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[2px]"></div>
                            </motion.div>
                        </div>
                        <div className="mt-4 flex gap-8 text-xs font-mono text-gray-500">
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Docs Verified</span>
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-moto-accent"></div> 3 Machines Registered</span>
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Insurance Active</span>
                        </div>
                    </motion.div>
                </div>

                {/* 3. The Digital Garage Slider */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">
                            Digital Garage <span className="text-moto-accent">_LOG</span>
                        </h2>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white">←</button>
                            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white">→</button>
                        </div>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar snap-x">
                        <GarageCard isAdd onClick={() => alert('Open add bike modal')} />
                        {user.garage && user.garage.length > 0 ? (
                            user.garage.map((bike: any) => (
                                <GarageCard key={bike._id} bike={bike} />
                            ))
                        ) : (
                            // Mock bike if garage empty
                            <GarageCard bike={{
                                brand: 'System', model: 'No Data', year: '----', km: 0, image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=2070'
                            }} />
                        )}
                    </div>
                </div>

                {/* 4. Content Management Tabs */}
                <div className="min-h-[500px]">
                    <div className="flex border-b border-white/10 mb-8 sticky top-20 bg-[#050505]/80 backdrop-blur-xl z-30 pt-4">
                        {[
                            { id: 'feed', label: 'My Feed', icon: Grid },
                            { id: 'saved', label: 'Saved Gear', icon: Bookmark },
                            { id: 'notifications', label: 'Notifications', icon: Bell },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`relative px-8 py-4 flex items-center gap-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-moto-accent' : ''}`} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="active-tab-line"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-moto-accent shadow-[0_0_10px_#ff3b3b]"
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
                            className="bg-zinc-900/30 border border-white/5 rounded-3xl min-h-[400px] p-8"
                        >
                            {activeTab === 'feed' && (
                                <div className="text-center py-20">
                                    <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                                        <Grid className="w-8 h-8 text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Ride Log Empty</h3>
                                    <p className="text-gray-400 max-w-sm mx-auto">Start sharing your journey to populate the command center feed.</p>
                                </div>
                            )}
                            {activeTab === 'saved' && (
                                <div className="text-center py-20">
                                    <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                                        <Bookmark className="w-8 h-8 text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Vault Secure</h3>
                                    <p className="text-gray-400 max-w-sm mx-auto">No items bookmarked in your inventory yet.</p>
                                </div>
                            )}
                            {activeTab === 'notifications' && (
                                <div className="space-y-4 max-w-2xl mx-auto">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors cursor-pointer">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-moto-accent shrink-0" />
                                            <div>
                                                <p className="text-sm text-gray-300 mb-1"><span className="font-bold text-white">System:</span> New route data available for your area.</p>
                                                <span className="text-[10px] font-mono text-gray-600 uppercase">2 hours ago</span>
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
    );
};
