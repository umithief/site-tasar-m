import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Hash, User, ArrowRight } from 'lucide-react';
import { socialService } from '../../services/socialService';
import { UserAvatar } from '../ui/UserAvatar';
import { useAuthStore } from '../../store/authStore';

import { SocialProfile } from '../../types';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: string, data?: any) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onNavigate }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ users: any[], hashtags: string[] }>({ users: [], hashtags: [] });
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { user: currentUser } = useAuthStore();

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 1) {
                setIsLoading(true);
                const data = await socialService.search(query);
                setResults(data);
                setIsLoading(false);
            } else {
                setResults({ users: [], hashtags: [] });
            }
        }, 400); // 400ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-[#0a0a0a] z-[150] flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4 pt-12 md:pt-4 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ara (Kullanıcı, Hashtag...)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:bg-white/10 focus:border-moto-accent/50 outline-none transition-all"
                            />
                            {isLoading && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-moto-accent border-t-transparent rounded-full animate-spin" />
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-white hover:text-moto-accent transition-colors"
                        >
                            İptal
                        </button>
                    </div>

                    {/* Results */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Users */}
                        {results.users.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Kullanıcılar</h3>
                                {results.users.map((user: any) => (
                                    <motion.button
                                        key={user._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => {
                                            onNavigate('public-profile', user._id);
                                            onClose();
                                        }}
                                        className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all text-left group"
                                    >
                                        <UserAvatar name={user.name} src={user.avatar} size={40} className="ring-2 ring-transparent group-hover:ring-moto-accent/50 transition-all" />
                                        <div className="flex-1">
                                            <div className="font-bold text-white group-hover:text-moto-accent transition-colors">{user.name}</div>
                                            <div className="text-xs text-gray-500">@{user.username || user.name.toLowerCase().replace(/\s/g, '')}</div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* Hashtags */}
                        {results.hashtags.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Etiketler</h3>
                                <div className="flex flex-wrap gap-3">
                                    {results.hashtags.map((tag, idx) => (
                                        <motion.button
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            onClick={() => {
                                                // Handle hashtag click (e.g., filter explore)
                                                // For now just close
                                                onClose();
                                            }}
                                            className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm text-gray-300 hover:text-white hover:border-moto-accent hover:bg-moto-accent/20 transition-all flex items-center gap-2"
                                        >
                                            <Hash className="w-3 h-3 text-moto-accent" />
                                            {tag}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent / Empty State */}
                        {!query && (
                            <div className="text-center py-20 text-gray-600">
                                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>Sürücüler ve etiketler arasında arama yapın.</p>
                            </div>
                        )}

                        {query && !isLoading && results.users.length === 0 && results.hashtags.length === 0 && (
                            <div className="text-center py-20 text-gray-600">
                                <p>Sonuç bulunamadı.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
