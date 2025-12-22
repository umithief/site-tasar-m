import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Zap, Clock } from 'lucide-react';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSearch }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => inputRef.current?.focus(), 300);
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
            onClose();
        }
    };

    const trendingKeywords = ['KASK', 'EGZOZ', 'ELDİVEN', 'YAMAHA R1', 'MOTUL', 'DERİ MONT'];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[150] flex flex-col items-center justify-start pt-[15vh] px-6"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-[#050505]/80 backdrop-blur-3xl"
                        onClick={onClose}
                    />

                    {/* Search Container */}
                    <motion.div
                        initial={{ y: 20, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 10, opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-3xl"
                    >
                        <form onSubmit={handleSubmit} className="relative group">
                            <div className="absolute inset-x-0 -bottom-2 h-[1px] bg-white/10 group-focus-within:bg-orange-500 transition-colors" />
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-white/40 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="COMMAND CENTER: ARA..."
                                className="w-full bg-transparent border-none outline-none py-6 pl-14 pr-14 text-3xl font-bold tracking-tight text-white placeholder-white/20 uppercase"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>
                        </form>

                        {/* Quick Actions / Trending */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="flex items-center gap-2 mb-6 text-orange-500/80 font-bold tracking-widest text-xs">
                                    <TrendingUp className="w-4 h-4" />
                                    TRENDING NOW
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {trendingKeywords.map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => setQuery(tag)}
                                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold text-white/60 hover:text-orange-500 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="flex items-center gap-2 mb-6 text-white/40 font-bold tracking-widest text-xs uppercase">
                                    <Clock className="w-4 h-4" />
                                    Recent Searches
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-white/60 hover:text-white cursor-pointer group">
                                        <span className="font-medium">Shoei X-Spirit III</span>
                                        <Zap className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500" />
                                    </div>
                                    <div className="flex items-center justify-between text-white/60 hover:text-white cursor-pointer group">
                                        <span className="font-medium">Akrapovic Slip-On</span>
                                        <Zap className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
