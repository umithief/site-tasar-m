import React from 'react';
import { motion } from 'framer-motion';
import { UserBike } from '../../types';
import { Gauge, Zap, Calendar } from 'lucide-react';

interface WebGarageCardProps {
    bike: UserBike;
    onClick: () => void;
}

export const WebGarageCard: React.FC<WebGarageCardProps> = ({ bike, onClick }) => {
    return (
        <motion.div
            layoutId={`bike-${bike._id}`}
            onClick={onClick}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', damping: 20 }}
        >
            {/* Background Image */}
            <img
                src={bike.image || 'https://images.unsplash.com/photo-1558981806-ec527fa84c3d?q=80&w=1200'}
                alt={`${bike.brand} ${bike.model}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Neon Border Glow */}
            <div className="absolute inset-0 border border-moto-accent/0 group-hover:border-moto-accent/100 rounded-2xl transition-colors duration-300 pointer-events-none" />
            <div className="absolute inset-0 bg-moto-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Gradient Overlay (Always Visible) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

            {/* Content: Brand & Model */}
            <div className="absolute bottom-0 left-0 p-6 z-20 w-full transition-transform duration-300 group-hover:-translate-y-2">
                <h3 className="text-2xl font-display font-black text-white italic tracking-tighter uppercase relative inline-block">
                    {bike.brand}
                    <span className="block text-moto-accent text-lg not-italic font-sans font-bold tracking-normal">{bike.model}</span>
                </h3>
            </div>

            {/* Specs Overlay (Reveal on Hover) */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30">
                <div className="grid grid-cols-2 gap-4 w-full px-8">
                    {bike.cc && (
                        <div className="text-center">
                            <Gauge className="w-5 h-5 text-moto-accent mx-auto mb-1" />
                            <span className="block text-white font-mono font-bold text-lg">{bike.cc}cc</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Engine</span>
                        </div>
                    )}
                    {bike.hp && (
                        <div className="text-center">
                            <Zap className="w-5 h-5 text-moto-accent mx-auto mb-1" />
                            <span className="block text-white font-mono font-bold text-lg">{bike.hp} HP</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Power</span>
                        </div>
                    )}
                    <div className="text-center col-span-2 mt-2">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-white">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {bike.year} Model
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
