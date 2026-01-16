import React from 'react';
import { Home, ShoppingBag, Map, Calendar, User, Search, Settings, HelpCircle, Flame, MessageSquare, History, PlaySquare, ChevronRight, MonitorPlay, Bell, Menu } from 'lucide-react';
import { ViewState } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { UserAvatar } from '../ui/UserAvatar';

interface SidebarProps {
    activeView: ViewState;
    onNavigate: (view: ViewState) => void;
    isOpen: boolean;
    isMobile?: boolean; // If true, it might be an overlay instead of pushing content
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, isOpen, isMobile, onClose }) => {
    const { user } = useAuthStore();

    const mainItems = [
        { icon: Home, label: 'Ana Sayfa', id: 'home' },
        { icon: Flame, label: 'Shorts', id: 'reels' },
        { icon: ShoppingBag, label: 'Mağaza', id: 'shop' },
        { icon: Map, label: 'Rotalar', id: 'routes' },
        { icon: Bell, label: 'Bildirimler', id: 'notifications', badge: true }, // Added Notifications
    ];

    const youItems = [
        { icon: History, label: 'Geçmiş', id: 'history' }, // Placeholder view
        { icon: PlaySquare, label: 'Videolarınız', id: 'my-videos' }, // Placeholder view
    ];

    const exploreItems = [
        { icon: Calendar, label: 'Etkinlikler', id: 'meetup' },
        { icon: MessageSquare, label: 'Topluluk (Forum)', id: 'forum' },
        { icon: MonitorPlay, label: 'Canlı Yayın', id: 'live' }, // Placeholder
    ];

    const footerItems = [
        { icon: Settings, label: 'Ayarlar', id: 'settings' },
        { icon: HelpCircle, label: 'Yardım', id: 'help' },
    ];

    // If sidebar is closed on desktop, show mini sidebar
    // If sidebar is closed on mobile, show nothing (it's off screen)

    // Mini Sidebar (Desktop Closed)
    if (!isOpen && !isMobile) {
        return (
            <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-20 bg-white border-r border-gray-100 flex flex-col items-center py-6 gap-6 overflow-y-auto overflow-x-hidden z-40 transition-all duration-300">
                {mainItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id as ViewState)}
                        className={`flex flex-col items-center gap-1.5 w-14 py-3 rounded-2xl transition-all relative group
                        ${activeView === item.id ? 'bg-moto-accent text-black shadow-lg shadow-moto-accent/30' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <div className="relative">
                            <item.icon className={`w-6 h-6 ${activeView === item.id ? 'fill-black/10' : ''}`} strokeWidth={activeView === item.id ? 2.5 : 2} />
                            {item.badge && useNotificationStore.getState().unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                            )}
                        </div>
                    </button>
                ))}
            </aside>
        );
    }

    // Full Sidebar
    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[1000]" onClick={onClose} />
            )}

            <aside className={`
                fixed top-0 left-0 h-full w-[280px] bg-white border-r border-gray-100 overflow-y-auto z-[1001] transform transition-transform duration-300 shadow-2xl shadow-gray-200/50
                ${isMobile
                    ? (isOpen ? 'translate-x-0' : '-translate-x-full')
                    : 'top-16 h-[calc(100vh-4rem)] translate-x-0 shadow-none'} 
            `}>
                {isMobile && (
                    <div className="flex items-center justify-between px-6 h-20 border-b border-gray-100">
                        <span className="font-display font-black text-2xl italic tracking-tighter text-gray-900">MOTOVIBE</span>
                        <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100 text-gray-900">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                )}

                <div className="py-6 px-4 flex flex-col gap-6">
                    {/* Main Section */}
                    <div>
                        <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Menü</div>
                        {mainItems.map(item => (
                            <SidebarItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                isActive={activeView === item.id}
                                onClick={() => { onNavigate(item.id as ViewState); if (isMobile && onClose) onClose(); }}
                            />
                        ))}
                    </div>

                    {/* Separator */}
                    <div className="h-px bg-gray-100 mx-4" />

                    {/* You Section */}
                    <div>
                        <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Kütüphane</div>
                        {youItems.map(item => (
                            <SidebarItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                isActive={activeView === item.id}
                                onClick={() => { onNavigate(item.id as ViewState); if (isMobile && onClose) onClose(); }}
                            />
                        ))}
                    </div>

                    {/* Separator */}
                    <div className="h-px bg-gray-100 mx-4" />

                    {/* Explore Section */}
                    <div>
                        <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Topluluk</div>
                        {exploreItems.map(item => (
                            <SidebarItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                isActive={activeView === item.id}
                                onClick={() => { onNavigate(item.id as ViewState); if (isMobile && onClose) onClose(); }}
                            />
                        ))}
                    </div>

                    {/* Footer Section (Push to bottom if needed flex-gro logic, or just margin top) */}
                    <div className="mt-8">
                        {footerItems.map(item => (
                            <SidebarItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                isActive={activeView === item.id}
                                onClick={() => { onNavigate(item.id as ViewState); if (isMobile && onClose) onClose(); }}
                            />
                        ))}
                    </div>

                    {/* Pro Badge */}
                    <div className="mx-2 mt-4 p-4 rounded-2xl bg-gray-900 text-white relative overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow" onClick={() => onNavigate('shop' as ViewState)}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-moto-accent rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity" />
                        <div className="relative z-10">
                            <h4 className="font-bold text-lg italic tracking-tight mb-1">Motovibe PRO</h4>
                            <p className="text-xs text-gray-400 mb-3">Premium özelliklere erişin.</p>
                            <span className="text-[10px] font-bold bg-moto-accent text-black px-2 py-1 rounded-md">YÜKSELT</span>
                        </div>
                    </div>

                    <div className="px-4 mt-4 text-[10px] text-gray-400 font-medium">
                        <p>© 2026 Motovibe Inc.</p>
                    </div>

                </div>
            </aside>
        </>
    );
};

const SidebarItem = ({ icon: Icon, label, isActive, badge, onClick }: { icon: any, label: string, isActive: boolean, badge?: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl mb-1 transition-all duration-200 relative group
        ${isActive
                ? 'bg-moto-accent text-black font-bold shadow-md shadow-moto-accent/20 translate-x-1'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
    >
        <div className="relative">
            <Icon className={`w-5 h-5 ${isActive ? 'fill-black/10 stroke-[2.5px]' : 'stroke-2'}`} />
            {badge && useNotificationStore.getState().unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
            )}
        </div>
        <span className="text-sm truncate">{label}</span>

        {/* Active Indicator Line (Optional, maybe removing for cleaner button look) */}
        {/* {isActive && <div className="absolute right-3 w-1.5 h-1.5 bg-black rounded-full" />} */}
    </button>
);
