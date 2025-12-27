import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, MessageCircle } from 'lucide-react';
import { BottomNav } from '../layout/BottomNav';
import { ViewState, User } from '../../types';

interface MobileLayoutProps {
    children: React.ReactNode;
    currentView: ViewState;
    onNavigate: (view: ViewState) => void;
    user: User | null;
    cartCount: number;
    onOpenAuth: () => void;
    onOpenFeedback: () => void;
    onToggleTheme?: () => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
    children,
    currentView,
    onNavigate,
    user,
    cartCount,
    onOpenAuth,
    onOpenFeedback,
    onToggleTheme
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showTopBar, setShowTopBar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Hide Top Bar on Scroll
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 100) {
                if (currentScrollY > lastScrollY) {
                    setShowTopBar(false); // Scrolling down
                } else {
                    setShowTopBar(true); // Scrolling up
                }
            } else {
                setShowTopBar(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <div className="min-h-screen bg-black text-white pb-24 md:pb-0">
            {/* --- TOP APP BAR --- */}
            <motion.div
                className="fixed top-0 left-0 right-0 z-[130] bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 pt-safe-top pb-3 md:hidden transition-transform duration-300"
                initial={{ y: 0 }}
                animate={{ y: showTopBar ? 0 : -100 }}
            >
                <div className="flex items-center justify-between h-12">
                    {/* Logo */}
                    <div className="flex items-center gap-2" onPress={() => onNavigate('home')}>
                        <span className="font-display font-black text-xl tracking-tighter text-white">
                            MOTO<span className="text-moto-accent">VIBE</span>
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <button className="relative w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 transition-all active:scale-95">
                            <Bell className="w-5 h-5 text-gray-200" />
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-moto-accent rounded-full animate-pulse"></span>
                        </button>
                        {/* Direct Messages */}
                        <button onClick={() => onNavigate('forum')} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 transition-all active:scale-95">
                            <MessageCircle className="w-5 h-5 text-gray-200" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* --- MAIN CONTENT --- */}
            <main className="pt-[80px] px-0 md:pt-0 pb-20 overflow-x-hidden w-full relative">
                {children}
            </main>

            {/* --- BOTTOM NAV --- */}
            <BottomNav
                currentView={currentView}
                onNavigate={onNavigate}
                cartCount={cartCount}
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                user={user}
                onOpenAuth={onOpenAuth}
                onOpenFeedback={onOpenFeedback}
                onToggle={() => setIsMenuOpen(!isMenuOpen)}
                onOpenThemeModal={onToggleTheme}
            />
        </div>
    );
};
