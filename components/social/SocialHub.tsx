import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Home, MessageSquare, Calendar, User, Search, Bell, PlusCircle, Grid, Users } from 'lucide-react';
import { PostCard } from './PostCard';
import { UserProfile } from './UserProfile'; // Can be used when user clicks profile
import { DirectMessages } from './DirectMessages';
import { SocialPost, SocialProfile, ForumComment } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';

import { ViewState } from '../../types';

interface SocialHubProps {
    user: any;
    onNavigate?: (view: ViewState) => void;
    onLogout?: () => void;
    onUpdateUser?: (user: any) => void;
}

import { socialService } from '../../services/socialService';

// ... (in component)
const [posts, setPosts] = useState<SocialPost[]>([]);
const [newPostContent, setNewPostContent] = useState('');

useEffect(() => {
    loadFeed();
}, []);

const loadFeed = async () => {
    const feed = await socialService.getFeed();
    setPosts(feed);
};

const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return;

    try {
        const newPost = await socialService.createPost({
            userId: user._id || 'guest',
            userName: user.name || 'Guest',
            userAvatar: user.avatar || '',
            // content: newPostContent, // Need to bind this to input
            content: newPostContent,
            images: [], // Add image upload later
            bikeModel: user.garage?.[0]?.model || 'Rider',
            userRank: user.rank || 'Rider'
        });
        if (newPost) {
            setPosts([newPost, ...posts]);
            setNewPostContent('');
        }
    } catch (error) {
        console.error('Create post failed');
    }
};

// ...
// Update input: value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)}
// Update map: posts.map
// Pass currentUserId to PostCard: <PostCard key={post._id} post={post} currentUserId={user?._id} />

const SUGGESTED_RIDERS = [
    { id: 1, name: 'Marc M.', bike: 'Honda CBR1000RR' },
    { id: 2, name: 'Valentina', bike: 'Kawasaki Ninja ZX-10R' },
    { id: 3, name: 'Kenan S.', bike: 'Kawasaki H2R' },
];

