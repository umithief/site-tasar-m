import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
    Home, Compass, Zap, ShoppingBag, Map,
    Warehouse, Heart, Settings, User, LogOut,
    ChevronRight, Layers, Menu
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ViewState } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';

interface MotovibeSidebarProps {
    activeView: ViewState;
    onNavigate: (view: ViewState) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    className?: string; // Allow external positioning classes
}

export const MotovibeSidebar: React.FC<MotovibeSidebarProps> = ({
    activeView,
    onNavigate,
    isExpanded,
    onToggleExpand,
    className
}) => {
    const { user, logout } = useAuthStore();
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Menu Structure
    const menuGroups = [
        {
            title: 'MAIN',
            items: [
                { id: 'home', icon: Home, label: 'Feed' },
                { id: 'showcase', icon: Layers, label: 'Showcase' }, // Added Showcase
                { id: 'explore', icon: Compass, label: 'Explore' },
                { id: 'reels', icon: Zap, label: 'Velocity Reels' },
                { id: 'shop', icon: ShoppingBag, label: 'Premium Shop' },
                { id: 'routes', icon: Map, label: 'Routes' },
            ]
        },
        {
            title: 'PERSONAL',
            items: [
                { id: 'favorites', icon: Heart, label: 'Favorites' },
                { id: 'settings', icon: Settings, label: 'Settings' },
            ]
        }
    ];

    return (
        <motion.aside
            layout
            className={`hidden md:flex flex-col h-screen fixed left-0 top-0 z-[1000] bg-black/95 backdrop-blur-2xl border-r border-white/5 ${className}`}
            initial={false}
            animate={{ width: isExpanded ? 260 : 80 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* 1. Header (Logo / Menu Toggle) */}
            <div className="h-20 flex items-center justify-center relative">
                <button
                    onClick={onToggleExpand}
                    className="absolute left-[22px] p-2 rounded-full hover:bg-white/5 transition-colors text-white/80 hover:text-white"
                >
                    <Menu strokeWidth={1} className="w-6 h-6" />
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="ml-12 font-display font-black text-xl tracking-[0.2em] text-white"
                        >
                            MOTO<span className="text-orange-500">VIBE</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 2. Navigation Items */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-8">
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx}>
                        {isExpanded && (
                            <motion.h3
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="px-4 mb-2 text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase"
                            >
                                {group.title}
                            </motion.h3>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = activeView === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onNavigate(item.id as ViewState)}
                                        onMouseEnter={() => setHoveredId(item.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        className="relative w-full h-12 flex items-center group cursor-pointer"
                                    >
                                        {/* Active State Indicator (Neon Glow & Line) */}
                                        {isActive && (
                                            <>
                                                <motion.div
                                                    layoutId="activeGlow"
                                                    className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-xl"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                                <motion.div
                                                    layoutId="activeBorder"
                                                    className="absolute left-0 w-[3px] h-6 bg-orange-500 rounded-r-full shadow-[0_0_12px_rgba(255,69,0,0.8)]"
                                                />
                                            </>
                                        )}

                                        {/* Hover Magnetic Effect Container */}
                                        <div className="relative flex items-center w-full px-3">
                                            {/* Icon with Magnetic Pull */}
                                            <motion.div
                                                animate={{
                                                    x: hoveredId === item.id ? 4 : 0,
                                                    scale: hoveredId === item.id ? 1.1 : 1
                                                }}
                                                className={`p-2 rounded-lg transition-colors z-10 ${isActive ? 'text-orange-500' : 'text-white/60 group-hover:text-white'}`}
                                            >
                                                <item.icon
                                                    strokeWidth={1}
                                                    className={`w-6 h-6 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,69,0,0.5)]' : ''}`}
                                                />
                                            </motion.div>

                                            {/* Label Fade In */}
                                            <AnimatePresence mode="wait">
                                                {isExpanded && (
                                                    <motion.span
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -10 }}
                                                        transition={{ duration: 0.2, delay: 0.05 }}
                                                        className={`ml-3 text-sm font-medium tracking-wide whitespace-nowrap ${isActive ? 'text-white font-bold' : 'text-zinc-400 group-hover:text-zinc-200'
                                                            }`}
                                                    >
                                                        {item.label}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. Bottom User Profile (Removed) */}
            {/* <div className="p-4 border-t border-white/5">...</div> */}
        </motion.aside>
    );
};
