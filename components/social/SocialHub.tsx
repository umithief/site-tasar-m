import React, { useState, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Home, MessageSquare, Calendar, User, Search, Map as MapIcon, Navigation, Plus, Image, Grid, Users, Bell, ShoppingBag, Settings, LogOut, PlusCircle, Archive, Heart, MessageCircle, Sun, Moon, Gauge } from 'lucide-react';
import { ResponsivePostCard } from './ResponsivePostCard';
import { SpatialFeed } from './SpatialFeed';
import { AdvancedCreatePostModal } from './AdvancedCreatePostModal';
import { FollowButton } from './FollowButton';
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
import { usePosts, useCreatePost } from '../../hooks/usePosts';
import { MediaUploader } from '../ui/MediaUploader';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { StoryBar } from './StoryBar';
import { StoryViewerOverlay } from './StoryViewerOverlay';
import { storyService, StoryGroup } from '../../services/storyService';
import { RouteSuggestions } from './RouteSuggestions';
import { CreateRideModal } from '../ride/CreateRideModal'; // Imported
import { ResponsiveDashboardLayout } from '../dashboard/ResponsiveDashboardLayout';
import { useDashboardStore } from '../../store/dashboardStore';
import { RightWidgets } from './RightWidgets';


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
    const [isCreateRideOpen, setIsCreateRideOpen] = useState(false); // New state
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } = usePosts();
    const { mutate: createPost } = useCreatePost();
    const [suggestedRiders, setSuggestedRiders] = useState<any[]>([]);

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
            const [riders, rides] = await Promise.all([
                socialService.getSuggestedRiders(),
                rideService.getRides().catch(() => [])
            ]);
            setSuggestedRiders(riders);
            setActiveRides(rides);
        };

        fetchMiscData();

        const handleRideCreated = () => {
            console.log("Refreshing rides...");
            rideService.getRides().then(setActiveRides).catch(console.error);
        };
        window.addEventListener('ride-created', handleRideCreated);

        return () => {
            window.removeEventListener('ride-created', handleRideCreated);
        };
    }, []);

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


    const isMobileDrawerOpen = useDashboardStore((state) => state.isOpen);

    const rightSidebarContent = (
        <RightWidgets suggestedRiders={suggestedRiders} onNavigate={onNavigate} />
    );

    return (
        <div className="bg-transparent min-h-screen text-gray-900 pt-0 pb-0 font-sans selection:bg-moto-accent/30 relative transition-colors duration-300">
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

            <ResponsiveDashboardLayout
                user={currentUser}
                isMobileDrawerOpen={isMobileDrawerOpen}
                onCloseMobileDrawer={() => useDashboardStore.getState().close()}
                rightSidebar={rightSidebarContent}
            >

                {/* --- MAIN FEED STREAM --- */}
                <div className="min-h-screen bg-transparent transition-colors duration-300">


                    {/* Sticky Header Group (Tabs + Stories) */}
                    <div
                        className="sticky z-40 transition-[top] duration-300 pb-2 will-change-transform transform-gpu"
                        style={{ top: 'var(--mobile-header-height, 0px)' }}
                    >
                        {/* Background for the sticky area to prevent bleed-through */}
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm z-[-1] transition-colors duration-300" />

                        {/* Top Navigation Tabs */}
                        <div className="bg-transparent px-4 py-2 flex items-center justify-center">
                            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar bg-gray-50 rounded-full px-6 py-2 border border-gray-200/50 transition-colors duration-300">
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
                                                ? 'text-black'
                                                : 'text-gray-500 hover:text-gray-900 '}`}
                                    >
                                        <span>{item.label}</span>
                                        {view === item.id && (
                                            <motion.div
                                                layoutId="activeTabUnderline"
                                                className="absolute -bottom-1 left-0 right-0 h-[2px] bg-black shadow-none"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>


                            {/* Right Actions (Desktop Only) */}
                            <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-gray-200 ml-4 pointer-events-auto">
                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                        className={`relative p-2 rounded-full transition-all border ${isNotificationOpen ? 'bg-gray-100 text-black border-gray-200' : 'bg-white text-gray-400 border-gray-100 hover:text-gray-900 hover:border-gray-200'}`}
                                    >
                                        <Bell className={`w-5 h-5 ${isNotificationOpen ? 'fill-current' : ''}`} />
                                        {useNotificationStore.getState().unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white" />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setIsCreateOpen(!isCreateOpen)}
                                        className={`relative p-2 rounded-full transition-all border ml-2 ${isCreateOpen ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-400 border-gray-100 hover:text-blue-500 hover:border-blue-200'}`}
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => setIsCreateRideOpen(true)}
                                        className="relative p-2 rounded-full transition-all border ml-2 bg-white text-gray-400 border-gray-100 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50"
                                        title="Sürüş Oluştur"
                                    >
                                        <Navigation className="w-5 h-5" />
                                    </button>

                                    {/* Notification Dropdown */}
                                    <AnimatePresence>
                                        {isNotificationOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-[60]"
                                            >
                                                <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                                    <h4 className="font-bold text-sm text-gray-900">Bildirimler</h4>
                                                    <span className="text-[10px] text-gray-500 cursor-pointer hover:text-black">Tümünü Okundu İşaretle</span>
                                                </div>
                                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                                    {notifications.length > 0 ? (
                                                        notifications.map((notif: any) => (
                                                            <div key={notif.id} className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                                                                <div className="flex gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                                        <Bell className="w-4 h-4 text-blue-500" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-700 leading-snug">{notif.message}</p>
                                                                        <span className="text-[10px] text-gray-400 mt-1 block font-medium">{notif.time || 'Az önce'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-8 text-center text-gray-400 text-xs">
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
                                                className="absolute top-full right-0 mt-4 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-[100] ring-1 ring-black/5"
                                            >
                                                {/* Header */}
                                                <div className="relative p-6 pt-8 pb-6 border-b border-gray-100 overflow-hidden group">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-moto-accent/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <div className="relative z-10 flex items-center gap-4">
                                                        <div className="ring-2 ring-gray-100 rounded-full p-0.5 bg-white">
                                                            <UserAvatar src={currentUser?.profileImage || currentUser?.avatar} name={currentUser?.name} size={48} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-gray-900 font-bold text-base truncate">{currentUser?.name || "Misafir"}</h4>
                                                            <p className="text-gray-500 text-xs font-mono truncate">@{currentUser?.username || "guest"}</p>
                                                            {currentUser?.rank && (
                                                                <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
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
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3 rounded-xl transition-all group"
                                                    >
                                                        <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-moto-accent group-hover:text-black transition-colors">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        Profil Görüntüle
                                                    </button>

                                                    <button
                                                        onClick={() => { onNavigate && onNavigate('garage' as any); setIsProfileMenuOpen(false); }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3 rounded-xl transition-all group"
                                                    >
                                                        <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-moto-accent group-hover:text-black transition-colors">
                                                            <Archive className="w-4 h-4" />
                                                        </div>
                                                        Garajım
                                                    </button>

                                                    <button
                                                        onClick={() => { onNavigate && onNavigate('settings' as any); setIsProfileMenuOpen(false); }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3 rounded-xl transition-all group"
                                                    >
                                                        <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-moto-accent group-hover:text-black transition-colors">
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


                    </div> {/* End of Sticky Group */}

                    {/* Stories Bar (Scrollable) */}
                    {view === 'feed' && (
                        <div className="mb-0 mx-0 pb-2">
                            <StoryBar
                                storyGroups={storyGroups}
                                onStorySelect={setSelectedStoryGroup}
                                onAddStory={() => fileInputRef.current?.click()}
                            />
                        </div>
                    )}


                    {/* View Switcher Content */}
                    {view === 'feed' ? (
                        <>
                            {/* Community CTA within Feed Stream (if not logged in) */}
                            {!currentUser && (
                                <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl mb-8 mt-4 mx-4">
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



                            {/* Feed Stream */}
                            <PullToRefresh onRefresh={async () => { await refetch(); }} isMobile={true}>
                                <div className="space-y-6 pt-0 pb-32">
                                    <SpatialFeed
                                        data={data}
                                        currentUser={currentUser}
                                        onNavigate={onNavigate}
                                        isFetchingNextPage={isFetchingNextPage}
                                        hasNextPage={hasNextPage}
                                        fetchNextPage={fetchNextPage}
                                        onCommentClick={(postId) => {
                                            setActivePostId(postId);
                                            setIsCommentSheetOpen(true);
                                        }}
                                    />
                                </div>
                            </PullToRefresh>
                        </>
                    ) : (
                        /* WIDE VIEW AREA (Map/Routes/Events) */
                        <div className="h-[calc(100vh-140px)] sticky top-28 bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden shadow-2xl">
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
                    )
                    }
                </div >

                {/* --- RIGHT SIDEBAR (Context) --- */}
            </ResponsiveDashboardLayout >

            {/* Direct Messages Overlay */}


            {/* Comment Sheet (Shared) */}
            {
                activePostId && (
                    <CommentSheet
                        isOpen={isCommentSheetOpen}
                        onClose={() => setIsCommentSheetOpen(false)}
                        postId={activePostId}
                        currentUser={currentUser}
                    />
                )
            }

            <AdvancedCreatePostModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                currentUser={currentUser}
                onPostCreate={handlePostCreate}
            />

            <CreateRideModal
                isOpen={isCreateRideOpen}
                onClose={() => setIsCreateRideOpen(false)}
                user={currentUser}
                onSuccess={() => {
                    // Refresh handled by event listener
                }}
            />
        </div >
    );
};
