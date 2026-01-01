import React from 'react';
import { Home, ShoppingBag, Map, Calendar, User, Search, Settings, HelpCircle, Flame, MessageSquare, History, PlaySquare, ChevronRight, MonitorPlay } from 'lucide-react';
import { ViewState } from '../../types';
import { useAuthStore } from '../../store/authStore';
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
            <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-20 bg-[#0f0f0f] flex flex-col items-center py-4 gap-6 overflow-y-auto overflow-x-hidden z-40">
                {mainItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id as ViewState)}
                        className={`flex flex-col items-center gap-1 w-16 py-4 rounded-lg hover:bg-[#272727] transition-colors
                        ${activeView === item.id ? 'text-white' : 'text-white'}`}
                    >
                        <item.icon className={`w-6 h-6 ${activeView === item.id ? 'fill-white' : ''}`} strokeWidth={activeView === item.id ? 2.5 : 1.5} />
                        <span className="text-[10px] truncate w-full text-center">{item.label}</span>
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
                <div className="fixed inset-0 bg-black/50 z-[1000]" onClick={onClose} />
            )}

            <aside className={`
                fixed top-0 left-0 h-full w-60 bg-[#0f0f0f] overflow-y-auto z-[1001] transform transition-transform duration-300
                ${isMobile
                    ? (isOpen ? 'translate-x-0' : '-translate-x-full')
                    : 'top-16 h-[calc(100vh-4rem)] translate-x-0'} // Desktop always visible if we are in this block, but logically handled by condition above
            `}>
                {isMobile && (
                    <div className="flex items-center gap-4 px-6 h-16 border-b border-white/5">
                        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
                            <MenuIcon />
                        </button>
                        <span className="font-display font-bold text-xl text-white tracking-tight">MOTOVIBE</span>
                    </div>
                )}

                <div className="py-3 px-3">
                    {/* Main Section */}
                    <div className="border-b border-white/10 pb-3 mb-3">
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

                    {/* You Section */}
                    <div className="border-b border-white/10 pb-3 mb-3">
                        <div className="px-3 py-2 flex items-center gap-2 text-base font-bold text-white">
                            <span>Siz</span>
                        </div>
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

                    {/* Explore Section */}
                    <div className="border-b border-white/10 pb-3 mb-3">
                        <div className="px-3 py-2 text-base font-bold text-white">Keşfet</div>
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

                    {/* Footer Section */}
                    <div className="pb-3 mb-3">
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

                    <div className="px-4 py-4 text-xs text-zinc-500 font-medium">
                        <p>© 2026 Google LLC</p>
                        <p className="mt-2">Motovibe Premium</p>
                    </div>

                </div>
            </aside>
        </>
    );
};

const SidebarItem = ({ icon: Icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-5 px-3 py-2.5 rounded-lg mb-0.5 transition-colors
        ${isActive ? 'bg-[#272727] text-white font-medium' : 'text-white hover:bg-[#272727]'}`}
    >
        <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 1.5} />
        <span className="text-sm truncate">{label}</span>
    </button>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
)
