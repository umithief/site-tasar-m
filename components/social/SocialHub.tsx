import React, { useState, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Home, MessageSquare, Calendar, User, Search, Map as MapIcon, Navigation, Plus, Image, Grid, Users, Bell, ShoppingBag, Settings, LogOut, PlusCircle, Archive, Heart, MessageCircle, Sun, Moon, Gauge } from 'lucide-react';
import { ResponsivePostCard } from './ResponsivePostCard';
import { PostComposer } from './PostComposer';
import { FollowButton } from './FollowButton';
import { DirectMessages } from './DirectMessages';
import { SocialPost, ViewState } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { Button } from '../ui/Button';
import { CommentSheet } from './CommentSheet';
import { PullToRefresh } from '../mobile/PullToRefresh';
import { MotoVlogMap } from '../MotoVlogMap';
import { RouteExplorer } from '../RouteExplorer';
import { MotoMeetup } from '../MotoMeetup';
import { rideService } from '../../services/rideService';
import { RideCard } from '../ride/RideCard'; // Import RideCard
import { socialService } from '../../services/socialService';
import { messageService } from '../../services/messageService';
import { usePosts, useCreatePost } from '../../hooks/usePosts';
import { MediaUploader } from '../ui/MediaUploader';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { StoryBar } from './StoryBar';
import { StoryViewerOverlay } from './StoryViewerOverlay';
import { storyService, StoryGroup } from '../../services/storyService';


interface SocialHubProps {
    user: any;
    onNavigate?: (view: ViewState, data?: any) => void;
    onLogout?: () => void;
    onUpdateUser?: (user: any) => void;
    initialData?: any;
    cartCount?: number;
    onCartClick?: () => void;
}

type HubView = 'feed' | 'stories' | 'vlog' | 'routes' | 'events' | 'explore' | 'rides';

