import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut } from 'lucide-react';
import { RiderProfile } from './RiderProfile';
import { ActiveMachine } from './ActiveMachine';
import { WeatherRadar } from './WeatherRadar';
import { useAuthStore } from '../../store/authStore';

interface DashboardDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export const DashboardDrawer: React.FC<DashboardDrawerProps> = ({ isOpen, onClose, user }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        drag="x"
                        dragConstraints={{ left: -300, right: 0 }}
                        dragElastic={0.1}
                        onDragEnd={(_, info) => {
                            if (info.offset.x < -100) onClose();
                        }}
                        className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[#050505] border-r border-white/10 z-[51] lg:hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="text-sm font-black italic uppercase tracking-wider text-white">
                                KOMUTA MERKEZİ
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <RiderProfile user={user} isMobile={false} onClose={onClose} />
                            <ActiveMachine />
                            <WeatherRadar />
                        </div>

                        {/* Footer (Logout Button) */}
                        <div className="p-6 border-t border-white/5 bg-[#050505] sticky bottom-0 z-10">
                            <button
                                onClick={() => {
                                    const { logout } = useAuthStore.getState();
                                    if (logout) logout();
                                    onClose();
                                }}
                                className="w-full py-3 rounded-xl bg-red-500/10 text-[#FF3E3E] text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                GÜVENLİ ÇIKIŞ
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
