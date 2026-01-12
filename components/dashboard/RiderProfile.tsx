import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { useAuthStore } from '../../store/authStore';

export const RiderProfile = ({ user, isMobile = false, onClose }: { user: any; isMobile?: boolean; onClose?: () => void }) => {
    const { logout } = useAuthStore();

    if (!user) return null;

    return (
        <div className="bg-[#111] rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-moto-accent/5 to-transparent opacity-50" />

            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="ring-2 ring-white/10 rounded-full p-1 bg-black mb-4 relative">
                    <UserAvatar src={user.profileImage || user.avatar} name={user.name} size={80} />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-black" title="Online" />
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                <p className="text-zinc-500 text-sm font-mono mb-4">@{user.username}</p>

                {user.rank && (
                    <span className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-wider border border-white/5 mb-6">
                        {user.rank}
                    </span>
                )}

                <div className="grid grid-cols-3 gap-4 w-full border-t border-white/5 pt-4">
                    <div>
                        <div className="text-lg font-bold text-white">{user.stats?.rides || 0}</div>
                        <div className="text-[10px] text-zinc-500 uppercase font-bold">Sürüş</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-white">{user.stats?.followers || 0}</div>
                        <div className="text-[10px] text-zinc-500 uppercase font-bold">Takipçi</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-white">{user.stats?.following || 0}</div>
                        <div className="text-[10px] text-zinc-500 uppercase font-bold">Takip</div>
                    </div>
                </div>

                {/* Mobile specific actions if needed */}
                {isMobile && (
                    <button
                        onClick={() => { if (logout) logout(); if (onClose) onClose(); }}
                        className="w-full mt-6 py-3 rounded-xl bg-red-500/10 text-[#FF3E3E] text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        GÜVENLİ ÇIKIŞ
                    </button>
                )}
            </div>
        </div>
    );
};
