import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Hash, TrendingUp, Grid, Image, User, Heart, MessageSquare, Play, ShoppingBag, Bike } from 'lucide-react';
import { socialService } from '../../services/socialService';
import { SocialPost, ViewState } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { VibeButton } from '../ui/VibeButton';

interface ExploreFeedProps {
    onNavigate?: (view: ViewState, data?: any) => void;
    isEmbedded?: boolean;
}

export const ExploreFeed: React.FC<ExploreFeedProps> = ({ onNavigate, isEmbedded = false }) => {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('trending');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Fetch posts, ideally an explore endpoint, but using getPosts for now
                const data = await socialService.getExploreFeed(1);
                const shuffled = data.sort(() => 0.5 - Math.random());
                setPosts(shuffled);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [filter]);

    const filteredPosts = posts.filter(p => !searchQuery || p.content.toLowerCase().includes(searchQuery.toLowerCase()) || p.userName.toLowerCase().includes(searchQuery.toLowerCase()));

    const categories = [
        { id: 'trending', label: 'Trendler', icon: TrendingUp, color: 'text-moto-accent' },
        { id: 'garage', label: 'Garaj', icon: Bike, color: 'text-orange-500' },
        { id: 'marketplace', label: 'İlanlar', icon: ShoppingBag, color: 'text-purple-500' },
        { id: 'vlog', label: 'MotoVlog', icon: Play, color: 'text-red-500' },
        { id: 'photos', label: 'Fotoğraflar', icon: Image, color: 'text-blue-400' },
    ];

    return (
        <div className={`bg-[#09090b] min-h-screen text-white font-sans ${isEmbedded ? '' : 'pt-24'}`}>
            <div className={`grid grid-cols-1 ${isEmbedded ? 'lg:grid-cols-[280px_1fr] h-full gap-6' : 'lg:grid-cols-[320px_1fr] max-w-[1600px] mx-auto px-4 lg:px-8 gap-8'} items-start`}>

                {/* SIDEBAR */}
                <div className={`flex flex-col gap-6 ${isEmbedded ? 'h-full overflow-hidden' : 'sticky top-28'}`}>
                    <div className="bg-[#111] border border-white/5 rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl flex flex-col h-fit">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-moto-accent/20 to-transparent border border-moto-accent/20 flex items-center justify-center text-moto-accent shadow-[0_0_20px_rgba(255,215,0,0.1)]">
                                <Hash className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black font-display italic tracking-tighter text-white">KEŞFET</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Akış</p>
                            </div>
                        </div>

                        <div className="relative mb-8 group/search">
                            <div className="absolute inset-0 bg-moto-accent/5 rounded-xl blur-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity" />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/search:text-moto-accent transition-colors z-10" />
                            <input
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Keşfet..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-sm focus:outline-none focus:border-moto-accent/50 transition-all font-bold placeholder:text-gray-700 relative z-0"
                            />
                        </div>

                        <div className="space-y-2">
                            {categories.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setFilter(item.id)}
                                    className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all border group relative overflow-hidden ${filter === item.id
                                            ? 'bg-white/5 border-moto-accent/30 text-white'
                                            : 'bg-transparent border-transparent hover:bg-white/5 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {filter === item.id && (
                                        <motion.div layoutId="activeFilter" className="absolute inset-0 bg-gradient-to-r from-moto-accent/10 to-transparent opacity-50" />
                                    )}
                                    <div className={`relative z-10 p-2 rounded-lg ${filter === item.id ? 'bg-black/40' : 'bg-white/5 group-hover:bg-white/10'} transition-colors`}>
                                        <item.icon className={`w-4 h-4 ${item.color}`} />
                                    </div>
                                    <span className="relative z-10 font-bold text-sm">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Popular Tags */}
                        <div className="mt-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Popüler Etiketler</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['#YamahaR25', '#GeceSürüşü', '#MotoVlog', '#PistGünü', '#Garaj', '#Bakım', '#İnceleme'].map(tag => (
                                    <span key={tag} className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-lg text-[10px] font-bold text-gray-400 hover:text-white cursor-pointer border border-white/5 hover:border-moto-accent/30 transition-all">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div className="bg-[#111] rounded-[2.5rem] border border-white/5 p-6 min-h-[80vh] shadow-2xl relative overflow-hidden">
                    {/* Ambient Glow */}
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-moto-accent/5 rounded-full blur-[120px] pointer-events-none" />

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                            <div className="w-12 h-12 rounded-full border-2 border-moto-accent border-t-transparent animate-spin" />
                            <p className="text-xs font-bold text-gray-600 animate-pulse uppercase tracking-widest">Akış Yükleniyor...</p>
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
                            <AnimatePresence>
                                {filteredPosts.map((post, i) => (
                                    <motion.div
                                        key={post._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05, type: 'spring', stiffness: 100 }}
                                        className="break-inside-avoid group bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-moto-accent/30 transition-all cursor-pointer relative shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:shadow-moto-accent/10"
                                    >
                                        {post.images && post.images.length > 0 ? (
                                            <div className="relative aspect-[4/5] overflow-hidden">
                                                <img src={post.images[0]} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                                                    <div className="bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-moto-accent hover:text-black transition-colors">
                                                        <Heart className="w-4 h-4" />
                                                    </div>
                                                </div>

                                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-0.5 bg-gradient-to-tr from-moto-accent to-transparent rounded-full">
                                                            <UserAvatar src={post.userAvatar} name={post.userName} size={32} className="border-2 border-black" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-sm text-white leading-tight shadow-black drop-shadow-md">{post.userName}</h4>
                                                            <p className="text-[10px] text-gray-300 font-mono opacity-80">2s önce</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-200 line-clamp-2 font-medium leading-relaxed drop-shadow-md">{post.content}</p>

                                                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-white"><Heart className="w-3.5 h-3.5 text-moto-accent fill-moto-accent" /> {post.likes}</span>
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-300"><MessageSquare className="w-3.5 h-3.5" /> {post.comments}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-6 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-moto-accent/5 rounded-bl-full -mr-4 -mt-4" />
                                                <div className="flex items-center gap-3 mb-4">
                                                    <UserAvatar src={post.userAvatar} name={post.userName} size={40} className="ring-2 ring-white/5" />
                                                    <div>
                                                        <h4 className="font-bold text-sm text-white">{post.userName}</h4>
                                                        <p className="text-[10px] text-gray-500 font-mono">Just Now</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-300 font-medium leading-relaxed mb-4">{post.content}</p>
                                                <div className="flex items-center gap-4 text-gray-500">
                                                    <span className="flex items-center gap-1.5 text-xs font-bold hover:text-moto-accent transition-colors"><Heart className="w-4 h-4" /> {post.likes}</span>
                                                    <span className="flex items-center gap-1.5 text-xs font-bold hover:text-white transition-colors"><MessageSquare className="w-4 h-4" /> {post.comments}</span>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 opacity-60">
                            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center rotate-3 border border-white/10">
                                <Search className="w-10 h-10 text-gray-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Sonuç Bulunamadı</h3>
                                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">Aradığın kriterlere uygun içerik şu an mevcut değil. Başka bir şey aramayı dene.</p>
                            </div>
                            <VibeButton variant="outline" onClick={() => { setFilter('trending'); setSearchQuery(''); }}>
                                Filtreleri Temizle
                            </VibeButton>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
