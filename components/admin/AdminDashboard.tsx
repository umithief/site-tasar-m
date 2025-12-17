import React from 'react';
import { StatCard } from './StatCard';
import { Package, ShoppingCart, Users, MessageSquare, ShoppingBag, Plus, Image as ImageIcon } from 'lucide-react';
import { Order, Product, User, NegotiationOffer } from '../../types';

interface AdminDashboardProps {
    products: Product[];
    orders: Order[];
    users: User[];
    negotiations: NegotiationOffer[];
    setActiveTab: (tab: any) => void;
    handleAddNew: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, orders, users, negotiations, setActiveTab, handleAddNew }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Toplam Ürün" value={products.length} icon={Package} trend={12} color="text-blue-500" />
                <StatCard title="Toplam Sipariş" value={orders.length} icon={ShoppingCart} trend={8} color="text-green-500" />
                <StatCard title="Kullanıcılar" value={users.length} icon={Users} trend={-3} color="text-purple-500" />
                <StatCard title="Bekleyen Teklif" value={negotiations.filter(n => n.status === 'pending').length} icon={MessageSquare} trend={5} color="text-yellow-500" />
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-[#1A1A17] border border-white/5 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Son Siparişler</h3>
                        <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-[#F2A619] hover:text-white transition-colors">Tümünü Gör</button>
                    </div>
                    <div className="space-y-3">
                        {orders.slice(0, 5).map(order => (
                            <div key={order._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-gray-500 font-bold group-hover:text-white transition-colors border border-white/10">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{order._id}</div>
                                        <div className="text-xs text-gray-500">{order.date} • {order.items.length} Ürün</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'Teslim Edildi' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                        {order.status}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-mono font-bold text-[#F2A619]">₺{order.total.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#1A1A17] border border-white/5 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Hızlı İşlemler</h3>
                    <div className="space-y-3">
                        <button onClick={() => { setActiveTab('products'); handleAddNew(); }} className="w-full p-4 bg-white/5 hover:bg-[#F2A619] hover:text-black rounded-2xl flex items-center gap-3 transition-all group">
                            <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-black/10"><Plus className="w-4 h-4" /></div>
                            <span className="font-bold text-sm">Ürün Ekle</span>
                        </button>
                        <button onClick={() => { setActiveTab('slider'); handleAddNew(); }} className="w-full p-4 bg-white/5 hover:bg-blue-500 hover:text-white rounded-2xl flex items-center gap-3 transition-all group">
                            <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-white/20"><ImageIcon className="w-4 h-4" /></div>
                            <span className="font-bold text-sm">Slider Ekle</span>
                        </button>
                        <button onClick={() => { setActiveTab('negotiations'); }} className="w-full p-4 bg-white/5 hover:bg-green-500 hover:text-white rounded-2xl flex items-center gap-3 transition-all group">
                            <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-white/20"><MessageSquare className="w-4 h-4" /></div>
                            <span className="font-bold text-sm">Teklifleri İncele</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