export const SocialHub: React.FC<SocialHubProps> = ({ user, onNavigate, onLogout, onUpdateUser }) => {
    const [isDMOpen, setIsDMOpen] = useState(false);
    const [view, setView] = useState<'feed' | 'profile'>('feed');

    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [newPostContent, setNewPostContent] = useState('');

    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async () => {
        const feed = await socialService.getFeed();
        if (feed && feed.length > 0) {
            setPosts(feed);
        } else {
            // Fallback to empty or initial state if preferred, but for now empty
            setPosts([]);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() || !user) return;

        try {
            const newPost = await socialService.createPost({
                userId: user._id || 'guest',
                userName: user.name || 'Guest',
                userAvatar: user.avatar || '',
                content: newPostContent,
                images: [],
                bikeModel: user.garage && user.garage.length > 0 ? `${user.garage[0].brand} ${user.garage[0].model}` : 'Bilinmeyen Motor',
                userRank: user.rank || 'Yeni Üye'
            });

            if (newPost) {
                setPosts([newPost, ...posts]);
                setNewPostContent('');
            }
        } catch (error) {
            console.error('Create post failed');
        }
    };

    return (
        <div className="bg-[#050505] min-h-screen text-white pt-20">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-80px)]">

                {/* LEFT SIDEBAR (Navigation) */}
                <div className="hidden lg:col-span-3 lg:flex flex-col gap-2 py-6 sticky top-20 h-full">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-4">
                        <div className="flex items-center gap-4 mb-6">
                            <UserAvatar name={user?.name || 'Guest'} size={56} className="border-2 border-moto-accent cursor-pointer" onClick={() => setView('profile')} />
                            <div>
                                <h3 className="font-bold text-lg leading-tight cursor-pointer hover:text-moto-accent transition-colors" onClick={() => setView('profile')}>{user?.name || 'Guest User'}</h3>
                                <p className="text-xs text-gray-500 font-mono">{user?.rank || 'Rider'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="bg-white/5 rounded-lg p-2">
                                <span className="block font-bold text-white text-sm">{user?.followers || 0}</span>
                                <span className="text-gray-500">Followers</span>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                                <span className="block font-bold text-white text-sm">{user?.following || 0}</span>
                                <span className="text-gray-500">Following</span>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                                <span className="block font-bold text-white text-sm">{user?.garage?.length || 0}</span>
                                <span className="text-gray-500">Rides</span>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'feed', icon: Home, label: 'Feed', action: () => setView('feed') },
                            { id: 'discover', icon: Compass, label: 'Discover', action: () => onNavigate && onNavigate('riders') },
                            { id: 'garage', icon: Grid, label: 'My Garage', action: () => setView('profile') },
                            { id: 'events', icon: Calendar, label: 'Club Events', action: () => onNavigate && onNavigate('meetup') },
                            { id: 'messages', icon: MessageSquare, label: 'Messages', action: () => setIsDMOpen(true), badge: 2 },
                        ].map((item: any) => (
                            <button
                                key={item.id}
                                onClick={item.action ? item.action : () => setView(item.id === 'garage' ? 'profile' : 'feed')}
                                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group ${view === 'feed' && item.id === 'feed' ? 'bg-moto-accent text-black font-bold' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* CENTER (Feed) */}
                <div className="lg:col-span-6 h-full overflow-y-auto no-scrollbar py-6">
                    {view === 'profile' ? (
                        <UserProfile user={user} onNavigate={onNavigate} onLogout={onLogout} onUpdateUser={onUpdateUser} />
                    ) : (
                        <>
                            {/* Create Post Widget */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 mb-8 flex gap-4 items-center">
                                <UserAvatar name={user?.name || 'G'} size={40} />
                                <div className="flex-1 bg-white/5 rounded-2xl h-12 flex items-center px-4 cursor-text hover:bg-white/10 transition-colors focus-within:ring-1 ring-moto-accent">
                                    <input
                                        type="text"
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreatePost()}
                                        className="bg-transparent w-full text-white placeholder-gray-500 text-sm outline-none"
                                        placeholder="Share your ride experience..."
                                    />
                                </div>
                                <button onClick={handleCreatePost} className="bg-moto-accent text-black p-3 rounded-xl hover:bg-white transition-colors">
                                    <PlusCircle className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Posts */}
                            <div className="space-y-6">
                                {posts.map(post => (
                                    <PostCard key={post._id} post={post} currentUserId={user?._id} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* RIGHT SIDEBAR (Social Intelligence) */}
                <div className="hidden lg:col-span-3 lg:flex flex-col gap-6 py-6 sticky top-20 h-fit">

                    {/* Active Conversations (Mini Chat Heads) */}
                    <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md border border-white/10 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white text-sm">ACTIVE CHATS</h3>
                            <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded uppercase font-bold">3 Online</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="relative cursor-pointer group flex-shrink-0" onClick={() => setIsDMOpen(true)}>
                                    <UserAvatar name={`User ${i}`} size={48} className="border-2 border-transparent group-hover:border-moto-accent transition-colors" />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050505]" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Suggested Riders */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-white text-sm uppercase">Suggested Riders</h3>
                            <button className="text-xs text-moto-accent hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                            {SUGGESTED_RIDERS.map(rider => (
                                <div key={rider.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar name={rider.name} size={40} />
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{rider.name}</h4>
                                            <p className="text-[10px] text-gray-500 font-mono">{rider.bike}</p>
                                        </div>
                                    </div>
                                    <button className="text-xs bg-white/10 hover:bg-moto-accent hover:text-black text-white px-3 py-1.5 rounded-lg font-bold transition-all">
                                        Follow
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Premium Ad / Event */}
                    <div className="relative overflow-hidden rounded-3xl aspect-[4/5] group cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1558981806-ec527fa84d3d?q=80&w=800" alt="Event" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6">
                            <span className="text-moto-accent text-xs font-black uppercase tracking-widest mb-2">UPCOMING EVENT</span>
                            <h3 className="text-2xl font-display font-black text-white leading-none mb-2">NIGHT RIDE<br />ISTANBUL</h3>
                            <p className="text-gray-300 text-xs mb-4">Join 500+ riders for the biggest night ride of the year.</p>
                            <button className="w-full bg-white text-black font-bold py-3 rounded-xl uppercase hover:bg-moto-accent transition-colors">RSVP NOW</button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Direct Messages Overlay */}
            <DirectMessages isOpen={isDMOpen} onClose={() => setIsDMOpen(false)} />
        </div>
    );
};
