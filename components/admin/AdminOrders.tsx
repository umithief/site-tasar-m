import React from 'react';
import { Order } from '../../types';

interface AdminOrdersProps {
    orders: Order[];
    handleOrderStatusChange: (orderId: string, newStatus: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, handleOrderStatusChange }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-[#1A1A17] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[#F2A619] font-bold text-xs border border-white/5">#{order.id.slice(-4)}</div>
                                <div>
                                    <div className="text-white font-bold">{order.userId}</div>
                                    <div className="text-xs text-gray-500">{order.date}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-white font-mono">₺{order.total}</div>
                                <div className={`text-[10px] font-bold uppercase ${order.status === 'Teslim Edildi' ? 'text-green-500' : 'text-yellow-500'}`}>{order.status}</div>
                            </div>
                        </div>
                        <div className="bg-black/20 rounded-xl p-3 flex gap-2 overflow-x-auto no-scrollbar">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex-shrink-0 w-12 h-12 bg-white rounded-lg overflow-hidden relative" title={item.name}>
                                    <img src={item.image} className="w-full h-full object-contain" />
                                    <div className="absolute bottom-0 right-0 bg-black text-white text-[8px] px-1 font-bold">x{item.quantity}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-2 justify-end">
                            {['Hazırlanıyor', 'Kargoda', 'Teslim Edildi'].map(s => (
                                <button key={s} onClick={() => handleOrderStatusChange(order.id, s)} className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${order.status === s ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500 hover:text-white'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
