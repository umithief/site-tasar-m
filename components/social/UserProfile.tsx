import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Grid, Bike, FolderHeart, Settings, MapPin, Gauge, Trophy } from 'lucide-react';
import { SocialProfile } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';

interface UserProfileProps {
    profile: SocialProfile;
}

export const UserProfile: React.FC<UserProfileProps> = ({ profile }) => {
    const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'tagged'>('posts');

    return (
        <div className="bg-[#050505] min-h-screen text-white pt-24 pb-12">

            {/* Cover Section */}
            <div className="relative h-64 md:h-80 w-full mb-16">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505] z-10" />
                <img
                    src={profile.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover opacity-80"
                />

                {/* Profile Stats Card - Floating */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-20 w-[90%] md:w-[600px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex items-center justify-between">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-display font-black text-white">{profile.points}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Points</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-display font-black text-white">{profile.followersCount || 0}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Followers</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-display font-black text-white">{profile.followingCount || 0}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Following</span>
                    </div>

                    {/* Floating Avatar */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 p-2 bg-[#050505] rounded-full">
                        <UserAvatar name={profile.name} size={96} className="border-4 border-moto-accent" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12 flex flex-col items-center text-center">
                <h1 className="text-3xl font-display font-black uppercase flex items-center gap-3">
                    {profile.name}
                    {profile.rank && <span className="bg-moto-accent text-black text-xs px-2 py-1 rounded font-bold">{profile.rank}</span>}
                </h1>
                <p className="text-gray-400 max-w-lg mt-2 font-mono text-sm">{profile.bio || "Rider. Explorer. Adrenaline Junkie."}</p>

                <div className="flex gap-4 mt-6">
                    <button className="bg-white text-black px-8 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-gray-200 transition-colors">Follow</button>
                    <button className="bg-white/10 text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-colors">Message</button>
                </div>
            </div>

            {/* The Garage (Horizontal Scroll) */}
            <div className="mb-16">
                <div className="max-w-7xl mx-auto px-4 mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-display font-bold flex items-center gap-2">
                        <Bike className="w-5 h-5 text-moto-accent" /> THE GARAGE
                    </h2>
                    <span className="text-xs text-gray-500 font-mono hidden md:block">{profile.garage?.length || 0} BIKES IN COLLECTION</span>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-8 px-4 md:px-8 no-scrollbar snap-x snap-mandatory max-w-7xl mx-auto">
                    {/* Add Button */}
                    <motion.div
                        className="min-w-[280px] h-[350px] bg-white/5 border border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center text-gray-500 hover:bg-white/10 hover:text-white transition-colors cursor-pointer snap-center"
                        whileHover={{ scale: 0.98 }}
                    >
                        <Settings className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-widest">Add Machine</span>
                    </motion.div>

                    {(profile.garage || []).map((bike) => (
                        <motion.div
                            key={bike._id}
                            className="min-w-[280px] md:min-w-[320px] h-[350px] bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl overflow-hidden relative group snap-center shadow-lg"
                            whileHover={{ y: -10 }}
                        >
                            <img src={bike.image} alt={bike.model} className="w-full h-3/5 object-cover" />
                            <div className="p-6">
                                <h3 className="text-lg font-bold font-display uppercase leading-tight mb-1">{bike.brand}</h3>
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
                <div className="flex justify-center mb-8 bg-white/5 p-1 rounded-full w-fit mx-auto border border-white/10">
                    {[
                        { id: 'posts', icon: Grid, label: 'POSTS' },
                        { id: 'media', icon: FolderHeart, label: 'MEDIA' },
                        { id: 'tagged', icon: User, label: 'TAGGED' }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all ${isActive ? 'bg-moto-accent text-black shadow-lg shadow-moto-accent/20' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Icon className="w-3 h-3" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-3 gap-1 md:gap-4">
                    {/* Mock Grid Content */}
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square bg-gray-800 rounded-xl overflow-hidden relative group cursor-pointer border border-white/5">
                            <img src={`https://source.unsplash.com/random/400x400?motorcycle&sig=${i}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                                <span className="flex items-center gap-1"><Trophy className="w-4 h-4" /> 12K</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};
