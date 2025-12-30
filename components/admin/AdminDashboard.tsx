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
    // Mock Chart Data
    const activityData = [40, 65, 45, 80, 55, 90, 70];
    const maxVal = Math.max(...activityData);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Toplam Ürün" value={products.length} icon={Package} trend={12} color="text-blue-500" />
                <StatCard title="Toplam Sipariş" value={orders.length} icon={ShoppingCart} trend={8} color="text-green-500" />
                <StatCard title="Kullanıcılar" value={users.length} icon={Users} trend={-3} color="text-purple-500" />
                <StatCard title="Bekleyen Teklif" value={negotiations.filter(n => n.status === 'pending').length} icon={MessageSquare} trend={5} color="text-yellow-500" />
            </div>

            {/* Main Content Info & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Visual Chart Section */}
                <div className="lg:col-span-2 bg-[#121212] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>

                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Haftalık Aktivite</h3>
                            <p className="text-sm text-gray-500">Satış ve Ziyaretçi Analizi</p>
                        </div>
                        <select className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none">
                            <option>Bu Hafta</option>
                            <option>Geçen Ay</option>
                        </select>
                    </div>

                    <div className="h-48 flex items-end gap-4 relative z-10 px-2">
                        {activityData.map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end gap-2 group/bar cursor-pointer">
                                <div className="text-center text-[10px] items-center justify-center font-bold text-white opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -mt-6 w-full flex">
                                    {val}
                                </div>
                                <div
                                    className="w-full bg-[#1A1A17] rounded-t-lg relative overflow-hidden transition-all duration-500 hover:opacity-80"
                                    style={{ height: `${(val / maxVal) * 100}%` }}
                                >
                                    <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-blue-600/20 to-blue-500 rounded-t-lg"></div>
                                </div>
                                <div className="text-center text-[10px] font-bold text-gray-500 uppercase">
                                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][i]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6">Hızlı İşlemler</h3>
                    <div className="space-y-3 flex-1">
                        <button onClick={() => { setActiveTab('products'); handleAddNew(); }} className="w-full p-4 bg-white/5 hover:bg-[#F2A619] hover:text-black rounded-2xl flex items-center gap-3 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-colors"><Plus className="w-5 h-5" /></div>
                            <div className="text-left">
                                <div className="font-bold text-sm">Ürün Ekle</div>
                                <div className="text-[10px] opacity-60 font-bold">Yeni stok girişi yap</div>
                            </div>
                        </button>
                        <button onClick={() => { setActiveTab('slider'); handleAddNew(); }} className="w-full p-4 bg-white/5 hover:bg-blue-500 hover:text-white rounded-2xl flex items-center gap-3 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center group-hover:bg-white/20 transition-colors"><ImageIcon className="w-5 h-5" /></div>
                            <div className="text-left">
                                <div className="font-bold text-sm">Banner Ekle</div>
                                <div className="text-[10px] opacity-60 font-bold">Kampanya görseli</div>
                            </div>
                        </button>
                        <button onClick={() => { setActiveTab('negotiations'); }} className="w-full p-4 bg-white/5 hover:bg-green-500 hover:text-white rounded-2xl flex items-center gap-3 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center group-hover:bg-white/20 transition-colors"><MessageSquare className="w-5 h-5" /></div>
                            <div className="text-left">
                                <div className="font-bold text-sm">Teklifleri Gör</div>
                                <div className="text-[10px] opacity-60 font-bold">{negotiations.filter(n => n.status === 'pending').length} bekleyen</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-[#F2A619]" /> Son Siparişler</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-[#F2A619] hover:text-white transition-colors bg-[#F2A619]/10 px-3 py-1.5 rounded-lg border border-[#F2A619]/20">Tümünü Gör</button>
                </div>
                <div className="space-y-3">
                    {orders.slice(0, 5).map(order => (
                        <div key={order._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group border border-white/5 hover:border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-gray-500 font-bold group-hover:text-white transition-colors border border-white/10 relative">
                                    <ShoppingBag className="w-5 h-5" />
                                    {order.status === 'Hazırlanıyor' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#121212]"></div>}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white flex items-center gap-2">
                                        #{order._id.slice(-6)}
                                        <span className="text-[10px] font-normal text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{order.date}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{order.items.length} Ürün • {order.userId}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${order.status === 'Teslim Edildi' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'Teslim Edildi' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                                    {order.status}
                                </div>
                                <div className="text-right min-w-[80px]">
                                    <div className="text-sm font-mono font-bold text-[#F2A619]">₺{order.total.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
