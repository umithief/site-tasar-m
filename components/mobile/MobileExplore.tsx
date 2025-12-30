
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Grid, Play } from 'lucide-react';
import { socialService } from '../../services/socialService';
import { SocialPost, ViewState } from '../../types';
import { SearchOverlay } from './SearchOverlay';

interface MobileExploreProps {
    onNavigate: (view: ViewState, data?: any) => void;
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
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const loadPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            // Using existing socialService.getFeed() as explore endpoint might be unstable
            const data = await socialService.getFeed();
            // In a real app, we would filter by category here or pass category to API
            // For now, we just shuffle or filter locally if needed
            setPosts(data);
        } catch (error) {
            console.error("Explore load error", error);
        } finally {
            setIsLoading(false);
        }
    }, [activeCategory]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    return (
        <div className="min-h-screen bg-[#050505] pb-24 font-sans text-gray-100">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-white/5">
                <div
                    className="flex-1 h-10 bg-white/10 rounded-xl flex items-center px-3 gap-2 text-gray-400 cursor-pointer hover:bg-white/15 transition-colors"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <Search className="w-4 h-4" />
                    <span className="text-sm font-medium">Keşfet & Ara...</span>
                </div>
            </div>

            {/* Categories */}
            <div className="px-4 py-3 overflow-x-auto no-scrollbar flex gap-2 sticky top-[65px] z-20 bg-[#050505]/90 backdrop-blur-md border-b border-white/5">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === cat.id
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Grid Content */}
            <div className="p-1">
                {isLoading ? (
                    <div className="grid grid-cols-3 gap-0.5">
                        {[...Array(15)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-0.5">
                        {posts.map((post, index) => (
                            <div
                                key={post._id}
                                className={`relative group cursor-pointer overflow-hidden bg-white/5 ${(index % 10 === 0) ? 'col-span-2 row-span-2' : ''
                                    }`}
                                onClick={() => onNavigate('social-hub' as ViewState, { openPost: post._id })}
                            >
                                {/* Video icon logic removed or needs 'type' in SocialPost */}

                                <img
                                    src={post.images?.[0] || 'https://via.placeholder.com/300'}
                                    alt="Explore"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                            </div>
                        ))}
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
