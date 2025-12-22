import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Home, MessageSquare, Calendar, User, Search, Bell, PlusCircle, Grid, Users } from 'lucide-react';
import { PostCard } from './PostCard';
import { FollowButton } from './FollowButton';
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
    initialData?: any;
}

import { socialService } from '../../services/socialService';
import { messageService } from '../../services/messageService';
import { usePosts, useCreatePost } from '../../hooks/usePosts';
import { MediaUploader } from '../ui/MediaUploader';
import { useAuthStore } from '../../store/authStore';

export const SocialHub: React.FC<SocialHubProps> = ({ user: propUser, onNavigate, onLogout, onUpdateUser, initialData }) => {
    const { user: globalUser } = useAuthStore();
    const currentUser = globalUser || propUser;

    const [isDMOpen, setIsDMOpen] = useState(false);
    const [view, setView] = useState<'feed' | 'profile'>('feed');
    const [newPostContent, setNewPostContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = usePosts();

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

    // Auto-open DM if requested via props
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
            }
        });
    };

    return (
        <div className="bg-[#050505] min-h-screen text-white pt-20">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-80px)]">

                {/* LEFT SIDEBAR (Navigation) */}
                <div className="hidden lg:col-span-3 lg:flex flex-col gap-2 py-6 sticky top-20 h-full">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-4">
                        <div className="flex items-center gap-4 mb-6">
                            <UserAvatar name={currentUser?.name || 'Misafir'} size={56} className="border-2 border-moto-accent cursor-pointer" onClick={() => onNavigate && onNavigate('my-profile')} />
                            <div>
                                <h3 className="font-bold text-lg leading-tight cursor-pointer hover:text-moto-accent transition-colors" onClick={() => onNavigate && onNavigate('my-profile')}>{currentUser?.name || 'Misafir Kullanıcı'}</h3>
                                <p className="text-xs text-gray-500 font-mono">{currentUser?.rank || 'Rider'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="bg-white/5 rounded-lg p-2">
                                <span className="block font-bold text-white text-sm">{currentUser?.followersCount || currentUser?.followers || 0}</span>
                                <span className="text-gray-500">Takipçi</span>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                                <span className="block font-bold text-white text-sm">{currentUser?.followingCount || currentUser?.following || 0}</span>
                                <span className="text-gray-500">Takip</span>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                                <span className="block font-bold text-white text-sm">{currentUser?.garage?.length || 0}</span>
                                <span className="text-gray-500">Araçlar</span>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'feed', icon: Home, label: 'Akış', action: () => setView('feed') },
                            { id: 'discover', icon: Compass, label: 'Keşfet', action: () => onNavigate && onNavigate('riders') },
                            { id: 'garage', icon: Grid, label: 'Garajım', action: () => onNavigate && onNavigate('my-profile') },
                            { id: 'events', icon: Calendar, label: 'Etkinlikler', action: () => onNavigate && onNavigate('meetup') },
                            { id: 'messages', icon: MessageSquare, label: 'Mesajlar', action: () => setIsDMOpen(true) },
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
                    {!currentUser ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-moto-accent blur-2xl opacity-20 rounded-full"></div>
                                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-full">
                                    <Users className="w-12 h-12 text-moto-accent" />
                                </div>
                            </div>
                            <div className="max-w-md space-y-2">
                                <h2 className="text-3xl font-display font-bold text-white">Topluluğa Katıl</h2>
                                <p className="text-gray-400">Diğer sürücüleri takip etmek, gönderi paylaşmak ve etkinliklere katılmak için giriş yap.</p>
                            </div>
                            <button
                                onClick={() => onNavigate && onNavigate('auth')}
                                className="bg-moto-accent text-black px-8 py-4 rounded-xl font-bold hover:bg-white transition-all transform hover:scale-105 shadow-xl shadow-moto-accent/20"
                            >
                                GiriV Yap / Kayit Ol
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Create Post Widget */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 mb-8 flex flex-col gap-4">
                                <div className="flex gap-4 items-start">
                                    <UserAvatar name={currentUser?.name || 'M'} size={40} />
                                    <div className="flex-1 bg-white/5 rounded-2xl min-h-[48px] flex items-center px-4 cursor-text hover:bg-white/10 transition-colors focus-within:ring-1 ring-moto-accent">
                                        <textarea
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleCreatePost()}
                                            className="bg-transparent w-full text-white placeholder-gray-500 text-sm outline-none resize-none py-3 h-full"
                                            placeholder="Sürüş deneyimi paylaş..."
                                            rows={1}
                                        />
                                    </div>
                                    <button onClick={handleCreatePost} disabled={!newPostContent.trim() && !mediaUrl} className="bg-moto-accent text-black p-3 rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        <PlusCircle className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="pl-14">
                                    <MediaUploader
                                        onUploadComplete={(url) => setMediaUrl(url)}
                                        onUploadError={(err) => alert(err)}
                                    />
                                    {mediaUrl && <p className="text-xs text-green-500 mt-2">✓ Medya eklendi</p>}
                                </div>
                            </div>

                            {/* Posts Feed */}
                            <div className="space-y-6">
                                {status === 'pending' || (status as any) === 'loading' ? (
                                    <div className="text-center py-10 text-gray-500 animate-pulse">Yükleniyor...</div>
                                ) : status === 'error' ? (
                                    <div className="text-center py-10 text-red-500">Akış yüklenemedi: {error.message}</div>
                                ) : (
                                    <>
                                        {data?.pages.map((page, i) => (
                                            <React.Fragment key={i}>
                                                {page && page.length > 0 ? page.map((post: SocialPost) => (
                                                    <PostCard key={post._id} post={post} currentUserId={currentUser?._id} />
                                                )) : (
                                                    i === 0 && <div className="text-center py-10 text-gray-500">Henüz gönderi yok. İlk paylaşımı sen yap!</div>
                                                )}
                                            </React.Fragment>
                                        ))}

                                        {hasNextPage && (
                                            <button
                                                onClick={() => fetchNextPage()}
                                                disabled={isFetchingNextPage}
                                                className="w-full py-4 text-sm text-moto-accent font-bold hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
                                            >
                                                {isFetchingNextPage ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* RIGHT SIDEBAR (Social Intelligence) */}
                <div className="hidden lg:col-span-3 lg:flex flex-col gap-6 py-6 sticky top-20 h-fit">

                    {/* Active Conversations (Mini Chat Heads) */}
                    {activeThreads.length > 0 && (
                        <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md border border-white/10 rounded-3xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-white text-sm">AKTİF SOHBETLER</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] text-green-500 uppercase font-bold">{activeThreads.length} Sohbet</span>
                                </div>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {activeThreads.map((thread) => (
                                    <div
                                        key={thread.id}
                                        className="relative cursor-pointer group flex-shrink-0"
                                        onClick={() => { setInitialChatId(thread.userId); setIsDMOpen(true); }}
                                    >
                                        <UserAvatar src={thread.userAvatar} name={thread.userName} size={48} className="border-2 border-transparent group-hover:border-moto-accent transition-colors" />
                                        {thread.unreadCount > 0 && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-moto-accent text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#050505]">
                                                {thread.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggested Riders */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-white text-sm uppercase">Önerilen Sürücüler</h3>
                            <button className="text-xs text-moto-accent hover:underline" onClick={() => onNavigate && onNavigate('riders')}>Tümünü Gör</button>
                        </div>
                        <div className="space-y-4">
                            {suggestedRiders.length > 0 ? suggestedRiders.map(rider => (
                                <div key={rider.id || rider._id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate && onNavigate('public-profile', { _id: rider.id || rider._id })}>
                                        <UserAvatar src={rider.avatar || rider.profileImage} name={rider.name} size={40} />
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{rider.name}</h4>
                                            <p className="text-[10px] text-gray-500 font-mono">{rider.bike}</p>
                                        </div>
                                    </div>
                                    <FollowButton targetUserId={rider.id || rider._id} className="px-3 py-1.5 h-auto text-[10px]" />
                                </div>
                            )) : (
                                <p className="text-xs text-gray-500">Önerilecek sürücü bulunamadı.</p>
                            )}
                        </div>
                    </div>

                    {/* Premium Ad / Event */}
                    <div className="relative overflow-hidden rounded-3xl aspect-[4/5] group cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1558981806-ec527fa84d3d?q=80&w=800" alt="Event" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6">
                            <span className="text-moto-accent text-xs font-black uppercase tracking-widest mb-2">GELECEK ETKİNLİK</span>
                            <h3 className="text-2xl font-display font-black text-white leading-none mb-2">GECE SÜRÜŞÜ<br />İSTANBUL</h3>
                            <p className="text-gray-300 text-xs mb-4">Yılın en büyük gece sürüşü için 500+ sürücüye katılın.</p>
                            <button className="w-full bg-white text-black font-bold py-3 rounded-xl uppercase hover:bg-moto-accent transition-colors">KAYDOL</button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Direct Messages Overlay */}
            <DirectMessages isOpen={isDMOpen} onClose={() => { setIsDMOpen(false); setInitialChatId(null); }} initialChatUserId={initialChatId} />
        </div>
    );
};
