import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Compass, Zap, ShoppingBag, Map,
    Heart, Settings, Layers, Menu, Shield
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ViewState } from '../../types';
import { Logo } from '../ui/Logo';

interface MotovibeSidebarProps {
    activeView: ViewState;
    onNavigate: (view: ViewState) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    className?: string;
}

export const MotovibeSidebar: React.FC<MotovibeSidebarProps> = ({
    activeView,
    onNavigate,
    isExpanded,
    onToggleExpand,
    className
}) => {
    const { user } = useAuthStore();
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Menu Structure
    const menuGroups = [
        {
            title: 'GENEL MENÜ',
            items: [
                { id: 'home', icon: Home, label: 'Akış' },
                { id: 'showcase', icon: Layers, label: 'Vitrin' },
                { id: 'explore', icon: Compass, label: 'Keşfet' },
                { id: 'reels', icon: Zap, label: 'Reels' },
                { id: 'shop', icon: ShoppingBag, label: 'Mağaza' },
                { id: 'routes', icon: Map, label: 'Rotalar' },
            ]
        },
        {
            title: 'KİŞİSEL',
            items: [
                { id: 'favorites', icon: Heart, label: 'Favoriler' },
                { id: 'settings', icon: Settings, label: 'Ayarlar' },
            ]
        },
        ...(user?.isAdmin ? [{
            title: 'YÖNETİM',
            items: [
                { id: 'admin', icon: Shield, label: 'Admin Panel' }
            ]
        }] : [])
    ];

    return (
        <motion.aside
            layout
            className={`hidden md:flex flex-col h-screen fixed left-0 top-0 z-[1000] bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-r border-gray-200/50 dark:border-white/5 shadow-2xl shadow-black/5 ${className}`}
            initial={false}
            animate={{ width: isExpanded ? 240 : 88 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* 1. Header (Logo / Menu Toggle) */}
            <div className={`h-24 flex items-center ${isExpanded ? 'px-8 justify-between' : 'justify-center'} relative transition-all duration-300`}>
                <AnimatePresence mode="wait">
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            <Logo variant="full" className="h-6 w-auto text-gray-900 dark:text-white" />
                        </motion.div>
                    )}
                    {!isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <Logo variant="icon" className="h-8 w-auto text-gray-900 dark:text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={onToggleExpand}
                    className={`p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`}
                >
                    <Menu strokeWidth={1.5} className="w-5 h-5" />
                </button>
            </div>

            {/* 2. Navigation Items */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-8 custom-scrollbar">
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx}>
                        {isExpanded && (
                            <motion.h3
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="px-3 mb-3 text-[10px] font-black text-gray-400 dark:text-gray-600 tracking-widest uppercase font-display"
                            >
                                {group.title}
                            </motion.h3>
                        )}
                        <div className="space-y-2">
                            {group.items.map((item) => {
                                const isActive = activeView === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onNavigate(item.id as ViewState)}
                                        onMouseEnter={() => setHoveredId(item.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        className={`relative w-full h-11 flex items-center group cursor-pointer transition-all duration-300 rounded-xl overflow-hidden
                                            ${isActive ? '' : 'hover:bg-gray-50 dark:hover:bg-white/5'}
                                        `}
                                    >
                                        {/* Active State Background & Glow */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeCtn"
                                                className="absolute inset-0 bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg shadow-gray-200/50 dark:shadow-none"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}

                                        {/* Hover Magnetic Effect Container */}
                                        <div className="relative flex items-center w-full px-3 z-10">
                                            {/* Icon */}
                                            <div
                                                className={`p-1.5 rounded-lg transition-colors ${isActive
                                                    ? 'text-moto-accent'
                                                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}
                                            >
                                                <item.icon
                                                    strokeWidth={isActive ? 2 : 1.5}
                                                    className="w-5 h-5"
                                                />
                                            </div>

                                            {/* Label */}
                                            <AnimatePresence mode="wait">
                                                {isExpanded && (
                                                    <motion.span
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                        className={`ml-3 text-sm font-medium tracking-wide whitespace-nowrap ${isActive
                                                                ? 'text-white dark:text-black font-bold'
                                                                : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
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

            {/* User Profile / Footer Section if needed */}
            {isExpanded && (
                <div className="p-6 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-gray-400">Sistem Çevrimiçi</span>
                    </div>
                </div>
            )}

        </motion.aside>
    );
};
