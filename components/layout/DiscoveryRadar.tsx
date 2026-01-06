import React, { useEffect, useState } from 'react';
import { CloudRain, Wind, Thermometer, ArrowUpRight, User as UserIcon, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { motion } from 'framer-motion';

export const DiscoveryRadar: React.FC = () => {
    const { user } = useAuthStore();
    const [trendingGear, setTrendingGear] = useState<Product[]>([]);

    useEffect(() => {
        const loadTrending = async () => {
            try {
                const products = await productService.getProducts();
                // Simulate trending by taking first 3
                setTrendingGear(products.slice(0, 3));
            } catch (error) {
                console.error("Failed to load trending gear", error);
            }
        };
        loadTrending();
    }, []);

    const topRiders = [
        { name: 'Altın Elbiseli Adam', rank: 'Legend', avatar: null, points: 15420 },
        { name: 'Kenan Sofuoğlu', rank: 'Pro', avatar: null, points: 12100 },
        { name: 'Toprak Razgatlıoğlu', rank: 'Pro', avatar: null, points: 11500 },
    ];

    return (
        <aside className="fixed right-0 top-0 h-screen w-[30%] border-l border-white/5 bg-black/50 backdrop-blur-xl p-8 z-50 overflow-y-auto hidden xl:block no-scrollbar">

            {/* Weather Widget (Simulated) */}
            <div className="mb-10 relative group cursor-pointer overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-black/80 z-0" />
                <img
                    src="https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="relative z-10 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-sm">Riding Conditions</span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                    </div>

                    <div className="flex items-end gap-4 mb-4">
                        <h2 className="text-4xl font-bold text-white">18°C</h2>
                        <div className="text-zinc-400 text-sm mb-1.5 font-medium">Istanbul, TR</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/40 p-2 rounded-lg flex items-center gap-2 backdrop-blur-sm">
                            <Wind className="w-4 h-4 text-zinc-400" />
                            <span className="text-xs text-white font-mono">12 km/h</span>
                        </div>
                        <div className="bg-black/40 p-2 rounded-lg flex items-center gap-2 backdrop-blur-sm">
                            <CloudRain className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-white font-mono">10%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Riders */}
            <div className="mb-10">
                <div className="flex justify-between items-end mb-6">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Top Riders</h3>
                    <span className="text-xs text-[#E2FF3B] font-bold cursor-pointer hover:underline">View All</span>
                </div>

                <div className="space-y-4">
                    {topRiders.map((rider, idx) => (
                        <div key={idx} className="flex items-center gap-4 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                    <UserIcon className="w-5 h-5 text-zinc-500" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
                                    <div className="w-4 h-4 bg-[#E2FF3B] rounded-full flex items-center justify-center text-[10px] font-bold text-black border border-black">
                                        {idx + 1}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white text-sm group-hover:text-[#E2FF3B] transition-colors">{rider.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <Shield className="w-3 h-3 text-[#E2FF3B]" />
                                    <span>{rider.rank} • {rider.points.toLocaleString()} XP</span>
                                </div>
                            </div>
                            <button className="px-3 py-1 rounded-full border border-zinc-700 text-[10px] font-bold text-white hover:bg-white hover:text-black transition-all uppercase tracking-wide">
                                Follow
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trending Gear */}
            <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Trending Gear</h3>
                <div className="grid grid-cols-1 gap-4">
                    {trendingGear.map((product) => (
                        <div key={product._id} className="group relative aspect-[1.5] rounded-xl overflow-hidden cursor-pointer">
                            <img
                                src={product.image}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <div className="text-xs text-[#E2FF3B] font-bold uppercase tracking-wider mb-1">{product.brand}</div>
                                <h4 className="text-white font-bold leading-tight mb-2">{product.name}</h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-mono font-bold">₺{product.price.toLocaleString()}</span>
                                    <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </aside>
    );
};
