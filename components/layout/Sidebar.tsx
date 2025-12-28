import React from 'react';
import { Home, ShoppingBag, Map, Calendar, User, PlusCircle, Search, Settings } from 'lucide-react';
import { ViewState } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
    activeView: ViewState;
    onNavigate: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
    const { user } = useAuthStore();

    const navItems = [
        { icon: Home, label: 'Feed', id: 'home' },
        { icon: Search, label: 'Explore', id: 'explore' },
        { icon: ShoppingBag, label: 'Shop', id: 'shop' },
        { icon: Map, label: 'Routes', id: 'routes' },
        { icon: Calendar, label: 'Events', id: 'meetup' },
        // { icon: MessageSquare, label: 'Forum', id: 'forum' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-[20%] border-r border-white/5 bg-black/50 backdrop-blur-xl flex flex-col justify-between p-8 z-50">
            {/* Logo Area */}
            <div>
                <div onClick={() => onNavigate('home')} className="flex items-center gap-3 mb-12 cursor-pointer group">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-[0_0_20px_rgba(255,69,0,0.3)]">
                        <span className="font-bold text-black text-xl italic">M</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-widest uppercase">MOTOVIBE</h1>
                        <p className="text-[10px] text-zinc-500 tracking-[0.3em] font-medium uppercase">Premium Gear</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id as ViewState)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group
                            ${activeView === item.id
                                    ? 'bg-orange-500/10 text-orange-500 translate-x-2'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${activeView === item.id ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                            <span className={`text-sm font-medium tracking-wide uppercase ${activeView === item.id ? 'font-bold' : ''}`}>
                                {item.label}
                            </span>
                            {activeView === item.id && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_orange]" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-4">
                <button
                    onClick={() => onNavigate('create')}
                    className="w-full bg-white text-black h-14 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-lg group"
                >
                    <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>Create</span>
                </button>

                <div
                    onClick={() => onNavigate(user ? 'my-profile' : 'auth')}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5"
                >
                    {user?.avatar ? (
                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-zinc-700" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                            <User className="w-5 h-5" />
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{user?.name || 'Sign In'}</p>
                        <p className="text-xs text-zinc-500 truncate">@{user?.username || 'guest'}</p>
                    </div>
                    <Settings className="w-4 h-4 text-zinc-600" />
                </div>
            </div>
        </aside>
    );
};
