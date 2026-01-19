import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Map, Compass, Bike, ShoppingBag, User, Shield, LayoutGrid } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ViewState } from '../../types';

interface SidebarProps {
    activeView: ViewState;
    onNavigate: (view: ViewState) => void;
    // Keeping other props optional to avoid breaking existing usages in App.tsx
    isOpen?: boolean;
    isMobile?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
    const { user } = useAuthStore();

    const navItems = [
        { id: 'home', icon: Home, label: 'Akış' },
        { id: 'map', icon: Map, label: 'Canlı Harita' },
        { id: 'routes', icon: Compass, label: 'Rotalar' },
        { id: 'showcase', icon: LayoutGrid, label: 'Vitrin' }, // Added Vitrin
        { id: 'garage', icon: Bike, label: 'Garaj' },
        { id: 'shop', icon: ShoppingBag, label: 'Mağaza' },
        { id: 'profile', icon: User, label: 'Profil' },
    ];

    if (user?.isAdmin) {
        navItems.push({ id: 'admin', icon: Shield, label: 'Admin Panel' });
    }

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed left-6 top-1/2 -translate-y-1/2 h-auto z-50 flex flex-col items-center"
        >
            {/* GLASS RAIL CONTAINER */}
            <div className="bg-white/80 backdrop-blur-2xl border border-gray-200 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] py-8 px-4 flex flex-col gap-8 items-center">

                {navItems.map((item) => {
                    const isActive = activeView === item.id || (item.id === 'home' && !activeView); // Default to home if undefined?
                    const isStrictActive = activeView === item.id;

                    return (
                        <NavItem
                            key={item.id}
                            item={item}
                            isActive={isStrictActive}
                            onClick={() => onNavigate(item.id as ViewState)}
                        />
                    );
                })}

            </div>
        </motion.div>
    );
};

const NavItem = ({ item, isActive, onClick }: { item: any, isActive: boolean, onClick: () => void }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="relative flex items-center justify-center group">

            {/* ACTIVE INDICATOR (NEON GLOW BEHIND) */}
            {isActive && (
                <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-[#E2FF3B] blur-xl opacity-40 rounded-full"
                    transition={{ duration: 0.3 }}
                />
            )}

            {/* BUTTON */}
            <motion.button
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                className={`relative z-10 p-2 rounded-full transition-colors duration-300 ${isActive ? 'text-[#E2FF3B]' : 'text-gray-400 group-hover:text-white'
                    }`}
            >
                <item.icon
                    className={`w-6 h-6 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(226,255,59,0.8)]' : ''}`}
                    strokeWidth={isActive ? 2.5 : 2}
                />

                {/* ACTIVE PILL INDICATOR (Small vertical bar on left?) - User asked for "Vertical Neon Pill" OR "Soft Glow". 
                    Let's stick to the soft glow behind + maybe a small dot? 
                    Actually, let's add a small dot instead of a vertical bar to keep it pill-shaped friendly.
                */}
            </motion.button>

            {/* TOOLTIP */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 20, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-full bg-gray-900 backdrop-blur-md border border-gray-800 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xl whitespace-nowrap z-50 pointer-events-none"
                    >
                        {item.label}
                        {/* Little triangle pointer */}
                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900/80 border-l border-t border-white/10 transform -rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

