import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MoreVertical, MessageCircle, Settings, MapPin, Grid, Calendar, Map as MapIcon, Share2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { socialService } from '../../services/socialService';
import { useFollow } from '../../hooks/useFollow';
import { UserAvatar } from '../ui/UserAvatar';

// ... imports
import { User } from '../../types';

interface MobileProfileProps {
    userId?: string;
    username?: string;
    onNavigate?: (view: any, data?: any) => void; // align with App.tsx naming
    onBack?: () => void;
}

export const MobileProfile: React.FC<MobileProfileProps> = ({ userId, username: propUsername, onNavigate, onBack }) => {
    const { username: paramUsername } = useParams<{ username: string }>();
    const effectiveUsername = propUsername || paramUsername || userId;

    // Internal navigation helper to bridge gap if needed
    const safeNavigate = (path: string | number) => {
        if (typeof path === 'number' && path === -1) {
            if (onBack) onBack();
            else if (onNavigate) onNavigate('home');
        } else if (typeof path === 'string') {
            // Handle specific routes if needed, otherwise ignore or mapped
        }
    };

    // const navigate = useNavigate(); // We might not be in a router context for this app structure, relying on onNavigate from props mostly.
    const { user: currentUser } = useAuthStore();

    // State
    const [profileUser, setProfileUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'posts' | 'garage' | 'routes'>('posts');
    const [isFollowing, setIsFollowing] = useState(false);

    // Scroll Animations
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: containerRef });

    // Parallax logic (Adjusted for typical mobile scroll behavior)
    // Note: useScroll targeting containerRef works best if the container itself scrolls.
    // If window scrolls, we'd use no ref. Assuming main layout handles scroll or we are in a full-height overflow container.
    const headerHeight = 280;
    const backgroundY = useTransform(scrollY, [0, headerHeight], [0, headerHeight * 0.5]);
    const avatarScale = useTransform(scrollY, [0, 100], [1, 0.8]);
    const avatarY = useTransform(scrollY, [0, 100], [0, 20]);
    const blurAmount = useTransform(scrollY, [0, 200], [0, 10]);

    // Fetch Data
    useEffect(() => {
        const fetchProfile = async () => {
            if (!effectiveUsername && !userId) return;
            const lookupId = effectiveUsername || userId;

            setIsLoading(true);
            try {
                // Fetch profile data (which now includes posts)
                let data = await socialService.getUserProfile(lookupId!);

                // Fallback for "Me" if API fails or special handling needed
                if (!data && currentUser && (currentUser.username === effectiveUsername || currentUser._id === effectiveUsername || effectiveUsername === 'me')) {
                    // Since backend getProfile is updated, this might not be needed if API call succeeds.
                    // But keeps robust fallback.
                    // Note: socialService.getUserProfile creates the fetch call.
                }

                if (data) {
                    setProfileUser(data.user || data); // Handle potential data.user wrapper
                    setPosts(data.user?.posts || data.posts || []);

                    // Check follow status (if looking at someone else)
                    if (currentUser && data.user?.followers) {
                        const isFollowingBool = data.user.followers.some((f: any) =>
                            (typeof f === 'string' ? f : f._id) === currentUser._id
                        );
                        setIsFollowing(isFollowingBool);
                    }
                }
            } catch (error) {
                console.error('Profile Load Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [effectiveUsername, userId, currentUser]);

    // Live Follow Hook
    const { mutate: toggleFollow, isPending: isFollowPending } = useFollow();

    const handleFollow = () => {
        if (!currentUser || !profileUser) return;
        toggleFollow({ targetUserId: profileUser._id, isCurrentlyFollowing: isFollowing });
        setIsFollowing(!isFollowing); // Optimistic local toggle
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="w-8 h-8 border-2 border-moto-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!profileUser) {
        return <div className="min-h-screen bg-black text-white p-8 text-center pt-20">Kullanıcı bulunamadı.</div>;
    }

    const isOwnProfile = currentUser?._id === profileUser._id;

    return (
        <div ref={containerRef} className="h-screen overflow-y-auto bg-[#09090b] text-white scroll-smooth no-scrollbar">

            {/* --- HERO SECTION --- */}
            <div className="relative w-full h-[280px]">
                {/* Parallax Cover */}
                <motion.div
                    style={{ y: backgroundY, filter: `blur(${blurAmount}px)` }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src={profileUser.coverImage || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80"}
                        className="w-full h-full object-cover opacity-80"
                        alt="cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#09090b]" />
                </motion.div>

                {/* Navbar (Absolute) */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pt-12">
                    <button onClick={() => onBack ? onBack() : safeNavigate(-1)} className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/10">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    {isOwnProfile && (
                        <button className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/10">
                            <Settings className="w-5 h-5" />
                        </button>
                    )}
                    {!isOwnProfile && (
                        <button className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/10">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Avatar & Identity Overlap */}
                <motion.div
                    style={{ scale: avatarScale, y: avatarY }}
                    className="absolute -bottom-12 left-6 z-20"
                >
                    <div className="relative w-24 h-24 rounded-full border-[3px] border-moto-accent p-1 bg-[#09090b]">
                        <UserAvatar
                            src={profileUser.profileImage || profileUser.avatar}
                            name={profileUser.name}
                            size={86} // Inner size
                            className="w-full h-full rounded-full"
                        />
                        {profileUser.rank && (
                            <div className="absolute -bottom-2 -right-2 bg-moto-accent text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                {profileUser.rank}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* --- IDENTITY & BIO --- */}
            <div className="mt-14 px-6 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{profileUser.name}</h1>
                        <p className="text-gray-400 text-sm font-medium">@{profileUser.username || profileUser.name.toLowerCase().replace(/\s/g, '')}</p>
                    </div>

                    {/* Interaction Buttons */}
                    <div className="flex gap-2">
                        {isOwnProfile ? (
                            <button className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 font-bold text-sm backdrop-blur-md hover:bg-white/10 transition-all">
                                Profili Düzenle
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleFollow}
                                    disabled={isFollowPending}
                                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95
                                    ${isFollowing
                                            ? 'bg-zinc-800 text-gray-400 border border-white/5'
                                            : 'bg-moto-accent text-black shadow-moto-accent/20'}`}
                                >
                                    {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                                </button>
                                <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10">
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Bio */}
                {profileUser.bio && (
                    <p className="mt-4 text-gray-300 text-sm leading-relaxed font-light">
                        {profileUser.bio}
                    </p>
                )}

                {/* Location & Meta */}
                <div className="flex items-center gap-4 mt-4 text-gray-500 text-xs font-medium">
                    {profileUser.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-moto-accent" />
                            {profileUser.location}
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Katıldı: {profileUser.joinDate}
                    </div>
                </div>
            </div>

            {/* --- STATS DASHBOARD --- */}
            <div className="mt-8 px-4 grid grid-cols-3 gap-3">
                {[
                    { label: 'Takipçi', value: profileUser.followersCount || 0 },
                    { label: 'Takip', value: profileUser.followingCount || 0 },
                    { label: 'Sürüş', value: profileUser.totalRides || profileUser.posts?.length || 0 }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-white/10 transition-colors">
                        <span className="font-mono text-xl font-bold text-white mb-1">{stat.value}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* --- DIGITAL GARAGE --- */}
            {profileUser.garage && profileUser.garage.length > 0 && (
                <div className="mt-10 pl-6">
                    <div className="flex items-center justify-between pr-6 mb-4">
                        <h3 className="text-sm font-bold tracking-widest text-gray-400 flex items-center gap-2">
                            THE GARAGE <div className="h-[1px] w-8 bg-moto-accent" />
                        </h3>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 pr-6">
                        {profileUser.garage.map((bike: any, i: number) => (
                            <div key={i} className="flex-shrink-0 w-64 aspect-[16/9] relative rounded-xl overflow-hidden group border border-white/10">
                                <img src={bike.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                <div className="absolute bottom-3 left-3">
                                    <div className="text-white font-bold text-sm">{bike.brand} {bike.model}</div>
                                    <div className="text-moto-accent text-xs font-mono">{bike.year}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- CONTENT TABS --- */}
            <div className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-xl mt-8 border-b border-white/10">
                <div className="flex">
                    {[
                        { id: 'posts', icon: Grid, label: 'Gönderiler' },
                        { id: 'garage', icon: MapIcon, label: 'Rota' }, // Repurposing garage tab logic if needed, or keeping simpler
                        { id: 'routes', icon: Share2, label: 'Tag' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors relative
                            ${activeTab === tab.id ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 w-12 h-1 bg-moto-accent rounded-t-full"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- CONTENT GRID --- */}
            <div className="min-h-[500px] bg-[#09090b]">
                {activeTab === 'posts' && (
                    <div className="p-1">
                        {posts.length > 0 ? (
                            <div className="columns-2 xs:columns-3 gap-1 space-y-1">
                                {posts.map((post, i) => (
                                    <motion.div
                                        key={post._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="relative aspect-[4/5] bg-[#111] overflow-hidden group cursor-pointer"
                                        onClick={() => onNavigate && onNavigate('post-detail', { postId: post._id })} // Or open modal
                                    >
                                        <img
                                            src={post.images?.[0] || post.mediaUrl || post.image}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        {post.images && post.images.length > 1 && (
                                            <div className="absolute top-2 right-2">
                                                <Grid className="w-4 h-4 text-white drop-shadow-md" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-gray-500 flex flex-col items-center">
                                <Grid className="w-12 h-12 mb-4 opacity-20" />
                                <p>Henüz gönderi yok.</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab !== 'posts' && (
                    <div className="py-20 text-center text-gray-500">
                        <p>Bu özellik yakında geliyor.</p>
                    </div>
                )}
            </div>

            {/* Bottom Padding for Nav */}
            <div className="h-20" />
        </div>
    );
};

export default MobileProfile;
