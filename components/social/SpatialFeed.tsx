import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { SocialPost, ViewState } from '../../types';
import { ResponsivePostCard } from './ResponsivePostCard';
import { RouteSuggestions } from './RouteSuggestions';
import { SponsoredCard } from './SponsoredCard';

interface SpatialFeedProps {
    data: any;
    currentUser: any;
    onNavigate?: (view: ViewState, data?: any) => void;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    onCommentClick: (postId: string) => void;
    isLoading?: boolean; // New Prop
}

export const SpatialFeed: React.FC<SpatialFeedProps> = memo(({
    data,
    currentUser,
    onNavigate,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    onCommentClick,
    isLoading = false // Default false
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

    const isEmpty = !isLoading && !isFetchingNextPage && posts.length === 0;

    // Loading State (Initial Fetch)
    if (isLoading) {
        return (
            <div className="space-y-6 py-4 px-2 w-full max-w-lg mx-auto">
                {/* VibeEngine Loading Header */}
                <div className="flex items-center justify-center gap-3 py-6 opacity-70">
                    <div className="w-5 h-5 rounded-full border-2 border-moto-accent border-r-transparent animate-spin" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">VibeEngine Hazırlanıyor...</span>
                </div>

                {/* Skeleton Cards */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 rounded-3xl p-4 space-y-4 animate-pulse">
                        {/* Header Skeleton */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <div className="w-32 h-3 bg-gray-200 dark:bg-white/10 rounded-full" />
                                <div className="w-20 h-2 bg-gray-200 dark:bg-white/10 rounded-full" />
                            </div>
                        </div>
                        {/* Image Skeleton */}
                        <div className="w-full aspect-[4/5] bg-gray-200 dark:bg-white/10 rounded-2xl" />
                        {/* Footer Skeleton */}
                        <div className="space-y-2 pt-2">
                            <div className="w-3/4 h-3 bg-gray-200 dark:bg-white/10 rounded-full" />
                            <div className="w-1/2 h-3 bg-gray-200 dark:bg-white/10 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 py-4 px-2 w-full max-w-lg mx-auto">
            {/* Empty State */}
            {isEmpty && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex flex-col items-center justify-center py-12 px-6 text-center w-full"
                >
                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-white/10 max-w-sm w-full flex flex-col items-center relative overflow-hidden group">

                        {/* Decorative Background Pattern */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

                        {/* Icon */}
                        <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                            <span className="text-5xl filter drop-shadow-md">🏍️</span>
                            {/* Animated Speed Lines */}
                            <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-4 h-0.5 bg-gray-300 dark:bg-white/20 rounded-full animate-pulse"></div>
                                <div className="w-6 h-0.5 bg-gray-300 dark:bg-white/20 rounded-full animate-pulse delay-75"></div>
                                <div className="w-3 h-0.5 bg-gray-300 dark:bg-white/20 rounded-full animate-pulse delay-150"></div>
                            </div>
                        </div>

                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2 z-10">
                            Henüz Kimse Yok
                        </h3>

                        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium leading-relaxed text-sm z-10 px-4">
                            Motorunu çalıştır ve ilk izi sen bırak! Akış şimdilik boş görünüyor.
                        </p>

                        <button
                            onClick={() => onNavigate?.('explore')}
                            className="w-full py-4 bg-black dark:bg-white dark:text-black text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 z-10"
                        >
                            <span>Keşfe Çık</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </div>
                </motion.div>
            )}



            {/* Post List */}
            {posts.map((post: any, index: number) => (
                <div key={post._id || index}>
                    {post.type === 'product' || post.type === 'sponsored' ? (
                        <SponsoredCard product={post} onNavigate={onNavigate} />
                    ) : (
                        <ResponsivePostCard
                            post={post}
                            currentUserId={currentUser?._id}
                            onNavigate={onNavigate}
                            onCommentClick={() => onCommentClick(post._id)}
                            variant="default"
                            priority={index < 2}
                        />
                    )}

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
                        className="px-8 py-4 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span>Daha Fazla Keşfet</span>
                        <span className="w-1.5 h-1.5 bg-moto-accent rounded-full animate-pulse" />
                    </button>
                </div>
            )}
        </div>
    );
});
