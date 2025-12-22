
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Compass, Home, MessageSquare, Calendar, Users,
    Grid, Bell, Search, PlusCircle, Activity, Radio, BarChart2
} from 'lucide-react';
import { PostCard } from './PostCard';
import { DirectMessages } from './DirectMessages';
import { usePosts, useCreatePost } from '../../hooks/usePosts';
import { useAuthStore } from '../../store/authStore';
import { socialService } from '../../services/socialService';
import { messageService } from '../../services/messageService';
import { SocialPost } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { MediaUploader } from '../ui/MediaUploader';

interface SocialHubProps {
    user: any;
    onNavigate?: (view: any) => void;
    onLogout?: () => void;
    onUpdateUser?: (user: any) => void;
    initialData?: any;
}

export const SocialHub: React.FC<SocialHubProps> = ({ user: propUser, onNavigate, initialData }) => {
    const { user: globalUser } = useAuthStore();
    const currentUser = globalUser || propUser;

    const [view, setView] = useState<'feed' | 'profile'>('feed');
    const [isDMOpen, setIsDMOpen] = useState(false);

    // Create Post State
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);

    const { data, status, fetchNextPage, hasNextPage } = usePosts();
    const { mutate: createPost } = useCreatePost();

    const [trendingTopics, setTrendingTopics] = useState(['#NightRide', '#YamahaR1', '#CafeRacer', '#TechTalk']);
    const [onlineCount, setOnlineCount] = useState(1243);

    const handleCreatePost = async () => {
        if ((!newPostContent.trim() && !mediaUrl) || !currentUser) return;
        createPost({
            userId: currentUser._id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            content: newPostContent,
            images: mediaUrl ? [mediaUrl] : [],
        }, { onSuccess: () => { setIsComposeOpen(false); setNewPostContent(''); setMediaUrl(null); } });
    };

    return (
        <div className="flex bg-[#050505] min-h-screen text-white font-sans selection:bg-[#FF4500] selection:text-black">

            {/* 2. THE STAGE (MAIN FEED) */}
            <main className="flex-1 w-full min-h-screen relative pt-24">

                {/* Internal Tabs (Minimalist) */}
                <div className="sticky top-24 z-30 flex justify-center gap-8 mb-12 mix-blend-difference">
                    {[
                        { id: 'feed', label: 'FEED' },
                        { id: 'discover', label: 'DISCOVER' },
                        { id: 'events', label: 'EVENTS' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView('feed')}
                            className={`text-[10px] font-bold tracking-[0.2em] transition-all duration-300 ${view === 'feed' && item.id === 'feed' ? 'text-[#FF4500] scale-110' : 'text-gray-500 hover:text-white'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Compose Overlay (Minimalist) */}
                <AnimatePresence>
                    {isComposeOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-[#0A0A0A] border-b border-white/5 overflow-hidden"
                        >
                            <div className="max-w-2xl mx-auto py-8 px-8">
                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder="TRANSMIT_SIGNAL..."
                                    className="w-full bg-transparent text-3xl font-light text-white placeholder-gray-800 outline-none resize-none font-display tracking-wide min-h-[120px]"
                                    autoFocus
                                />
                                <div className="flex justify-between items-end mt-4">
                                    <MediaUploader onUploadComplete={setMediaUrl} />
                                    <button
                                        onClick={handleCreatePost}
                                        className="text-[#FF4500] text-xs font-bold tracking-[0.2em] uppercase hover:text-white transition-colors"
                                    >
                                        [ PUBLISH ]
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Feed Content */}
                <div className="w-full max-w-[900px] mx-auto pb-32 px-4 md:px-0"> {/* Removed standard paddings */}
                    {status === 'pending' ? (
                        <div className="h-screen w-full flex items-center justify-center">
                            <div className="text-[#FF4500] font-mono text-xs animate-pulse">INITIALIZING_FEED...</div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-[120px]"> {/* Asymmetrical / Huge Whitespace */}
                            {data?.pages.map((page, i) => (
                                <React.Fragment key={i}>
                                    {page?.map((post: SocialPost, idx: number) => (
                                        <motion.div
                                            key={post._id}
                                            initial={{ opacity: 0, y: 50 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-10%" }}
                                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Smooth ease
                                            className={`${idx % 2 !== 0 ? 'md:ml-[10%]' : 'md:mr-[10%]'} relative`} // Asymmetrical Offset
                                        >
                                            <PostCard post={post} currentUserId={currentUser?._id} />
                                        </motion.div>
                                    ))}
                                </React.Fragment>
                            ))}

                            {hasNextPage && (
                                <div className="flex justify-center py-20">
                                    <button
                                        onClick={() => fetchNextPage()}
                                        className="text-[10px] tracking-[0.3em] text-gray-600 hover:text-[#FF4500] transition-colors uppercase"
                                    >
                                        LOAD_MORE_DATA
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Floating Action Button for Mobile/Desktop since Sidebar is gone */}
                <button
                    onClick={() => setIsComposeOpen(!isComposeOpen)}
                    className="fixed bottom-8 left-8 w-14 h-14 bg-[#FF4500] rounded-full flex items-center justify-center shadow-lg shadow-[#FF4500]/20 hover:scale-110 transition-transform z-40"
                >
                    <PlusCircle className="w-6 h-6 text-black" />
                </button>
            </main>

            {/* 3. THE RADAR (RIGHT PANEL) */}
            <aside className="fixed right-0 top-0 h-full w-[320px] bg-[#050505] border-l border-white/5 hidden lg:flex flex-col p-8 z-40">
                <div className="mb-12">
                    <h3 className="text-[10px] text-gray-600 font-mono tracking-widest mb-6">SYSTEM_STATUS</h3>

                    <div className="flex items-baseline gap-4 mb-2">
                        <span className="text-4xl font-light text-white font-mono">{onlineCount}</span>
                        <span className="text-[10px] text-[#FF4500] animate-pulse">● LIVE_NODES</span>
                    </div>
                    <div className="h-[1px] w-full bg-white/5 mb-6" />
                </div>

                <div className="flex-1">
                    <h3 className="text-[10px] text-gray-600 font-mono tracking-widest mb-6">TRENDING_SIGNALS</h3>
                    <ul className="space-y-6">
                        {trendingTopics.map((tag, i) => (
                            <li key={i} className="group cursor-pointer flex justify-between items-center">
                                <span className="text-sm font-light text-gray-400 group-hover:text-white transition-colors tracking-wide">{tag}</span>
                                <span className="text-[9px] font-mono text-gray-700 group-hover:text-[#FF4500]">{(Math.random() * 10).toFixed(1)}k</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-auto opacity-50 hover:opacity-100 transition-opacity">
                    <div className="border border-white/10 p-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h4 className="text-[10px] text-[#FF4500] font-bold tracking-widest mb-2">LIMITED_EVENT</h4>
                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                            MIDNIGHT RUN <br />
                            TOKYO SERVER
                        </p>
                        <button className="mt-4 w-full py-2 bg-white/10 text-[9px] font-bold hover:bg-[#FF4500] hover:text-black transition-all uppercase">
                            Register
                        </button>
                    </div>
                </div>
            </aside>

            <DirectMessages isOpen={isDMOpen} onClose={() => setIsDMOpen(false)} />
        </div>
    );
};
