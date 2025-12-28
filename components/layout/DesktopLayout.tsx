import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { DiscoveryRadar } from './DiscoveryRadar';
import { ViewState } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface DesktopLayoutProps {
    children: React.ReactNode;
    currentView: ViewState;
    onNavigate: (view: ViewState) => void;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children, currentView, onNavigate }) => {
    const { user } = useAuthStore();
    const [scrolled, setScrolled] = useState(false);

    // Scroll handler for main feed
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrolled(e.currentTarget.scrollTop > 50);
    };

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden flex">
            {/* 1. Left Sidebar (20%) */}
            <div className="w-[20%] h-screen flex-shrink-0 relative z-50 hidden lg:block">
                <Sidebar activeView={currentView} onNavigate={onNavigate} />
            </div>

            {/* 2. Main Feed (50% - Central Focus) */}
            <main
                className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative scroll-smooth no-scrollbar"
                onScroll={handleScroll}
            >
                {/* Top Fade Gradient */}
                <div className={`fixed top-0 left-[20%] right-[30%] h-32 bg-gradient-to-b from-black to-transparent pointer-events-none z-40 transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />

                <div className="max-w-4xl mx-auto px-8 pt-12 pb-32 min-h-screen">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentView}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Bottom Fade Gradient */}
                <div className="fixed bottom-0 left-[20%] right-[30%] h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-40" />
            </main>

            {/* 3. Right Side Panel (30% - Discovery Radar) */}
            <div className="w-[30%] h-screen flex-shrink-0 relative z-50 hidden xl:block">
                <DiscoveryRadar />
            </div>

            {/* Living Background (Subtle) */}
            <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none z-0" />
            <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none z-0" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-orange-900/10 rounded-full blur-[150px] pointer-events-none z-0" />
        </div>
    );
};