export const SocialHub: React.FC<SocialHubProps> = ({ user: propUser, onNavigate, initialData, cartCount = 0, onCartClick }) => {
    const { user: globalUser, logout } = useAuthStore();
    const currentUser = globalUser || propUser;

    const [isDMOpen, setIsDMOpen] = useState(false);
    const [view, setView] = useState<HubView>('feed');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = usePosts();
    const { mutate: createPost } = useCreatePost();
    const [suggestedRiders, setSuggestedRiders] = useState<any[]>([]);
    const [activeThreads, setActiveThreads] = useState<any[]>([]);
    const [initialChatId, setInitialChatId] = useState<string | null>(null);

    // Comment Sheet State
    const [activePostId, setActivePostId] = useState<string | null>(null);
    const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ users?: any[], rides?: any[], routes?: any[] }>({});
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Stories State
    const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
    const [selectedStoryGroup, setSelectedStoryGroup] = useState<StoryGroup | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadStories = async () => {
        try {
            const groups = await storyService.getStories();
            setStoryGroups(groups);
        } catch (error) {
            console.error('Failed to load stories', error);
        }
    };

    useEffect(() => {
        loadStories();
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                await storyService.createStory(e.target.files[0]);
                loadStories(); // Refresh
            } catch (error) {
                console.error('Failed to upload story', error);
            }
        }
    };

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                const results = await socialService.search(searchQuery);
                setSearchResults(results);
                setIsSearching(false);
                setShowSearchResults(true);
            } else {
                setSearchResults({});
                setShowSearchResults(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const [activeRides, setActiveRides] = useState<any[]>([]);

    // Initial Data Fetch
    useEffect(() => {
        const fetchMiscData = async () => {
            const [riders, threads, rides] = await Promise.all([
                socialService.getSuggestedRiders(),
                messageService.getThreads(),
                rideService.getRides().catch(() => []) // Fetch rides, handle error silently
            ]);
            setSuggestedRiders(riders);
            setActiveThreads(threads);
            setActiveRides(rides);
        };

        fetchMiscData();


        // Listen for new rides
        const handleRideCreated = () => {
            console.log("Refreshing rides...");
            rideService.getRides().then(setActiveRides).catch(console.error);
        };
        window.addEventListener('ride-created', handleRideCreated);

        return () => {
            window.removeEventListener('ride-created', handleRideCreated);
        };
    }, []);

    useEffect(() => {
        if (initialData?.openChat) {
            setInitialChatId(initialData.openChat);
            setIsDMOpen(true);
        }
    }, [initialData]);

    const handlePostCreate = async (content: string, media: string | null, stats?: any, location?: string) => {
        if (!currentUser) return;

        await new Promise<void>((resolve, reject) => {
            createPost({
                userId: currentUser._id || 'guest',
                userName: currentUser.name || 'Guest',
                userAvatar: currentUser.avatar || '',
                content: content,
                images: media ? [media] : [],
                bikeModel: currentUser.garage && currentUser.garage.length > 0 ? `${currentUser.garage[0].brand} ${currentUser.garage[0].model}` : 'Bilinmeyen Motor',
                userRank: currentUser.rank || 'Yeni Üye',
                rideStats: stats,
                location: location
            }, {
                onSuccess: () => {
                    resolve();
                    setIsCreateOpen(false);
                },
                onError: (err) => reject(err)
            });
        });
    };


    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notifications = useNotificationStore((state) => state.notifications);


    return (
        <div className="bg-transparent min-h-screen text-white pt-0 pb-0 font-sans selection:bg-moto-accent/30 relative transition-colors duration-300">
            {/* Hidden File Input for Stories */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileSelect}
            />

            {/* Story Viewer Overlay */}
            <AnimatePresence>
                {selectedStoryGroup && (
                    <StoryViewerOverlay
                        initialGroup={selectedStoryGroup}
                        allGroups={storyGroups}
                        onClose={() => setSelectedStoryGroup(null)}
                        onGroupChange={(groupId) => {
                            // Logic handled inside viewer for next/prev, but if we need to sync parent state:
                            const group = storyGroups.find(g => g.user._id === groupId);
                            if (group) setSelectedStoryGroup(group);
                        }}
                    />
                )}
            </AnimatePresence>
            {/* Background Ambient */}

            {/* <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none dark:block hidden" /> */}

            <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0 relative items-start">

                {/* --- MAIN FEED STREAM --- */}
                <div className="min-h-screen bg-transparent transition-colors duration-300">
                    {/* Top Navigation Tabs */}
                    <div className="sticky top-[70px] z-40 bg-transparent px-4 py-2 flex items-center justify-center pointer-events-none">
                        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pointer-events-auto bg-black/40 backdrop-blur-md rounded-full px-6 py-2 border border-white/5 shadow-2xl">
                            {[
                                { id: 'feed', label: 'AKIŞ' },
                                { id: 'vlog', label: 'MAP (CANLI)' },
                                { id: 'rides', label: 'SÜRÜŞLER' },
                                { id: 'routes', label: 'ROTALAR' },
                            ].map((item: any) => (
                                <button
                                    key={item.id}
                                    onClick={() => setView(item.id as HubView)}
                                    className={`relative text-sm font-bold tracking-wider transition-all whitespace-nowrap py-1
                                    ${view === item.id
                                            ? 'text-[#E2FF3B] drop-shadow-[0_0_8px_rgba(226,255,59,0.5)]'
                                            : 'text-white/40 hover:text-white'}`}
                                >
                                    <span>{item.label}</span>
                                    {view === item.id && (
                                        <motion.div
                                            layoutId="activeTabUnderline"
                                            className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#E2FF3B] shadow-[0_0_8px_#E2FF3B]"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>


                        {/* Right Actions (Desktop Only) */}
                        <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-white/10 ml-4 pointer-events-auto">
                            {/* Theme Toggle */}


                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                    className={`relative p-2 rounded-full transition-all border ${isNotificationOpen ? 'bg-white text-black border-white' : 'bg-[#18181b] text-zinc-400 border-white/5 hover:text-white'}`}
                                >
                                    <Bell className={`w-5 h-5 ${isNotificationOpen ? 'fill-current' : ''}`} />
                                    {useNotificationStore.getState().unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-[#09090b]" />
                                    )}
                                </button>

                                <button
                                    onClick={() => setIsCreateOpen(!isCreateOpen)}
                                    className={`relative p-2 rounded-full transition-all border ml-2 ${isCreateOpen ? 'bg-moto-accent text-black border-moto-accent' : 'bg-[#18181b] text-zinc-400 border-white/5 hover:text-white'}`}
                                >
                                    <PlusCircle className="w-5 h-5" />
                                </button>

                                {/* Notification Dropdown */}
                                <AnimatePresence>
                                    {isNotificationOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-2 w-80 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60]"
                                        >
                                            <div className="p-3 border-b border-white/5 flex justify-between items-center">
                                                <h4 className="font-bold text-sm">Bildirimler</h4>
                                                <span className="text-[10px] text-zinc-500 cursor-pointer hover:text-white">Tümünü Okundu İşaretle</span>
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                                {notifications.length > 0 ? (
                                                    notifications.map((notif: any) => (
                                                        <div key={notif.id} className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!notif.read ? 'bg-white/5' : ''}`}>
                                                            <div className="flex gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                                                    <Bell className="w-4 h-4 text-moto-accent" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-zinc-300 leading-snug">{notif.message}</p>
                                                                    <span className="text-[10px] text-zinc-500 mt-1 block">{notif.time || 'Az önce'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center text-zinc-500 text-xs">
                                                        Bildiriminiz yok.
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Profile Menu */}
                            <div className="relative z-50">
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="bg-zinc-800/50 text-white p-0.5 rounded-full hover:bg-zinc-700/50 transition-all border border-white/5 ring-2 ring-transparent focus:ring-moto-accent/50"
                                >
                                    <UserAvatar src={currentUser?.profileImage || currentUser?.avatar} name={currentUser?.name} size={32} />
                                </button>

                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="absolute top-full right-0 mt-4 w-72 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] ring-1 ring-white/5"
                                        >
                                            {/* Header */}
                                            <div className="relative p-6 pt-8 pb-6 border-b border-white/5 overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-br from-moto-accent/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                                                <div className="relative z-10 flex items-center gap-4">
                                                    <div className="ring-2 ring-white/10 rounded-full p-0.5 bg-black">
                                                        <UserAvatar src={currentUser?.profileImage || currentUser?.avatar} name={currentUser?.name} size={48} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-white font-bold text-base truncate">{currentUser?.name || "Misafir"}</h4>
                                                        <p className="text-zinc-500 text-xs font-mono truncate">@{currentUser?.username || "guest"}</p>
                                                        {currentUser?.rank && (
                                                            <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-white/5">
                                                                {currentUser.rank}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="p-2 space-y-0.5">
                                                <button
                                                    onClick={() => { onNavigate && onNavigate('my-profile'); setIsProfileMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 hover:text-white flex items-center gap-3 rounded-xl transition-all group"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-zinc-800/50 text-zinc-400 group-hover:bg-moto-accent group-hover:text-black transition-colors">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    Profil Görüntüle
                                                </button>

                                                <button
                                                    onClick={() => { onNavigate && onNavigate('garage' as any); setIsProfileMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 hover:text-white flex items-center gap-3 rounded-xl transition-all group"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-zinc-800/50 text-zinc-400 group-hover:bg-moto-accent group-hover:text-black transition-colors">
                                                        <Archive className="w-4 h-4" />
                                                    </div>
                                                    Garajım
                                                </button>

                                                <button
                                                    onClick={() => { onNavigate && onNavigate('settings' as any); setIsProfileMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 hover:text-white flex items-center gap-3 rounded-xl transition-all group"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-zinc-800/50 text-zinc-400 group-hover:bg-moto-accent group-hover:text-black transition-colors">
                                                        <Settings className="w-4 h-4" />
                                                    </div>
                                                    Ayarlar
                                                </button>
                                            </div>

                                            <div className="h-px bg-white/5 mx-4 my-1" />

                                            {/* Logout Section */}
                                            <div className="p-2">
                                                <button
                                                    onClick={() => {
                                                        setIsProfileMenuOpen(false);
                                                        if (logout) {
                                                            logout();
                                                            // Force close interactions
                                                            setTimeout(() => {
                                                                if (onNavigate) onNavigate('auth' as any); // Explicitly go to auth
                                                                else window.location.reload(); // Fallback hard reload
                                                            }, 100);
                                                        }
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 hover:text-red-400 flex items-center gap-3 rounded-xl transition-all"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Oturumu Kapat
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                    {/* View Switcher */}

                    {view === 'feed' ? (
                        <>
                            {/* Stories Bar (Instagram Style) */}
                            <div className="mb-0 mx-0">
                                <StoryBar
                                    storyGroups={storyGroups}
                                    onStorySelect={setSelectedStoryGroup}
                                    onAddStory={() => fileInputRef.current?.click()}
                                />
                            </div>

                            {/* Community CTA (if not logged in) */}
                            {!currentUser && (
                                <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl mb-8">
                                    <div className="max-w-md space-y-2 mb-6">
                                        <h2 className="text-3xl font-display font-bold text-white">Topluluğa Katıl</h2>
                                        <p className="text-gray-400">Diğer sürücüleri takip etmek, gönderi paylaşmak ve etkinliklere katılmak için giriş yap.</p>
                                    </div>
                                    <Button
                                        onClick={() => onNavigate && onNavigate('auth')}
                                        variant="primary"
                                        className="px-8 py-4 rounded-xl font-bold hover:bg-white transition-all transform hover:scale-105 shadow-xl shadow-moto-accent/20"
                                    >
                                        Giriş Yap / Kayıt Ol
                                    </Button>
                                </div>
                            )}

                            {/* Create Post Area */}
                            <AnimatePresence>
                                {isCreateOpen && (
                                    <PostComposer currentUser={currentUser} onPostCreate={handlePostCreate} />
                                )}
                            </AnimatePresence>

                            {/* Feed Stream */}
                            <PullToRefresh onRefresh={async () => { await fetchNextPage(); }} isMobile={true}>
                                <div className="space-y-6 pt-0 h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pb-32">
                                    {/* Empty State */}
                                    {!isFetchingNextPage && data?.pages?.[0]?.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                                            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                                                <Users className="w-10 h-10 text-moto-accent" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Akışın Sessiz Duruyor</h3>
                                            <p className="text-gray-400 mb-8 max-w-xs mx-auto">Daha fazla sürücü takip ederek akışını hareketlendir.</p>
                                            <Button
                                                variant="primary"
                                                className="shadow-[0_0_20px_rgba(255,87,34,0.3)] animate-pulse"
                                                onClick={() => {
                                                    // Functionality to open "Suggested Riders" or navigate to search
                                                    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                                                    if (searchInput) {
                                                        searchInput.focus();
                                                        setSearchQuery(' '); // Trigger search suggestions logic if needed
                                                    }
                                                }}
                                            >
                                                Sürücüleri Keşfet
                                            </Button>
                                        </div>
                                    )}

                                    {data?.pages.map((page, i) => (
                                        <React.Fragment key={i}>
                                            {page?.map((post: SocialPost) => (
                                                <motion.div
                                                    key={post._id}
                                                    initial={{ opacity: 0, y: 50 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true, margin: "-10%" }}
                                                    className="group"
                                                >
                                                    <div className="relative">
                                                        {/* <div className="absolute -left-4 top-0 bottom-0 w-[1px] bg-white/5 group-hover:bg-white/10 transition-colors hidden xl:block" /> */}
                                                        <ResponsivePostCard
                                                            post={post}
                                                            currentUserId={currentUser?._id}
                                                            onNavigate={onNavigate}
                                                            onCommentClick={() => {
                                                                setActivePostId(post._id);
                                                                setIsCommentSheetOpen(true);
                                                            }}
                                                        />
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
                            </PullToRefresh>
                        </>
                    ) : (
                        /* WIDE VIEW AREA (Map/Routes/Events) */
                        <div className="h-[calc(100vh-140px)] sticky top-28 bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                            {view === 'vlog' && <MotoVlogMap user={currentUser} isEmbedded onNavigate={() => { }} onAddToCart={() => { }} onProductClick={() => { }} />}
                            {view === 'routes' && <RouteExplorer user={currentUser} isEmbedded />}
                            {view === 'events' && <MotoMeetup user={currentUser} isEmbedded />}

                            {view === 'rides' && (
                                <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">Active Group Rides</h2>
                                    {activeRides.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {activeRides.map(ride => (
                                                <RideCard key={ride.id} ride={ride} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-20">
                                            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p className="text-xl font-bold">No Active Rides</p>
                                            <p className="text-sm">Be the first to create one!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div >

                {/* --- RIGHT SIDEBAR (Context) --- */}
                <div className="hidden lg:block sticky top-0 h-screen overflow-y-auto custom-scrollbar p-6 space-y-8 bg-[#09090b] transition-colors duration-300">

                    {/* Search Field */}
                    <div className="relative group z-50">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-moto-accent transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                            placeholder="Sürücü, rota veya etkinlik ara..."
                            className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-moto-accent/50 transition-colors shadow-lg"
                        />

                        {/* Search Dropdown */}
                        <AnimatePresence>
                            {showSearchResults && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-[#18181b] border border-white/10 rounded-2xl shadow-xl overflow-hidden max-h-[500px] overflow-y-auto custom-scrollbar"
                                >
                                    {isSearching ? (
                                        <div className="p-4 text-center text-gray-500 text-xs">Aranıyor...</div>
                                    ) : (searchResults.users?.length > 0 || searchResults.rides?.length > 0 || searchResults.routes?.length > 0) ? (
                                        <div className="py-2">
                                            {/* Users Section */}
                                            {searchResults.users?.length > 0 && (
                                                <div className="mb-2">
                                                    <div className="px-4 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kullanıcılar</div>
                                                    {searchResults.users.map((user: any) => (
                                                        <div
                                                            key={user._id}
                                                            onClick={() => {
                                                                onNavigate && onNavigate('public-profile', { _id: user._id });
                                                                setShowSearchResults(false);
                                                                setSearchQuery('');
                                                            }}
                                                            className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
                                                        >
                                                            <UserAvatar src={user.profileImage} name={user.name} size={32} />
                                                            <div>
                                                                <div className="text-white font-bold text-sm">{user.name}</div>
                                                                <div className="text-gray-500 text-xs">{user.bike || 'Motosiklet Tutkunu'}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Rides Section */}
                                            {searchResults.rides?.length > 0 && (
                                                <div className="mb-2 border-t border-white/5 pt-2">
                                                    <div className="px-4 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sürüşler</div>
                                                    {searchResults.rides.map((ride: any) => (
                                                        <div
                                                            key={ride._id}
                                                            onClick={() => {
                                                                setView('rides'); // Switch to rides tab
                                                                // Ideally scroll to ride or filter, but for now just switch view
                                                                setShowSearchResults(false);
                                                                setSearchQuery('');
                                                            }}
                                                            className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-moto-accent/20 flex items-center justify-center text-moto-accent">
                                                                <Users className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-white font-bold text-sm">{ride.title}</div>
                                                                <div className="text-gray-500 text-xs line-clamp-1">{ride.description}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Routes Section */}
                                            {searchResults.routes?.length > 0 && (
                                                <div className="mb-2 border-t border-white/5 pt-2">
                                                    <div className="px-4 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Rotalar</div>
                                                    {searchResults.routes.map((route: any) => (
                                                        <div
                                                            key={route._id}
                                                            onClick={() => {
                                                                setView('routes'); // Switch to routes tab
                                                                setShowSearchResults(false);
                                                                setSearchQuery('');
                                                            }}
                                                            className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                                                <Navigation className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-white font-bold text-sm">{route.title}</div>
                                                                <div className="text-gray-500 text-xs">{route.location}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 text-xs">Sonuç bulunamadı</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Live Stats Widget */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#111] rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-moto-accent/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-moto-accent/20 transition-colors" />
                        <h3 className="font-bold text-white tracking-wide text-sm mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            CANLI VERİLER
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-xl p-3">
                                <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Anlık Hız</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-mono font-bold text-white">124</span>
                                    <span className="text-[10px] text-moto-accent font-bold">km/h</span>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3">
                                <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Mesafe</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-mono font-bold text-white">42.8</span>
                                    <span className="text-[10px] text-moto-accent font-bold">km</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Active Squads (Chats) */}
                    < div className="bg-[#111] rounded-3xl p-6 border border-white/5 shadow-xl" >
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
                    </div >

                    {/* Trending Riders */}
                    < div className="bg-[#111] rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden" >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />
                        <h3 className="font-bold text-white tracking-wide text-sm mb-6 relative z-10">ÖNERİLEN SÜRÜCÜLER</h3>
                        <div className="space-y-5 relative z-10">
                            {suggestedRiders.slice(0, 4).map(rider => (
                                <div key={rider._id} className="flex items-center justify-between group/rider">
                                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => onNavigate && onNavigate('public-profile', { _id: rider._id })}>
                                        <UserAvatar src={rider.avatar} name={rider.name} size={36} />
                                        <div className="overflow-hidden">
                                            <div className="font-bold text-xs text-white truncate">{rider.name}</div>
                                            <div className="text-[10px] text-gray-400 truncate">{rider.bike || 'Rider'}</div>
                                        </div>
                                    </div>
                                    <div className="opacity-100 transition-opacity">
                                        <FollowButton targetUserId={rider._id} className="!w-auto !h-7 !px-3 !text-[10px]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div >

                    {/* Footer */}
                    < div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-gray-600 px-2 justify-center" >
                        <a href="#" className="hover:text-gray-400">Gizlilik</a>
                        <a href="#" className="hover:text-gray-400">Kurallar</a>
                        <a href="#" className="hover:text-gray-400">Reklam</a>
                        <a href="#" className="hover:text-gray-400">MotoVibe © 2025</a>
                    </div >
                </div >

            </div >

            {/* Direct Messages Overlay */}
            < DirectMessages isOpen={isDMOpen} onClose={() => { setIsDMOpen(false); setInitialChatId(null); }} initialChatUserId={initialChatId || undefined} />

            {/* Comment Sheet (Shared) */}
            {activePostId && (
                <CommentSheet
                    isOpen={isCommentSheetOpen}
                    onClose={() => setIsCommentSheetOpen(false)}
                    postId={activePostId}
                    currentUser={currentUser}
                />
            )}
        </div >
    );
};
