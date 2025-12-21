import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import {
    Settings, Camera, Edit2, Shield, Box, Activity, MapPin,
    Calendar, Grid, Image as ImageIcon, Bookmark, Bell, Plus, Save, X,
    Trophy, Zap, Wind, Target, Cpu, Hash
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar } from '../ui/UserAvatar';
import { notify } from '../../services/notificationService';

// --- Types ---
interface StatGaugeProps {
    value: number;
    max: number;
    label: string;
    color: string;
    icon: React.ReactNode;
}

interface Achievement {
    id: string;
    title: string;
    icon: typeof Trophy;
    color: string;
    description: string;
}

const ACHIEVEMENTS: Achievement[] = [
    { id: '1', title: 'Viraj Ustası', icon: Target, color: '#ef4444', description: 'Riva virajlarında 100+ km sürüldü.' },
    { id: '2', title: 'Gece Sürücüsü', icon: Zap, color: '#3b82f6', description: 'Gece sürüşlerinde 500+ km tamamlandı.' },
    { id: '3', title: 'Hız Tutkunu', icon: Wind, color: '#f2a619', description: 'Pist günlerine katılım sağlandı.' },
    { id: '4', title: 'Teknoloji Uzmanı', icon: Cpu, color: '#10b981', description: 'Akıllı ekipman kiti yüklendi.' },
];

// --- Radial Gauge Component ---
const StatGauge: React.FC<StatGaugeProps> = ({ value, max, label, color, icon }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center group relative">
            <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="64" cy="64" r="40" stroke={color} strokeWidth="6" fill="transparent"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="mb-1" style={{ color }}>{icon}</div>
                    <span className="text-xl font-mono font-bold text-white">{value}</span>
                </div>
                <div className="absolute inset-0 rounded-full blur-2xl opacity-10" style={{ backgroundColor: color }} />
            </div>
            <span className="mt-3 text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">{label}</span>
        </div>
    );
};

// --- Tactical Achievement Badge ---
const AchievementBadge = ({ achievement }: { achievement: Achievement }) => (
    <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        className="min-w-[160px] p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center group cursor-pointer relative overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="p-3 rounded-xl mb-4 relative" style={{ backgroundColor: `${achievement.color}15` }}>
            <achievement.icon className="w-6 h-6" style={{ color: achievement.color }} />
            <div className="absolute inset-0 blur-lg opacity-40" style={{ backgroundColor: achievement.color }} />
        </div>
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">{achievement.title}</h4>
        <p className="text-[10px] text-gray-500 leading-tight">{achievement.description}</p>
    </motion.div>
);

