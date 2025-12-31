import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Hash, TrendingUp, Grid, Image, User, Heart, MessageSquare } from 'lucide-react';
import { socialService } from '../../services/socialService';
import { SocialPost, ViewState } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';

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
                const data = await socialService.getPosts(1);
                // Shuffle for "explore" feel
                const shuffled = data.posts.sort(() => 0.5 - Math.random());
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

    return (
        <div className={`bg-[#09090b] min-h-screen text-white font-sans ${isEmbedded ? '' : 'pt-24'}`}>
            <div className={`grid grid-cols-1 ${isEmbedded ? 'lg:grid-cols-[280px_1fr] h-full gap-6' : 'lg:grid-cols-[320px_1fr] max-w-[1600px] mx-auto px-4 lg:px-8 gap-8'} items-start`}>

                {/* SIDEBAR */}
                <div className={`flex flex-col gap-6 ${isEmbedded ? 'h-full overflow-hidden' : 'sticky top-28'}`}>
                    <div className="bg-[#111] border border-white/5 rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl flex flex-col h-fit">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-moto-accent/10 flex items-center justify-center text-moto-accent"><Hash className="w-5 h-5" /></div>
                            <h2 className="text-2xl font-black font-display italic tracking-tighter">KEŞFET</h2>
                        </div>

                        <div className="relative mb-6 group/search">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/search:text-moto-accent transition-colors" />
                            <input
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Keşfet..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-moto-accent/50 transition-all font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            {[
                                { id: 'trending', label: 'Trendler', icon: TrendingUp },
                                { id: 'latest', label: 'En Yeniler', icon: Grid },
                                { id: 'photos', label: 'Fotoğraflar', icon: Image },
                                { id: 'riders', label: 'Sürücüler', icon: User }
                            ].map(item => (
                                <button key={item.id} onClick={() => setFilter(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${filter === item.id ? 'bg-moto-accent text-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                    <item.icon className="w-4 h-4" />
                                    <span className="text-sm">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Popular Tags */}
                        <div className="mt-8">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">POPÜLER ETİKETLER</h3>
                            <div className="flex flex-wrap gap-2">
                                {['#YamahaR25', '#GeceSürüşü', '#MotoVlog', '#PistGünü', '#Garaj', '#Bakım'].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-gray-300 cursor-pointer border border-transparent hover:border-white/10 transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div className="bg-[#111] rounded-[2.5rem] border border-white/5 p-6 min-h-[80vh] shadow-2xl relative">
                    {loading ? (
                        <div className="flex justify-center items-center h-40"><div className="w-8 h-8 rounded-full border-2 border-moto-accent border-t-transparent animate-spin" /></div>
                    ) : (
                        <div className="columns-1 md:columns-2 xl:columns-3 gap-4 space-y-4">
                            {filteredPosts.map((post, i) => (
                                <motion.div
                                    key={post._id}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className="break-inside-avoid bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 group hover:border-moto-accent/30 transition-all cursor-pointer relative"
                                >
                                    {post.image && (
                                        <div className="relative">
                                            <img src={post.image} className="w-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                <div className="flex items-center gap-4 text-white">
                                                    <span className="flex items-center gap-1 text-xs font-bold"><Heart className="w-4 h-4 text-moto-accent fill-moto-accent" /> {post.likes}</span>
                                                    <span className="flex items-center gap-1 text-xs font-bold"><MessageSquare className="w-4 h-4" /> {post.comments}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-4">
                                        {!post.image && <p className="text-sm text-gray-300 mb-3 font-medium line-clamp-4">{post.content}</p>}
                                        <div className="flex items-center gap-2 mt-2">
                                            <UserAvatar src={post.userAvatar} name={post.userName} size={24} />
                                            <span className="text-xs font-bold text-gray-400 truncate">{post.userName}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
