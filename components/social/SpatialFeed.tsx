import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { SocialPost, ViewState } from '../../types';
import { ResponsivePostCard } from './ResponsivePostCard';
import { RouteSuggestions } from './RouteSuggestions';

interface SpatialFeedProps {
    data: any;
    currentUser: any;
    onNavigate?: (view: ViewState, data?: any) => void;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    onCommentClick: (postId: string) => void;
}

export const SpatialFeed: React.FC<SpatialFeedProps> = memo(({
    data,
    currentUser,
    onNavigate,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    onCommentClick
}) => {
    // Memoize posts list - deduplicate and prepare
    const posts = useMemo(() => {
        if (!data?.pages) return [];
        const seen = new Set<string>();
        return data.pages
            .flatMap((page: any) => page || [])
            .filter((post: SocialPost) => {
                if (seen.has(post._id)) return false;
                seen.add(post._id);
                return true;
            });
    }, [data]);

    const isEmpty = !isFetchingNextPage && posts.length === 0;

    return (
        <div className="space-y-6 py-4 px-2 w-full max-w-lg mx-auto">
            {/* Empty State */}
            {isEmpty && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex flex-col items-center justify-center py-20 px-6 text-center"
                >
                    <div className="relative mb-8 group cursor-default">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-moto-accent/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        {/* Icon Container */}
                        <div className="w-28 h-28 bg-gradient-to-br from-[#1a1a1a] to-black rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-500 ring-1 ring-white/10 group-hover:ring-moto-accent/50">
                            <span className="text-5xl filter drop-shadow-lg group-hover:rotate-12 transition-transform duration-300">🪐</span>
                        </div>

                        {/* Orbit Animation Element */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#222] rounded-full border border-white/10 flex items-center justify-center z-20 shadow-lg animate-bounce-slow">
                            <span className="text-xs">💤</span>
                        </div>
                    </div>

                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
                        Sessiz Bölge
                    </h3>

                    <p className="text-gray-400 mb-8 max-w-[280px] mx-auto font-medium leading-relaxed text-sm">
                        Henüz hiç gönderi düşmemiş. Burası şimdilik derin uzay kadar sessiz.
                    </p>

                    <button
                        onClick={() => onNavigate?.('explore')}
                        className="px-8 py-3.5 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-moto-accent hover:text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-2 group"
                    >
                        <span>Keşfe Çık</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </button>
                </motion.div>
            )}

            {/* Post List */}
            {posts.map((post: SocialPost, index: number) => (
                <div key={post._id}>
                    <ResponsivePostCard
                        post={post}
                        currentUserId={currentUser?._id}
                        onNavigate={onNavigate}
                        onCommentClick={() => onCommentClick(post._id)}
                        variant="default"
                        priority={index < 2}
                    />

                    {/* Inject Route Suggestions after 3rd post */}
                    {index === 2 && (
                        <div className="py-4 mt-6">
                            <RouteSuggestions />
                        </div>
                    )}
                </div>
            ))}

            {/* Loading Spinner */}
            {isFetchingNextPage && (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-2 border-moto-accent border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Load More Button */}
            {hasNextPage && (
                <div className="flex justify-center pt-8 pb-20">
                    <button
                        onClick={() => fetchNextPage()}
                        className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span>Daha Fazla Keşfet</span>
                        <span className="w-1.5 h-1.5 bg-moto-accent rounded-full animate-pulse" />
                    </button>
                </div>
            )}
        </div>
    );
});