// --- Digital Garage Card (Enhanced) ---
const GarageCard = ({ bike, isAdd = false, onClick }: { bike?: any, isAdd?: boolean, onClick?: () => void }) => {
    if (isAdd) {
        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClick}
                className="min-w-[280px] h-[380px] rounded-3xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-moto-accent/50 hover:bg-white/10 transition-all group"
            >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-moto-accent group-hover:text-black transition-colors">
                    <Plus className="w-8 h-8 text-gray-400 group-hover:text-black" />
                </div>
                <span className="font-display font-bold text-gray-400 group-hover:text-white uppercase tracking-wider text-xs">Unit Deployment</span>
            </motion.div>
        );
    }

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="relative min-w-[280px] md:min-w-[320px] h-[380px] rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 group shadow-2xl"
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

            <img
                src={bike.image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070'}
                alt={bike.model}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />

            <div className="absolute top-4 left-4 z-20">
                {bike.isPrimary && (
                    <span className="px-3 py-1 bg-moto-accent text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                        PRIMARY UNIT
                    </span>
                )}
            </div>

            <div className="absolute bottom-0 inset-x-0 p-6 z-20">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h3 className="text-moto-accent font-mono text-[10px] uppercase tracking-[0.3em] mb-1">{bike.brand}</h3>
                        <h2 className="text-2xl font-display font-black text-white hover:text-moto-accent transition-colors">{bike.model}</h2>
                    </div>
                    <div className="text-right">
                        <span className="block text-white font-mono text-sm leading-none">#{bike.year}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Model</span>
                    </div>
                </div>

                {/* Overlaid Tech Specs on Hover */}
                <div className="grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                    <div className="bg-white/5 backdrop-blur-md rounded-lg p-2 border border-white/10">
                        <span className="block text-[8px] text-gray-500 uppercase font-black">Performance</span>
                        <span className="text-xs text-white font-mono">190 HP / 115 NM</span>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md rounded-lg p-2 border border-white/10">
                        <span className="block text-[8px] text-gray-500 uppercase font-black">Distance</span>
                        <span className="text-xs text-white font-mono">{bike.km?.toLocaleString()} KM</span>
                    </div>
                </div>
            </div>

            {/* Tactical Scan Line (Card Interior) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-0 group-hover:opacity-20 transition-opacity">
                <div className="absolute inset-x-0 h-[1px] bg-moto-accent top-0 animate-scan" />
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

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            await updateProfile(editForm);
            setIsEditing(false);
            notify.success('Profile updated successfully.');
        } catch (error: any) {
            notify.error('Update failed.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-moto-accent/30 selection:text-black overflow-x-hidden">
            {/* Inline Tactic CSS for specific animations */}
            <style>{`
                @keyframes scan-v {
                    0% { top: -10%; }
                    100% { top: 110%; }
                }
                .animate-scan-v {
                    animation: scan-v 4s linear infinite;
                }
                .text-stroke-white {
                    -webkit-text-stroke: 1px rgba(255,255,255,0.1);
                    color: transparent;
                }
            `}</style>

            {/* 1. Tactical Scanning Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(242,166,25,0.05),transparent_70%)]" />
                <div className="absolute inset-x-0 h-[2px] bg-moto-accent/10 blur-sm animate-scan-v" />
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            </div>

            {/* 2. Parallax Hero Header */}
            <div className="relative h-[65vh] overflow-hidden">
                <motion.div style={{ x: springX, y: springY, scale: 1.15 }} className="absolute inset-0 w-full h-full">
                    <img
                        src={user.coverImage || 'https://images.unsplash.com/photo-1625055088214-5d8f6155680d?q=80&w=2069'}
                        className="w-full h-full object-cover opacity-40 brightness-50"
                        alt="Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505]" />
                </motion.div>

                {/* Floating Navigation Overlay */}
                <div className="absolute top-24 inset-x-0 px-8 flex justify-between items-center z-50">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('navigate-to', { detail: 'social-hub' }))}
                        className="group flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full hover:bg-white/10 transition-all"
                    >
                        <span className="text-moto-accent group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Command Center</span>
                    </button>

                    <div className="flex gap-4">
                        <button
                            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                            className={`flex items-center gap-3 px-8 py-3 backdrop-blur-2xl border rounded-full font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-2xl ${isEditing
                                ? 'bg-moto-accent text-black border-moto-accent shadow-moto-accent/20'
                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                }`}
                        >
                            {isEditing ? (loading ? 'SYNCING...' : 'SAVE CONFIG') : 'EDIT PROFILE'}
                            {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Identity Core Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-24 z-20">
                    <div className="relative mb-10">
                        {/* Radar Pulse Effect */}
                        <div className="absolute -inset-8 bg-moto-accent/20 rounded-full animate-ping opacity-20" />
                        <div className="absolute -inset-4 bg-moto-accent/10 rounded-full animate-pulse opacity-10" />

                        <div className="relative w-36 h-36 md:w-48 md:h-48 p-2 bg-[#050505] rounded-full ring-1 ring-white/10 shadow-[0_0_50px_rgba(242,166,25,0.15)]">
                            <UserAvatar name={user.name} size={180} className="w-full h-full rounded-full border-4 border-[#050505]" />
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center cursor-pointer backdrop-blur-sm border-2 border-dashed border-white/30 hover:border-moto-accent transition-all group">
                                    <Camera className="w-10 h-10 text-white opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center space-y-4 max-w-3xl px-4">
                        {isEditing ? (
                            <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500">
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="bg-white/5 border border-white/10 rounded-2xl px-10 py-5 text-3xl font-display font-black text-center text-white focus:border-moto-accent outline-none transition-all placeholder-white/10 shadow-2xl"
                                    placeholder="OPERATOR NAME"
                                />
                                <div className="flex gap-4">
                                    <div className="relative flex-1">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-moto-accent" />
                                        <input
                                            type="text"
                                            value={editForm.username}
                                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs font-mono text-white focus:border-moto-accent outline-none"
                                            placeholder="username"
                                        />
                                    </div>
                                    <div className="relative flex-1">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            value={editForm.location}
                                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs font-mono text-white focus:border-moto-accent outline-none"
                                            placeholder="location"
                                        />
                                    </div>
                                </div>
                                <textarea
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-gray-400 focus:border-moto-accent outline-none resize-none text-center font-mono leading-relaxed"
                                    placeholder="Enter biological system profile..."
                                />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter text-white uppercase italic text-stroke-white drop-shadow-2xl">
                                    {user.name}
                                </h1>
                                <div className="flex items-center justify-center gap-6 mt-4">
                                    <div className="flex items-center gap-2 group cursor-pointer">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] group-hover:text-white transition-colors">STATUS: ACTIVE</span>
                                    </div>
                                    <div className="w-[1px] h-4 bg-white/10" />
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-moto-accent" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">{user.location || 'GLOBAL'}</span>
                                    </div>
                                    <div className="w-[1px] h-4 bg-white/10" />
                                    <div className="flex items-center gap-2 bg-moto-accent/10 px-3 py-1 rounded-full border border-moto-accent/20">
                                        <Shield className="w-3 h-3 text-moto-accent" />
                                        <span className="text-[9px] font-black text-moto-accent uppercase tracking-widest">{user.rank || 'MEMBER'}</span>
                                    </div>
                                </div>
                                <p className="text-gray-400 max-w-xl mx-auto text-xs font-mono leading-loose mt-6 opacity-80 italic">
                                    "{user.bio || "No tactical profile initialized for this operator."}"
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Tactical Dashboard Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-20">

                    {/* Performance Gauges */}
                    <div className="lg:col-span-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 flex justify-between items-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-moto-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <StatGauge value={1204} max={2000} label="REP SCORE" color="#F2A619" icon={<Activity className="w-6 h-6" />} />
                        <div className="h-20 w-[1px] bg-white/10" />
                        <StatGauge value={user.followersCount || user.followers || 0} max={1000} label="FIREPOWER" color="#3B82F6" icon={<Shield className="w-6 h-6" />} />
                    </div>

                    {/* Progress & Achievements Banner */}
                    <div className="lg:col-span-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
                        <div className="flex flex-col md:flex-row gap-12 items-center h-full">
                            <div className="flex-1 space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-1">Rider Level</h3>
                                        <p className="text-3xl font-display font-black text-white italic">{user.rank || 'Commander'}</p>
                                    </div>
                                    <span className="text-2xl font-mono text-moto-accent font-bold">LVL. 42</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '75%' }}
                                        className="h-full bg-gradient-to-r from-moto-accent to-orange-600 rounded-full relative"
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    </motion.div>
                                </div>
                                <div className="flex justify-between text-[8px] font-mono text-gray-500 font-black tracking-widest uppercase">
                                    <span>2.4K / 3K EXP</span>
                                    <span className="text-moto-accent">Next Upgrade: Viraj Ustası</span>
                                </div>
                            </div>

                            {/* Mini Icons Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-crosshair">
                                        <Trophy className="w-6 h-6 text-moto-accent" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievement Showcase */}
                <div className="mb-24 px-4 overflow-hidden">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                        <h2 className="text-xs font-black text-gray-500 uppercase tracking-[1em]">Achievements / Badges</h2>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                        {ACHIEVEMENTS.map(ach => (
                            <AchievementBadge key={ach.id} achievement={ach} />
                        ))}
                    </div>
                </div>

                {/* Digital Garage Slider */}
                <div className="mb-24">
                    <div className="flex items-end justify-between mb-12 px-2">
                        <div>
                            <span className="text-[10px] font-black text-moto-accent uppercase tracking-[0.5em] mb-2 block">System Inventory</span>
                            <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase italic tracking-tighter">
                                Digital <span className="text-stroke-white opacity-50">Garage</span>
                            </h2>
                        </div>
                        <div className="hidden md:flex gap-4">
                            <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-moto-accent hover:text-black transition-all text-white">←</button>
                            <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-moto-accent hover:text-black transition-all text-white">→</button>
                        </div>
                    </div>

                    <div className="flex gap-8 overflow-x-auto pb-10 px-2 no-scrollbar snap-x">
                        <GarageCard isAdd onClick={() => notify.info('Yeni araç ekleme protokolü yakında aktif edilecek.')} />
                        {user.garage && user.garage.length > 0 ? (
                            user.garage.map((bike: any) => (
                                <GarageCard key={bike._id} bike={bike} />
                            ))
                        ) : (
                            <GarageCard bike={{ brand: 'MOTO', model: 'SYSTEM_ERROR', year: 'LOG', km: 0, image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=2070' }} />
                        )}
                    </div>
                </div>

                {/* Sub-Panels Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-1">
                            {[
                                { id: 'feed', label: 'Ride Log', icon: Grid },
                                { id: 'saved', label: 'Arsenal', icon: Bookmark },
                                { id: 'notifications', label: 'Signals', icon: Bell },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-moto-accent text-black shadow-lg shadow-moto-accent/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="bg-white/5 border border-white/10 rounded-[2rem] min-h-[500px] p-12 relative overflow-hidden"
                            >
                                {/* Digital Noise Overlay */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                                <div className="relative z-10">
                                    {activeTab === 'feed' && (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10 text-gray-700">
                                                <Grid className="w-10 h-10" />
                                            </div>
                                            <h3 className="text-2xl font-display font-black text-white mb-4 italic uppercase">No Signals Detected</h3>
                                            <p className="text-xs text-gray-500 font-mono max-w-sm uppercase tracking-widest">Transmit your first ride experience to populate the log.</p>
                                        </div>
                                    )}
                                    {activeTab === 'saved' && <div className="py-20 text-center text-gray-500 font-mono text-xs uppercase tracking-widest">Inventory scanner: 0 items detected.</div>}
                                    {activeTab === 'notifications' && (
                                        <div className="space-y-4">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex gap-6 p-6 bg-black/40 border border-white/5 rounded-2xl hover:border-moto-accent/30 transition-all cursor-pointer group">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                                        <Bell className="w-4 h-4 text-gray-600 group-hover:text-moto-accent transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-mono text-gray-400 group-hover:text-white transition-colors uppercase tracking-tight">System Notification: Route optimization data available.</p>
                                                        <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Received 12:45 UTC</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
