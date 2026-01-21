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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 px-4 text-center"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-zinc-800 to-black rounded-[2rem] flex items-center justify-center mb-6 border border-white/5 shadow-2xl shadow-black/50 relative overflow-hidden">
                        <span className="text-4xl">📭</span>
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Sessiz Bölge</h3>
                    <p className="text-gray-400 mb-8 max-w-xs mx-auto font-medium">Buralar biraz fazla sessiz. Sürücüleri takip etmeye başla!</p>
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
