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
    const [isAtTop, setIsAtTop] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Hide Top Bar on Scroll
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollThreshold = 60; // Approximate header height

            setIsAtTop(currentScrollY < scrollThreshold);

            if (currentScrollY > scrollThreshold) {
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

    // Calculate header offset for children (sticky tabs)
    // If we are at the top, header is absolute/part of flow, so offset is 0 for sticky calculations relative to viewport? 
    // No, if I want tabs to stick BELOW the header when it's visible (scrolling up), I need 60px.
    // If I'm strictly at the top, the header occupies space. The sticky element is naturally below it. sticky top-0 will catch it at 0.
    // So 0px is correct for 'isAtTop'. 
    // When 'fixed' and 'visible', we need 60px.
    const isImmersive = currentView === 'ride-mode' || currentView === 'create';
    const headerHeightVar = (!isAtTop && showTopBar && !isImmersive) ? '60px' : '0px';

    return (
        <div
            className="min-h-screen bg-black text-white pb-24 md:pb-0"
            style={{
                '--mobile-header-height': headerHeightVar,
            } as React.CSSProperties}
        >
            {/* --- TOP APP BAR --- */}
            {!isImmersive && (
                <motion.div
                    className={`top-0 left-0 right-0 z-[130] px-6 pt-safe-top pt-4 md:hidden will-change-transform transform-gpu ${isAtTop ? 'absolute' : 'fixed backdrop-blur-md bg-black/80 border-b border-white/5'}`}
                    initial={{ y: 0 }}
                    animate={{
                        y: (isAtTop || showTopBar) ? 0 : -100,
                    }}
                    transition={{ duration: 0.3, ease: 'circOut' }}
                >
                    <div className="flex items-center justify-between h-[44px]"> {/* Explicit Height */}
                        {/* Logo (Left) */}
                        <div className="pointer-events-auto" onClick={() => onNavigate('home')}>
                            <span className="font-display font-black text-2xl tracking-tighter text-white drop-shadow-xl italic">
                                MOTO<span className="text-[#E2FF3B]">VIBE</span>
                            </span>
                        </div>

                        {/* Actions (Right - Glass Containers) */}
                        <div className="flex items-center gap-3 pointer-events-auto">
                            {/* Notifications */}
                            <button className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg active:scale-90 transition-all">
                                <Bell className="w-5 h-5 text-white" />
                                <span className="absolute top-2.5 right-3 w-1.5 h-1.5 bg-[#E2FF3B] rounded-full animate-pulse shadow-[0_0_8px_#E2FF3B]"></span>
                            </button>
                            {/* Messages */}
                            <button onClick={() => onNavigate('forum')} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg active:scale-90 transition-all">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* --- MAIN CONTENT --- */}
            {/* When absolute, we need padding to push content down? Header is absolute top-0. Content starts at top-0. */}
            {/* Yes, we need padding top equal to header height + safe area. */}
            <main className={`${isImmersive ? 'pt-0 pb-0' : 'pt-[80px] pb-20'} px-0 md:pt-0 w-full transition-[padding] duration-300`}>
                {children}
            </main>

            {/* --- BOTTOM NAV --- */}
            {!isImmersive && (
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
            )}
        </div>
    );
};
