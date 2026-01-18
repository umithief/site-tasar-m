
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { SocialPost, ViewState } from '../../types';
import { RouteSuggestions } from './RouteSuggestions';
import { GlassFeedCard } from './GlassFeedCard';
import { socialService } from '../../services/socialService';

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

            {data?.pages.map((page: any, i: number) => (
                <React.Fragment key={i}>
                    {page?.map((post: SocialPost, index: number) => (
                        <React.Fragment key={post._id}>
                            <FeedItem index={index}>
                                <div className="perspective-item space-y-6">
                                    <GlassFeedCard
                                        post={post}
                                        onUserProfileClick={(userId) => onNavigate?.('public-profile', { userId })}
                                        onLike={async (id) => {
                                            if (currentUser) {
                                                try { await socialService.likePost(id, currentUser._id); } catch (e) { console.error(e); }
                                            }
                                        }}
                                        onComment={(id) => onCommentClick(id)}
                                    />
                                </div>
                            </FeedItem>

                            {/* Inject Route Suggestions after the 3rd post of the first page */}
                            {i === 0 && index === 2 && (
                                <FeedItem index={index + 0.5}>
                                    <div className="py-4">
                                        <RouteSuggestions />
                                    </div>
                                </FeedItem>
                            )}
                        </React.Fragment>
                    ))}
                </React.Fragment>
            ))}

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
