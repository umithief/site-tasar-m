import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Check, MapPin, Truck, Clock, ArrowRight } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';

interface OrderTrackingProps {
    orderId: string;
    onClose: () => void;
}

const STAGES = [
    { id: 'Order Placed', label: 'Sipariş Alındı', icon: Check, dateField: 'createdAt' },
    { id: 'Preparing Gear', label: 'Hazırlanıyor', icon: Box, dateField: 'updatedAt' },
    { id: 'On the Road', label: 'Yola Çıktı', icon: Truck, dateField: 'updatedAt' },
    { id: 'Delivered', label: 'Teslim Edildi', icon: MapPin, dateField: 'deliveredAt' }
];

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, onClose }) => {
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // In a real app we would poll or use sockets
                const data = await orderService.getOrderById(orderId);
                setOrder(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchOrder();
    }, [orderId]);

    if (!order) return (
        <div className="flex items-center justify-center h-full text-zinc-500">
            Loading...
        </div>
    );

    const getCurrentStageIndex = () => {
        // Map backend status to our stage index
        // Backend: 'Hazırlanıyor', 'Kargoda', 'Teslim Edildi', 'İptal'
        // Or English: 'Order Placed', 'Preparing Gear', 'On the Road', 'Delivered'
        // My backend uses Mixed Turkish/English in enum (I added both).
        // Let's normalize.
        const status = order.status;
        if (status === 'Delivered' || status === 'Teslim Edildi') return 3;
        if (status === 'On the Road' || status === 'Kargoda') return 2;
        if (status === 'Preparing Gear' || status === 'Hazırlanıyor') return 1;
        return 0; // Order Placed
    };

    const currentStep = getCurrentStageIndex();

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-32">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold uppercase tracking-widest">Sipariş Takibi</h2>
                <div className="text-xs font-mono text-zinc-500">#{order._id.slice(-6).toUpperCase()}</div>
            </div>

            {/* Map Visualization Placeholder */}
            <div className="w-full h-48 bg-zinc-900 rounded-2xl mb-8 relative overflow-hidden flex items-center justify-center border border-white/5">
                <div className="absolute inset-0 opacity-20 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/29.0,41.0,10,0/600x400?access_token=YOUR_TOKEN')] bg-cover bg-center" />

                {/* Animated Path Simulation */}
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_lime]" />
                    <div className="w-24 h-0.5 bg-zinc-700 relative overflow-hidden">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent w-full"
                        />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-[0_0_15px_orange]">
                        <Truck className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-8 border-l border-zinc-800 space-y-12">
                {STAGES.map((stage, index) => {
                    const isActive = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            {/* Dot */}
                            <div className={`absolute -left-[37px] w-4 h-4 rounded-full border-4 border-black transition-colors duration-500 z-10
                            ${isActive ? 'bg-orange-500' : 'bg-zinc-800'}
                            ${isCurrent ? 'shadow-[0_0_15px_orange]' : ''}
                        `} />

                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className={`text-sm font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                                        {stage.label}
                                    </h3>
                                    <p className="text-xs text-zinc-500 font-mono">
                                        {isActive ? 'Tamamlandı' : 'Bekleniyor'}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl transition-colors ${isActive ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-700'}`}>
                                    <stage.icon className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-12 bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                    <img src={order.items[0]?.image} className="w-16 h-16 rounded-lg object-cover bg-zinc-800" />
                    <div>
                        <p className="text-sm font-bold text-white line-clamp-1">{order.items[0]?.name}</p>
                        <p className="text-xs text-zinc-500">ve {order.items.length - 1} diğer ürün</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-full py-3 rounded-lg bg-orange-500/10 text-orange-500 text-xs font-bold uppercase hover:bg-orange-500/20 transition-colors">
                    Siparişi Detaylarını Gör
                </button>
            </div>
        </div>
    );
};
