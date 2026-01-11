import React, { useEffect, useState } from 'react';
import { Home, Search, Plus, Film, User, Zap, ShoppingBag, Map as MapIcon, Compass, Navigation, ShoppingCart, Wrench } from 'lucide-react';
import { ViewState, User as UserType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageProvider';

interface SidebarProps {
    currentView: ViewState;
    onNavigate: (view: ViewState) => void;
    isOpen: boolean;
    onClose: () => void;
    user: UserType | null;
    onOpenAuth: () => void;
    onOpenFeedback: () => void;
    onToggle: () => void;
    cartCount: number;
}

export const BottomNav: React.FC<SidebarProps> = ({
    currentView,
    onNavigate,
    user,
    onOpenAuth,
    cartCount
}) => {

    // Determine which tab is technically "active" for highlighting
    // If the user is on 'shop' or 'product-detail', we might highlight 'search' (explore) or similar logic if desired.
    // For now, simple mapping.
    const getActiveTab = () => {
        if (currentView === 'home') return 'home';
        if (currentView === 'shop' || currentView === 'product-detail') return 'shop';
        if (currentView === 'explore') return 'explore';
        if (currentView === 'ride-mode') return 'ride-mode';
        if (currentView === 'profile' || currentView === 'my-profile' || currentView === 'auth') return 'profile';
        // 'create' is a modal/action, usually doesn't stay highlighted unless it's a dedicated view
        return currentView;
    };

    const activeTab = getActiveTab();

    const navItems = [
        { id: 'home', icon: Home, label: 'Ana Sayfa', view: 'home' },
        { id: 'explore', icon: Compass, label: 'Keşfet', view: 'explore' },
        { id: 'create', icon: Plus, label: 'Oluştur', isFab: true },

        { id: 'shop', icon: ShoppingBag, label: 'Mağaza', view: 'shop' },
    ];

    const [isFabOpen, setIsFabOpen] = useState(false);

    const handleNavClick = (item: any) => {
        if (item.id === 'create') {
            setIsFabOpen(!isFabOpen);
        } else if (item.id === 'profile') {
            // Profile Removed
            // if (user) onNavigate('profile');
            // else onOpenAuth();
            // setIsFabOpen(false);
        } else {
            onNavigate(item.view);
            setIsFabOpen(false);
        }
    };

    const fabItems = [
        { id: 'ride', label: 'Sürüş Modu', icon: MapIcon, color: 'bg-green-500', view: 'ride-mode' },
        { id: 'reels', label: 'Reels', icon: Film, color: 'bg-pink-500', view: 'reels' },
        { id: 'post', label: 'Yeni Gönderi', icon: Plus, color: 'bg-blue-500', view: 'social-hub' },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-0 right-0 z-[140] flex justify-center pointer-events-none">
            {/* Create Menu Backdrop */}
            <AnimatePresence>
                {isFabOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsFabOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[-1] pointer-events-auto"
                    />
                )}
            </AnimatePresence>

            {/* Create Menu Items */}
            <AnimatePresence>
                {isFabOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute bottom-24 flex flex-col items-center gap-3 z-50 w-[200px] pointer-events-auto"
                    >
                        {[
                            { id: 'ride-mode', label: 'Sürüş Modu', icon: Navigation, color: 'text-moto-accent', view: 'ride-mode' },
                            { id: 'reels', label: 'Reels', icon: Film, color: 'text-pink-500', view: 'reels' },
                            { id: 'tools', label: 'Araçlar', icon: Wrench, color: 'text-yellow-500', view: 'mototool' },
                            { id: 'post', label: 'Yeni Gönderi', icon: Plus, color: 'text-blue-400', view: 'social-hub' }
                        ].map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onNavigate(item.view as any);
                                    setIsFabOpen(false);
                                }}
                                className="w-full bg-[#1A1A17]/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex items-center gap-3 shadow-xl active:scale-95 transition-transform"
                            >
                                <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center ${item.color}`}>
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <span className="text-white font-bold text-sm">{item.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Dock Container */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-[90%] max-w-[400px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-2 h-16 flex items-center justify-between pointer-events-auto relative overflow-hidden"
            >
                {/* Glass Reflection */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {navItems.map((item) => {
                    const isActive = activeTab === item.id;

                    // FAB (Center Item)
                    if (item.isFab) {
                        return (
                            <div key={item.id} className="flex justify-center flex-1">
                                <motion.button
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => handleNavClick(item)}
                                    animate={{ rotate: isFabOpen ? 45 : 0 }}
                                    className={`w-12 h-12 rounded-full ${isFabOpen ? 'bg-red-500' : 'bg-[#E2FF3B]'} text-black flex items-center justify-center shadow-[0_0_15px_rgba(226,255,59,0.4)] relative overflow-hidden group`}
                                >
                                    {/* Pulse Effect */}
                                    {!isFabOpen && <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />}
                                    <Plus className="w-6 h-6 relative z-10" strokeWidth={3} />
                                </motion.button>
                            </div>
                        )
                    }

                    // Standard Icon
                    return (
                        <motion.button
                            key={item.id}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => handleNavClick(item)}
                            className="flex-1 flex flex-col items-center justify-center h-full relative"
                        >
                            <div className="relative p-2">
                                <item.icon
                                    className={`w-5 h-5 transition-all duration-300 ${isActive
                                        ? 'text-[#E2FF3B] fill-[#E2FF3B]/10 drop-shadow-[0_0_8px_rgba(226,255,59,0.5)]'
                                        : 'text-zinc-500'
                                        }`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabDot"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#E2FF3B] rounded-full shadow-[0_0_4px_#E2FF3B]"
                                    />
                                )}
                            </div>
                        </motion.button>
                    )
                })}
            </motion.div>
        </div>
    );
};
