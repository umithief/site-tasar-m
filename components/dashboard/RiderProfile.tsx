import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { useAuthStore } from '../../store/authStore';

export const RiderProfile = ({ user: propUser, isMobile = false, onClose }: { user?: any; isMobile?: boolean; onClose?: () => void }) => {
    const { user: authUser, logout } = useAuthStore();

    // Prioritize propUser if provided (e.g. for previewing other users), otherwise use authUser
    const user = propUser || authUser;

    if (!user) return null;

    // Ensure stats exist with defaults
    const stats = user.stats || { rides: 0, followers: 0, following: 0 };

    return (
        <div className="bg-white dark:bg-[#111] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            {/* Light Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent -z-10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="ring-4 ring-white dark:ring-[#111] shadow-lg rounded-full p-1 bg-gradient-to-br from-white to-gray-50 dark:from-[#222] dark:to-[#111] mb-4 relative">
                    <UserAvatar src={user.profileImage || user.avatar} name={user.name} size={80} />
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-[#111] shadow-sm" title="Online" />
                </div>

                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">{user.name}</h3>
                <p className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-4">@{user.username}</p>

                {user.rank && (
                    <span className="px-4 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider border border-gray-100 dark:border-white/10 mb-6 shadow-sm">
                        {user.rank}
                    </span>
                )}

                <div className="grid grid-cols-3 gap-2 w-full border-t border-gray-100 dark:border-white/5 pt-5">
                    <div className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <div className="text-lg font-black text-gray-900 dark:text-white leading-none mb-1">{stats.rides || 0}</div>
                        <div className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Sürüş</div>
                    </div>
                    <div className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <div className="text-lg font-black text-gray-900 dark:text-white leading-none mb-1">{stats.followers || 0}</div>
                        <div className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Takipçi</div>
                    </div>
                    <div className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <div className="text-lg font-black text-gray-900 dark:text-white leading-none mb-1">{stats.following || 0}</div>
                        <div className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Takip</div>
                    </div>
                </div>

                {/* Mobile specific actions if needed */}
                {isMobile && (
                    <button
                        onClick={() => { if (logout) logout(); if (onClose) onClose(); }}
                        className="w-full mt-6 py-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 text-xs font-bold uppercase tracking-wider hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        GÜVENLİ ÇIKIŞ
                    </button>
                )}
            </div>
        </div>
    );
};
