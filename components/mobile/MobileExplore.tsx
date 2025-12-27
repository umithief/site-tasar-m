import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Grid, Play } from 'lucide-react';
import { socialService } from '../../services/socialService';
import { SocialPost } from '../../types';
import { SearchOverlay } from './SearchOverlay';

interface MobileExploreProps {
    onNavigate: (view: string, data?: any) => void;
}

const CATEGORIES = [
    { id: 'ALL', label: 'Tümü' },
    { id: 'SPORT', label: '#Sportbike' },
    { id: 'NAKED', label: '#Naked' },
    { id: 'CROSS', label: '#Cross' },
    { id: 'GEAR', label: '#Ekipman' },
    { id: 'VLOG', label: '#Vlog' },
    { id: 'CUSTOM', label: '#Custom' }
];

export const MobileExplore: React.FC<MobileExploreProps> = ({ onNavigate }) => {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [cursor, setCursor] = useState(0);

    const loadFeed = useCallback(async (reset = false) => {
        if (reset) setLoading(true);
        const data = await socialService.getExploreFeed(reset ? 0 : cursor, selectedCategory);

        if (reset) {
            setPosts(data);
        } else {
            setPosts(prev => [...prev, ...data]);
        }

        setCursor(prev => prev + 1); // Simple cursor logic
        setLoading(false);
    }, [selectedCategory]);

    useEffect(() => {
        loadFeed(true);
    }, [loadFeed]);

    // Infinite Scroll Handler could go here

    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-24">

            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="p-4 flex flex-col gap-4">
                    {/* Search Trigger */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 hover:bg-white/10 transition-all group"
                    >
                        <Search className="w-5 h-5 text-gray-500 group-hover:text-moto-accent transition-colors" />
                        <span className="text-sm font-medium">Motovibe'da Ara...</span>
                    </button>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {CATEGORIES.map(cat => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${isSelected
                                        ? 'bg-moto-accent text-white border-moto-accent'
                                        : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Masonry Grid */}
            <div className="p-2">
                {/* CSS Columns Approach for Masonry - Simpler than JS libs */}
                {loading ? (
                    <div className="columns-2 gap-2 space-y-2">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={`bg-white/5 rounded-xl animate-pulse ${i % 3 === 0 ? 'aspect-[9/16]' : 'aspect-square'}`} />
                        ))}
                    </div>
                ) : (
                    <div className="columns-2 gap-2 space-y-2">
                        {posts.map((post, idx) => {
                            // "Featured" Logic: pseudo-randomly decide if a post looks "tall" (reel) vs square
                            // For realism, let's say if it has 'images' it's square, if video (future) or specific random index, it's tall.
                            // Since our SocialPost structure is unified, let's just use index pattern.
                            const isTall = idx % 5 === 2; // Every 5th item starting from index 2

                            return (
                                <motion.div
                                    key={post._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    onClick={() => onNavigate('product-detail', { ...post, type: 'social' })} // Or dedicated social detail view
                                    className={`relative break-inside-avoid rounded-xl overflow-hidden bg-gray-900 group cursor-pointer border border-white/5 ${isTall ? 'aspect-[9/16]' : 'aspect-[4/5]'}`}
                                >
                                    <img
                                        src={post.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000&auto=format&fit=crop'}
                                        alt={post.userName}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20">
                                                <img src={post.userAvatar} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-xs text-white font-bold truncate">{post.userName}</span>
                                        </div>
                                    </div>

                                    {/* Type Indicator */}
                                    {isTall && (
                                        <div className="absolute top-2 right-2 p-1 bg-black/50 backdrop-blur-sm rounded-full">
                                            <Play className="w-3 h-3 text-white fill-white" />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <SearchOverlay
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onNavigate={onNavigate}
            />
        </div>
    );
};
