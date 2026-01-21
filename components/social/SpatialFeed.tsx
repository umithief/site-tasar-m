
import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
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

export const SpatialFeed: React.FC<SpatialFeedProps> = ({
    data,
    currentUser,
    onNavigate,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    onCommentClick
}) => {
    // 3D Tilt Effect Container
    const FeedContainer = ({ children }: { children: React.ReactNode }) => {
        return (
            <div className="perspective-[2000px] space-y-8 py-4 px-2">
                {children}
            </div>
        );
    };

    return (
        <FeedContainer>
            {/* Empty State */}
            {!isFetchingNextPage && data?.pages?.[0]?.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 px-4 text-center"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-zinc-800 to-black rounded-[2rem] flex items-center justify-center mb-6 border border-white/5 shadow-2xl shadow-black/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
                        <span className="text-4xl">📭</span>
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Sessiz Bölge</h3>
                    <p className="text-gray-400 mb-8 max-w-xs mx-auto font-medium">Buralar biraz fazla sessiz. Sürücüleri takip etmeye başla!</p>
                </motion.div>
            )}

            {/* Deduplicate posts to prevent key collisions */}
            {(() => {
                const seen = new Set();
                return data?.pages?.flatMap((page: any) => page || []).filter((post: SocialPost) => {
                    const duplicate = seen.has(post._id);
                    seen.add(post._id);
                    return !duplicate;
                }).map((post: SocialPost, index: number) => (
                    <React.Fragment key={post._id}>
                        <FeedItem index={index}>
                            <div className="relative group perspective-item">
                                {/* Glassmorphic Background Card */}
                                <div className="absolute inset-0 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-[2.5rem] -z-10 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all duration-300 group-hover:bg-white/90 group-hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] group-hover:border-white/50" />

                                <ResponsivePostCard
                                    post={post}
                                    currentUserId={currentUser?._id}
                                    onNavigate={onNavigate}
                                    onCommentClick={() => onCommentClick(post._id)}
                                    variant="glass"
                                    className="!bg-transparent !shadow-none !border-none"
                                />
                            </div>
                        </FeedItem>

                        {/* Inject Route Suggestions after the 3rd post (index 2) */}
                        {index === 2 && (
                            <FeedItem index={index + 0.5}>
                                <div className="py-4">
                                    <RouteSuggestions />
                                </div>
                            </FeedItem>
                        )}
                    </React.Fragment>
                ));
            })()}

            {isFetchingNextPage && (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-2 border-moto-accent border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(226,255,59,0.3)]" />
                </div>
            )}

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
        </FeedContainer>
    );
};

// Animation Wrapper for Individual Items
const FeedItem = ({ children, index }: { children: React.ReactNode, index: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95, rotateX: -10 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                type: "spring",
                stiffness: 50, // Looser spring for more smooth feeling
                damping: 20,
                delay: index % 5 * 0.05 // Stagger effect
            }}
            style={{ transformStyle: 'preserve-3d' }}
        >
            {children}
        </motion.div>
    );
};
