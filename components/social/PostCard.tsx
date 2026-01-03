import React, { memo, useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { MoreHorizontal, ChevronRight, Gauge, MapPin, Activity } from 'lucide-react';
import { SocialPost } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { FollowButton } from './FollowButton';
import { PostActionsBar } from './PostActionsBar';

interface PostCardProps {
    post: SocialPost;
    currentUserId?: string;
    onCommentClick?: () => void;
}

const Counter = ({ from, to, duration = 1.5 }: { from: number; to: number; duration?: number }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(from, to, {
            duration,
            onUpdate(value) {
                node.textContent = value.toFixed(0);
            }
        });

        return () => controls.stop();
    }, [from, to, duration]);

    return <span ref={nodeRef} />;
};

const DataCard = ({ label, value, unit, icon: Icon, delay }: { label: string; value: number | string; unit?: string; icon: any; delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col justify-between items-start relative overflow-hidden group hover:border-[#E2FF3B]/50 transition-colors"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-xl font-mono font-bold text-white leading-none relative z-10">
            {typeof value === 'number' ? <Counter from={0} to={value} /> : value}
            {unit && <span className="text-xs text-[#E2FF3B] ml-1">{unit}</span>}
        </div>
    </motion.div>
);

const RouteCard = ({ delay }: { delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2 relative overflow-hidden group hover:border-[#E2FF3B]/50 transition-colors flex items-center justify-center"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 absolute top-2 left-2">Route</div>
        <svg viewBox="0 0 100 50" className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity stroke-[#E2FF3B]" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10,40 C30,40 30,10 50,10 C70,10 70,40 90,40" pathLength="1" className="animate-[dash_3s_ease-in-out_infinite]" />
        </svg>
    </motion.div>
);

export const PostCard: React.FC<PostCardProps> = memo(({ post, currentUserId, onCommentClick }) => {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Tilt Effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);
    const brightness = useTransform(mouseY, [-0.5, 0.5], [1.1, 0.9]);

    const stats = post.rideStats || { maxSpeed: 0, distance: 0, duration: '0h 0m' };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            className="w-full max-w-lg mx-auto mb-8 bg-[#0A0A0A] rounded-[32px] p-6 border border-[#222] relative shadow-2xl overflow-hidden font-sans"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 z-20 relative">
                <div className="flex items-center gap-3">
                    <UserAvatar name={post.userName} src={post.userAvatar} size={42} className="ring-2 ring-white/10" />
                    <div>
                        <h3 className="text-white font-bold text-sm leading-none">{post.userName}</h3>
                        <p className="text-gray-500 text-[10px] font-mono mt-1 uppercase tracking-wide">{post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'JUST NOW'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <FollowButton targetUserId={post.userId} className="!px-3 !py-1 !text-xs !h-7 bg-[#1A1A1A] hover:bg-[#252525] border border-white/5" />
                    <button className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center hover:bg-[#252525] text-gray-400 transition-colors border border-white/5">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main Visual - Bento Grid Area 1 */}
            <div
                className="perspective-1000 w-full aspect-square md:aspect-[4/3] mb-4 relative z-10"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                ref={containerRef}
            >
                <motion.div
                    style={{ rotateX, rotateY, filter: `brightness(${brightness})` }}
                    className="w-full h-full rounded-2xl overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 bg-[#111]"
                >
                    {post.images && post.images.length > 0 ? (
                        <>
                            <img
                                src={post.images[currentImageIndex] || post.images[0]}
                                alt="Post"
                                className="w-full h-full object-cover scale-105"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                            {/* Navigation */}
                            {post.images.length > 1 && (
                                <>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10">
                                        {post.images.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-1 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-[#E2FF3B]' : 'w-1 bg-white/50'}`}
                                            />
                                        ))}
                                    </div>
                                    <div
                                        className="absolute inset-0 flex items-center justify-between p-2 opacity-0 hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button onClick={() => setCurrentImageIndex(p => p === 0 ? post.images.length - 1 : p - 1)} className="p-2 bg-black/50 rounded-full text-white backdrop-blur-sm hover:bg-black/70"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                                        <button onClick={() => setCurrentImageIndex(p => (p + 1) % post.images.length)} className="p-2 bg-black/50 rounded-full text-white backdrop-blur-sm hover:bg-black/70"><ChevronRight className="w-5 h-5" /></button>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#111] text-gray-500 gap-2">
                            <Activity className="w-10 h-10 opacity-20" />
                            <span className="text-xs font-mono uppercase">Telemetry Only</span>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Data Cards - Bento Grid Area 2 */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                <DataCard
                    label="MAX SPEED"
                    value={stats.maxSpeed}
                    unit="KM/H"
                    icon={Gauge}
                    delay={0.1}
                />
                <DataCard
                    label="DISTANCE"
                    value={stats.distance}
                    unit="KM"
                    icon={MapPin}
                    delay={0.2}
                />
                <RouteCard delay={0.3} />
            </div>

            {/* Content & Actions */}
            <div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 font-light">
                    <span className="text-white font-bold mr-2">{post.userName}</span>
                    {post.content}
                </p>

                <div className="border-t border-white/5 pt-4">
                    <PostActionsBar
                        post={post}
                        onCommentClick={onCommentClick}
                    />
                </div>
            </div>

        </motion.div>
    );
});

