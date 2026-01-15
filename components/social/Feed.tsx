import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SocialPost, User } from '../../types';
import { socialService } from '../../services/socialService';
import { PostCard } from './PostCard';
import { MapPin, Navigation, User as UserIcon, Gauge, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ThemeToggle } from '../ui/ThemeToggle';

interface FeedProps {
    onNavigate?: (view: any) => void;
}

export const Feed: React.FC<FeedProps> = ({ onNavigate }) => {
    const { user: currentUser } = useAuthStore();
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const fetchedPosts = await socialService.getFeed();
                setPosts(fetchedPosts);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-0 py-8 relative">
            {/* Theme Toggle - In flow for mobile, absolute for desktop */}
            <div className="flex justify-end mb-4 xl:absolute xl:top-8 xl:right-[-60px] xl:mb-0 z-40">
                <ThemeToggle />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ... rest of the grid */}

                {/* LEFT SIDEBAR - Profile Summary (Desktop Only) */}
                <div className="hidden lg:col-span-3 lg:block">
                    <div className="sticky top-24 space-y-6">
                        {currentUser ? (
                            <div className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-lg dark:shadow-none transition-colors duration-300">
                                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-100 dark:from-[#E2FF3B]/10 to-transparent opacity-50" />

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-full border-2 border-gray-200 dark:border-[#E2FF3B] p-1 mb-4 shadow-sm dark:shadow-[0_0_20px_rgba(226,255,59,0.3)] bg-white dark:bg-transparent">
                                        <img
                                            src={currentUser.avatar || 'https://via.placeholder.com/150'}
                                            alt={currentUser.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                    <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-1">{currentUser.name}</h2>
                                    <p className="text-sm text-gray-500 mb-6">{currentUser.rank || 'Motosiklet Tutkunu'}</p>

                                    <div className="grid grid-cols-2 gap-4 w-full mb-6">
                                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex flex-col items-center">
                                            <Gauge className="w-5 h-5 text-black dark:text-[#E2FF3B] mb-2" />
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">{currentUser.points || 0}</span>
                                            <span className="text-[10px] text-gray-500 uppercase">SÜRÜŞ PUANI</span>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex flex-col items-center">
                                            <Navigation className="w-5 h-5 text-blue-500 dark:text-blue-400 mb-2" />
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">0</span>
                                            <span className="text-[10px] text-gray-500 uppercase">TOPLAM KM</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onNavigate && onNavigate('profile')}
                                        className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-gray-800 dark:hover:bg-[#E2FF3B] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <UserIcon className="w-4 h-4" />
                                        PROFİLİ GÖRÜNTÜLE
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 rounded-3xl p-6 text-center shadow-lg dark:shadow-none">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">Giriş yap ve istatistiklerini gör.</p>
                                <button onClick={() => onNavigate && onNavigate('auth')} className="text-black dark:text-[#E2FF3B] font-bold text-sm underline decoration-2 decoration-moto-accent">Giriş Yap</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* CENTER - Feed Content */}
                <div className="col-span-1 lg:col-span-6">
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-6"
                    >
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="w-full h-96 bg-gray-100 dark:bg-[#0A0A0A] rounded-3xl animate-pulse" />
                            ))
                        ) : posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    onComment={(id) => console.log('Comment', id)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                Henüz gönderi yok. İlk paylaşımı sen yap!
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* RIGHT SIDEBAR - Popular Routes (Desktop Only) */}
                <div className="hidden lg:col-span-3 lg:block">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-lg dark:shadow-none transition-colors duration-300">
                            <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-black dark:text-[#E2FF3B]" />
                                POPÜLER ROTALAR
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { name: "Şile Virajları", dist: "85 KM", diff: "Zor", img: "https://images.unsplash.com/photo-1563536310477-c7b4e3a800c2" },
                                    { name: "Riva Sahil Yolu", dist: "42 KM", diff: "Orta", img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800" },
                                    { name: "Kilyos Orman Yolu", dist: "34 KM", diff: "Kolay", img: "https://images.unsplash.com/photo-1448375240586-dfd8f3793371" }
                                ].map((route, i) => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="relative h-24 rounded-2xl overflow-hidden mb-2">
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                                            <img src={route.img} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" alt={route.name} />
                                            <div className="absolute bottom-2 left-2 z-20 flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${route.diff === 'Zor' ? 'bg-red-500/80' :
                                                    route.diff === 'Orta' ? 'bg-orange-500/80' : 'bg-green-500/80'
                                                    } text-white`}>
                                                    {route.diff}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-gray-900 dark:text-white font-bold text-sm group-hover:text-black dark:group-hover:text-[#E2FF3B] transition-colors">{route.name}</h4>
                                                <p className="text-xs text-gray-500">{route.dist}</p>
                                            </div>
                                            <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-black dark:group-hover:bg-[#E2FF3B] group-hover:text-white dark:group-hover:text-black transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
