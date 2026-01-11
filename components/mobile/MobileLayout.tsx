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
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
    children,
    currentView,
    onNavigate,
    user,
    cartCount,
    onOpenAuth,
    onOpenFeedback
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
        <div
            className="min-h-screen bg-black text-white pb-24 md:pb-0"
            style={{
                '--mobile-header-height': showTopBar ? '60px' : '0px',
                '--mobile-header-translate': showTopBar ? '0px' : '-100px'
            } as React.CSSProperties}
        >
            {/* --- TOP APP BAR --- */}
            <motion.div
                className="fixed top-0 left-0 right-0 z-[130] pointer-events-none px-6 pt-safe-top pt-4 md:hidden"
                initial={{ opacity: 0, y: -20 }}
                animate={{
                    opacity: showTopBar ? 1 : 0,
                    y: showTopBar ? 0 : -20,
                    pointerEvents: showTopBar ? 'auto' : 'none'
                }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center justify-between">
                    {/* Logo (Left) */}
                    <div className="pointer-events-auto" onClick={() => onNavigate('home')}>
                        <span className="font-display font-black text-2xl tracking-tighter text-white drop-shadow-xl italic">
                            MOTO<span className="text-[#E2FF3B]">VIBE</span>
                        </span>
                    </div>

                    {/* Actions (Right - Glass Containers) */}
                    <div className="flex items-center gap-3 pointer-events-auto">
                        {/* Notifications */}
                        <button className="relative w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg active:scale-90 transition-all">
                            <Bell className="w-5 h-5 text-white" />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-[#E2FF3B] rounded-full animate-pulse shadow-[0_0_8px_#E2FF3B]"></span>
                        </button>
                        {/* Messages */}
                        <button onClick={() => onNavigate('forum')} className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg active:scale-90 transition-all">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* --- MAIN CONTENT --- */}
            <main className="pt-[60px] px-0 md:pt-0 pb-20 overflow-x-hidden w-full relative transition-[padding] duration-300">
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

            />
        </div>
    );
};
