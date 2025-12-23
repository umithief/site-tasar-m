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
                className="fixed top-0 left-0 right-0 z-[130] bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 pt-safe-top pb-3 md:hidden"
                initial={{ y: 0 }}
                animate={{ y: showTopBar ? 0 : -100 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center justify-between h-12">
                    {/* Logo */}
                    <div className="flex items-center gap-2" onClick={() => onNavigate('home')}>
                        <div className="w-8 h-8 bg-moto-accent rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-black fill-current" />
                        </div>
                        <span className="font-display font-black text-lg tracking-tight">
                            MOTO<span className="text-moto-accent">VIBE</span>
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button className="relative">
                            <Bell className="w-6 h-6 text-white" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-black"></span>
                        </button>
                        <button onClick={() => onNavigate('forum')}>
                            <MessageCircle className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* --- MAIN CONTENT --- */}
            <main className="pt-[70px] px-0 md:pt-0">
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
