import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wrench, Settings, Shield, ChevronRight, LogOut, User } from 'lucide-react';
import { ViewState } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface MobileSideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: ViewState) => void;
}

export const MobileSideMenu: React.FC<MobileSideMenuProps> = ({ isOpen, onClose, onNavigate }) => {
    const { user, logout } = useAuthStore();

    const menuItems = [
        {
            id: 'tools',
            label: 'Araçlar',
            icon: Wrench,
            description: 'Motosiklet bakım ve hesaplama araçları',
            view: 'mototool' as ViewState,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10'
        },
        {
            id: 'settings',
            label: 'Ayarlar',
            icon: Settings,
            description: 'Uygulama ve hesap ayarları',
            view: 'settings' as ViewState,
            color: 'text-zinc-400',
            bg: 'bg-zinc-500/10'
        },
        // Admin Panel - Only show if user has permission (mock logic for now, or just show it)
        {
            id: 'admin',
            label: 'Admin Paneli',
            icon: Shield,
            description: 'Yönetici kontrolleri',
            view: 'admin' as ViewState,
            color: 'text-red-500',
            bg: 'bg-red-500/10'
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150]"
                    />

                    {/* Menu Content - Slides in from Right (moving Left) */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full sm:w-[85%] max-w-md bg-[#09090b] border-l border-white/10 z-[160] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                            <h2 className="text-xl font-display font-bold text-white tracking-tight">Menü</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* User Micro Profile */}
                        {user ? (
                            <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-white/10 overflow-hidden relative">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
                                                <User className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{user.name}</h3>
                                        <p className="text-sm text-zinc-500">@{user.username}</p>
                                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider bg-moto-accent text-black">
                                            {user.rank || 'ÜYE'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 border-b border-white/5 text-center">
                                <p className="text-zinc-400 mb-4">Özelliklere erişmek için giriş yapmalısın.</p>
                                <button
                                    onClick={() => { onNavigate('auth' as ViewState); onClose(); }}
                                    className="w-full py-3 rounded-xl bg-moto-accent text-black font-bold"
                                >
                                    Giriş Yap
                                </button>
                            </div>
                        )}

                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onNavigate(item.view);
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group active:scale-95"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="text-base font-bold text-white group-hover:text-moto-accent transition-colors">
                                            {item.label}
                                        </h3>
                                        <p className="text-xs text-zinc-500">{item.description}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                                </button>
                            ))}
                        </div>

                        {/* Footer / Logout */}
                        {user && (
                            <div className="p-6 border-t border-white/5 bg-black/20">
                                <button
                                    onClick={() => {
                                        if (logout) logout();
                                        onClose();
                                        // Optional: navigate to auth or home
                                    }}
                                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-bold"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Oturumu Kapat
                                </button>
                                <p className="text-center text-[10px] text-zinc-700 mt-4 uppercase tracking-widest font-black">
                                    MotoVibe v2.0
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
