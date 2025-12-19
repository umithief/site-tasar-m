import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, Grid, Map, Circle, MessageSquare, Image as ImageIcon, Box, Zap, Globe, LogOut, Calendar, Activity, Film } from 'lucide-react';
import { motion } from 'framer-motion';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'users' | 'slider' | 'categories' | 'routes' | 'stories' | 'negotiations' | 'models' | 'events' | 'community' | 'paddock' | 'showcase';

interface AdminSidebarProps {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    isSidebarOpen: boolean;
    onLogout: () => void;
    onNavigate: (view: any) => void;
}

const NavItem = ({ id, label, icon: Icon, active, onClick }: any) => (
    <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative overflow-hidden ${active
            ? 'bg-[#F2A619] text-black shadow-lg shadow-[#F2A619]/20 font-bold'
            : 'text-gray-400 hover:bg-white/5 hover:text-white font-medium'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} strokeWidth={active ? 2.5 : 2} />
        <span className="relative z-10">{label}</span>
        {active && <div className="absolute inset-0 bg-white/20 blur-xl"></div>}
    </button>
);

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, isSidebarOpen, onLogout, onNavigate }) => {
    return (
        <motion.div
            initial={{ width: 280 }}
            animate={{ width: isSidebarOpen ? 280 : 80 }}
            className="flex-shrink-0 bg-[#121212] border-r border-white/5 flex flex-col transition-all duration-300 relative z-20"
        >
            {/* Logo Area */}
            <div className={`h-20 flex items-center ${isSidebarOpen ? 'px-8 justify-start' : 'justify-center'} border-b border-white/5`}>
                <div className="w-10 h-10 bg-[#F2A619] rounded-xl flex items-center justify-center text-black shadow-lg shadow-[#F2A619]/20">
                    <Zap className="w-6 h-6 fill-current" />
                </div>
                {isSidebarOpen && (
                    <div className="ml-3">
                        <h1 className="font-display font-black text-xl tracking-tight text-white leading-none">MOTO<span className="text-[#F2A619]">VIBE</span></h1>
                        <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Admin Panel</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-3 space-y-1">
                <NavItem id="dashboard" label="Genel Bakış" icon={LayoutDashboard} active={activeTab === 'dashboard'} onClick={setActiveTab} />
                <NavItem id="products" label="Ürün Yönetimi" icon={Package} active={activeTab === 'products'} onClick={setActiveTab} />
                <NavItem id="orders" label="Siparişler" icon={ShoppingCart} active={activeTab === 'orders'} onClick={setActiveTab} />
                <NavItem id="users" label="Kullanıcılar" icon={Users} active={activeTab === 'users'} onClick={setActiveTab} />
                <div className="my-4 border-t border-white/5 mx-2"></div>
                <NavItem id="negotiations" label="Teklifler" icon={MessageSquare} active={activeTab === 'negotiations'} onClick={setActiveTab} />
                <NavItem id="routes" label="Rotalar" icon={Map} active={activeTab === 'routes'} onClick={setActiveTab} />
                <NavItem id="stories" label="Hikayeler" icon={Circle} active={activeTab === 'stories'} onClick={setActiveTab} />
                <NavItem id="categories" label="Kategoriler" icon={Grid} active={activeTab === 'categories'} onClick={setActiveTab} />
                <NavItem id="events" label="Etkinlikler" icon={Calendar} active={activeTab === 'events'} onClick={setActiveTab} />
                <NavItem id="community" label="Topluluk" icon={MessageSquare} active={activeTab === 'community'} onClick={setActiveTab} />
                <NavItem id="paddock" label="Paddock" icon={Activity} active={activeTab === 'paddock'} onClick={setActiveTab} />
                <NavItem id="slider" label="Slider" icon={ImageIcon} active={activeTab === 'slider'} onClick={setActiveTab} />
                <NavItem id="showcase" label="Vitrin (Cinema)" icon={Film} active={activeTab === 'showcase'} onClick={setActiveTab} />
                <NavItem id="models" label="3D Modeller" icon={Box} active={activeTab === 'models'} onClick={setActiveTab} />
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-white/5">
                <button onClick={() => onNavigate('home')} className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                    <Globe className="w-5 h-5" />
                </button>
                <button onClick={onLogout} className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors mt-1">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
};
