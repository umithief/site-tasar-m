// ... imports ...
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Home, MessageSquare, Calendar, User, Search, Map as MapIcon, Navigation, Plus, Image, Grid, Radio, Zap, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { PostCard } from './PostCard';
import { FollowButton } from './FollowButton';
import { DirectMessages } from './DirectMessages';
import { SocialPost, ViewState } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { MotoVlogMap } from '../MotoVlogMap';
import { RouteExplorer } from '../RouteExplorer';
import { MotoMeetup } from '../MotoMeetup';
import { socialService } from '../../services/socialService';
import { messageService } from '../../services/messageService';
import { usePosts, useCreatePost } from '../../hooks/usePosts';
import { MediaUploader } from '../ui/MediaUploader';
import { useAuthStore } from '../../store/authStore';

interface SocialHubProps {
    user: any;
    onNavigate?: (view: ViewState) => void;
    onLogout?: () => void;
    onUpdateUser?: (user: any) => void;
    initialData?: any;
}

type HubView = 'feed' | 'vlog' | 'routes' | 'events' | 'explore';

export const SocialHub: React.FC<SocialHubProps> = ({ user: propUser, onNavigate, initialData }) => {
    const { user: globalUser } = useAuthStore();
    const currentUser = globalUser || propUser;

    const [isDMOpen, setIsDMOpen] = useState(false);
    const [view, setView] = useState<HubView>('feed');
    const [newPostContent, setNewPostContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = usePosts();
    const { mutate: createPost } = useCreatePost();
    const [suggestedRiders, setSuggestedRiders] = useState<any[]>([]);
    const [activeThreads, setActiveThreads] = useState<any[]>([]);
    const [initialChatId, setInitialChatId] = useState<string | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchMiscData = async () => {
            const [riders, threads] = await Promise.all([
                socialService.getSuggestedRiders(),
                messageService.getThreads()
            ]);
            setSuggestedRiders(riders);
            setActiveThreads(threads);
        };
        fetchMiscData();
    }, []);

    useEffect(() => {
        if (initialData?.openChat) {
            setInitialChatId(initialData.openChat);
            setIsDMOpen(true);
        }
    }, [initialData]);

    const handleCreatePost = async () => {
        if ((!newPostContent.trim() && !mediaUrl) || !currentUser) return;
        createPost({
            userId: currentUser._id || 'guest',
            userName: currentUser.name || 'Guest',
            userAvatar: currentUser.avatar || '',
            content: newPostContent,
            images: mediaUrl ? [mediaUrl] : [],
            bikeModel: currentUser.garage && currentUser.garage.length > 0 ? `${currentUser.garage[0].brand} ${currentUser.garage[0].model}` : 'Bilinmeyen Motor',
            userRank: currentUser.rank || 'Yeni Üye'
        }, {
            onSuccess: () => {
                setNewPostContent('');
                setMediaUrl(null);
                setIsCreateOpen(false);
            }
        });
    };

    const navItems = [
        { id: 'feed', icon: Home, label: 'Akış' },
        { id: 'explore', icon: Compass, label: 'Keşfet' },
        { id: 'vlog', icon: MapIcon, label: 'Vlog Map' },
        { id: 'routes', icon: Navigation, label: 'Rotalar' },
        { id: 'events', icon: Calendar, label: 'Etkinlikler' },
    ];

    return (
        <div className="bg-[#09090b] min-h-screen text-white pt-24 pb-20 lg:pb-0 font-sans selection:bg-moto-accent/30">
            {/* Background Ambient */}
            <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />

            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-8 relative items-start">

                {/* --- LEFT NAVIGATION DOCK --- */}
                <div className="hidden lg:block sticky top-28 h-[calc(100vh-140px)]">
                    <div className="flex flex-col h-full bg-[#111] rounded-[2rem] border border-white/5 p-4 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                        {/* Profile Mini Header */}
                        <div
                            className="flex items-center gap-3 p-3 mb-6 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors group"
                            onClick={() => onNavigate && onNavigate('my-profile')}
                        >
                            <UserAvatar src={currentUser?.profileImage} name={currentUser?.name} size={48} className="ring-2 ring-black group-hover:ring-moto-accent transition-all" />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm truncate">{currentUser?.name}</h3>
                                <p className="text-[10px] text-gray-500 font-mono">@{currentUser?.username || 'rider'}</p>
                            </div>
                        </div>

                        {/* Nav Links */}
                        <nav className="flex-1 space-y-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setView(item.id as HubView)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group ${view === item.id
                                            ? 'bg-moto-accent text-black font-bold shadow-lg shadow-moto-accent/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" strokeWidth={view === item.id ? 2.5 : 2} />
                                    <span className="text-sm tracking-wide">{item.label}</span>
                                </button>
                            ))}
                            <button onClick={() => setIsDMOpen(true)} className="w-full flex items-center gap-4 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                                <MessageSquare className="w-5 h-5" />
                                <span className="text-sm tracking-wide">Mesajlar</span>
                                {activeThreads.some(t => t.unreadCount > 0) && <span className="w-2 h-2 bg-moto-accent rounded-full ml-auto" />}
                            </button>
                        </nav>

                        {/* Create Button */}
                        <button
                            onClick={() => setIsCreateOpen(!isCreateOpen)}
                            className="mt-6 w-full py-4 bg-gradient-to-r from-moto-accent to-yellow-400 text-black font-black rounded-xl shadow-lg hover:shadow-moto-accent/30 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>GÖNDERİ OLUŞTUR</span>
                        </button>
                    </div>
                </div>

                {/* --- MAIN FEED STREAM --- */}
                <div className="min-h-screen">
                    {/* View Switcher */}
                    {view === 'feed' ? (
                        <>
                            {/* Stories Rail */}
                            <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
                                <div className="flex gap-4">
                                    {/* Add Story */}
                                    <div className="flex-shrink-0 w-24 h-40 bg-[#111] rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-moto-accent/50 transition-colors group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-0" />
                                        <UserAvatar src={currentUser?.profileImage} name={currentUser?.name} size={40} className="z-10 border-2 border-black" />
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-moto-accent rounded-full p-1"><Plus className="w-3 h-3 text-black" /></div>
                                    </div>
                                    {/* Mock Stories */}
                                    {['story1.jpg', 'story2.jpg', 'story3.jpg', 'story4.jpg'].map((_, i) => (
                                        <div key={i} className="flex-shrink-0 w-24 h-40 rounded-2xl bg-gray-800 relative overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-moto-accent transition-all">
                                            <img src={`https://source.unsplash.com/random/200x400?motorcycle&sig=${i}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/80" />
                                            <div className="absolute bottom-2 left-2 text-[10px] font-bold truncate max-w-[90%]">Rider {i + 1}</div>
                                            <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-moto-accent p-0.5"><img src={`https://source.unsplash.com/random/50x50?face&sig=${i}`} className="w-full h-full rounded-full object-cover" /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Create Post Area (Collapsible) */}
                            <AnimatePresence>
                                {isCreateOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mb-8"
                                    >
                                        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                                            <div className="flex gap-4">
                                                <UserAvatar src={currentUser?.profileImage} name={currentUser?.name} size={48} />
                                                <div className="flex-1">
                                                    <textarea
                                                        value={newPostContent}
                                                        onChange={(e) => setNewPostContent(e.target.value)}
                                                        className="w-full bg-transparent text-xl font-light placeholder-gray-600 outline-none resize-none min-h-[100px]"
                                                        placeholder="Sürüş nasıl geçti?"
                                                    />
                                                    {mediaUrl && (
                                                        <div className="relative mt-4 w-full h-64 rounded-xl overflow-hidden group">
                                                            <img src={mediaUrl} className="w-full h-full object-cover" />
                                                            <button onClick={() => setMediaUrl(null)} className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white hover:bg-black transition-colors"><Plus className="rotate-45" /></button>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                                                        <div className="flex gap-4 text-moto-accent">
                                                            <MediaUploader onUploadComplete={setMediaUrl} onUploadError={(e) => alert(e)} />
                                                            <MapIcon className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                                                        </div>
                                                        <button
                                                            onClick={handleCreatePost}
                                                            disabled={!newPostContent && !mediaUrl}
                                                            className="bg-white text-black px-8 py-2.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                                        >
                                                            PAYLAŞ
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Feed Stream */}
                            <div className="space-y-12">
                                {data?.pages.map((page, i) => (
                                    <React.Fragment key={i}>
                                        {page?.map((post: SocialPost) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 50 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, margin: "-10%" }}
                                                className="group"
                                            >
                                                {/* Re-using PostCard component but wrapping it slightly differently if needed for new style, 
                                                    or we can trust PostCard's internal style. 
                                                    For this radical redesign, let's assume PostCard is flexible enough, 
                                                    or we style a wrapper around it. */}
                                                <div className="relative">
                                                    <div className="absolute -left-4 top-0 bottom-0 w-[1px] bg-white/5 group-hover:bg-white/10 transition-colors hidden xl:block" />
                                                    <PostCard post={post} currentUserId={currentUser?._id} />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </React.Fragment>
                                ))}
                                {isFetchingNextPage && <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-moto-accent border-t-transparent rounded-full animate-spin" /></div>}
                                {hasNextPage && (
                                    <div className="flex justify-center pt-8">
                                        <button onClick={() => fetchNextPage()} className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Daha Fazla Yükle</button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* WIDE VIEW AREA (Map/Routes/Events) */
                        <div className="h-[calc(100vh-140px)] sticky top-28 bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                            {view === 'vlog' && <MotoVlogMap user={currentUser} isEmbedded />}
                            {view === 'routes' && <RouteExplorer user={currentUser} isEmbedded />}
                            {view === 'events' && <MotoMeetup user={currentUser} isEmbedded />}
                        </div>
                    )}
                </div>

                {/* --- RIGHT SIDEBAR (Context) --- */}
                <div className="hidden lg:block sticky top-28 h-fit space-y-8">

                    {/* Search Field */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-moto-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Sürücü, rota veya etkinlik ara..."
                            className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-moto-accent/50 transition-colors shadow-lg"
                        />
                    </div>

                    {/* Active Squads (Chats) */}
                    <div className="bg-[#111] rounded-3xl p-6 border border-white/5 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white tracking-wide text-sm">AKTİF SOHBETLER</h3>
                            <span className="bg-green-500/20 text-green-500 text-[10px] px-2 py-1 rounded-full font-bold">{activeThreads.length}</span>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {activeThreads.map(thread => (
                                <div key={thread.id} onClick={() => { setInitialChatId(thread.userId); setIsDMOpen(true); }} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
                                    <div className="relative">
                                        <UserAvatar src={thread.userAvatar} name={thread.userName} size={40} />
                                        {thread.unreadCount > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-moto-accent rounded-full border-2 border-[#111]" />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-200">{thread.userName}</div>
                                        <div className="text-[10px] text-gray-500 truncate max-w-[120px]">{thread.lastMessage || 'Fotoğraf gönderdi'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trending Riders */}
                    <div className="bg-[#111] rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />
                        <h3 className="font-bold text-white tracking-wide text-sm mb-6 relative z-10">ÖNERİLEN SÜRÜCÜLER</h3>
                        <div className="space-y-5 relative z-10">
                            {suggestedRiders.slice(0, 4).map(rider => (
                                <div key={rider._id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate && onNavigate('public-profile', { _id: rider._id })}>
                                        <UserAvatar src={rider.avatar} name={rider.name} size={36} />
                                        <div>
                                            <div className="font-bold text-xs text-white">{rider.name}</div>
                                            <div className="text-[10px] text-gray-400">{rider.bike || 'Rider'}</div>
                                        </div>
                                    </div>
                                    <FollowButton targetUserId={rider._id} className="!w-6 !h-6 !p-0 rounded-full !min-w-0" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-gray-600 px-2 justify-center">
                        <a href="#" className="hover:text-gray-400">Gizlilik</a>
                        <a href="#" className="hover:text-gray-400">Kurallar</a>
                        <a href="#" className="hover:text-gray-400">Reklam</a>
                        <a href="#" className="hover:text-gray-400">MotoVibe © 2025</a>
                    </div>
                </div>

            </div>

            {/* Direct Messages Overlay */}
            <DirectMessages isOpen={isDMOpen} onClose={() => { setIsDMOpen(false); setInitialChatId(null); }} initialChatUserId={initialChatId || undefined} />
        </div>
    );
};
