import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings, Activity, Wrench, Gauge, ArrowUpRight, Zap } from 'lucide-react';
import { UserBike } from '../types';

interface ZenGarageProps {
    bikes: UserBike[];
    isEditable?: boolean;
    onAdd?: () => void;
    onBikeClick?: (bike: UserBike) => void;
}

export const ZenGarage: React.FC<ZenGarageProps> = ({ bikes, isEditable, onAdd, onBikeClick }) => {

    // Empty State (Futuristic)
    if (bikes.length === 0 && !isEditable) {
        return (
            <div className="w-full h-64 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center bg-zinc-900/20">
                <div className="p-4 bg-zinc-900 rounded-full mb-4 opacity-50">
                    <Zap className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Garage Empty</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header / Title */}
            <div className="flex items-end justify-between mb-8 px-2">
                <div>
                    <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter leading-none">
                        The <span className="text-moto-accent">Paddock</span>
                    </h2>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] mt-1">
                        Machine Collection • {bikes.length} Units
                    </p>
                </div>
                {isEditable && (
                    <button
                        onClick={onAdd}
                        className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Machine
                    </button>
                )}
            </div>

            {/* Cinematic Grid (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Add Card (Always First if Editable) */}
                {isEditable && (
                    <motion.button
                        whileHover={{ scale: 0.98 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onAdd}
                        className="group relative h-[320px] rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-moto-accent/30 transition-all flex flex-col items-center justify-center overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-300">
                            <Plus className="w-6 h-6 text-zinc-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-sm font-display font-bold text-zinc-500 group-hover:text-white uppercase tracking-widest transition-colors">
                            Acquire Machine
                        </h3>
                        <p className="text-[10px] text-zinc-700 font-mono mt-2 group-hover:text-moto-accent transition-colors">
                            Add to your fleet
                        </p>
                    </motion.button>
                )}

                {/* Bike Cards */}
                {bikes.map((bike, index) => (
                    <motion.div
                        key={bike._id}
                        layoutId={`bike-card-${bike._id}`}
                        onClick={() => onBikeClick?.(bike)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`group relative h-[320px] rounded-3xl overflow-hidden cursor-pointer bg-zinc-900 ${index === 0 && !isEditable ? 'md:col-span-2' : ''}`}
                    >
                        {/* Image Layer */}
                        <div className="absolute inset-0">
                            <img
                                src={bike.image}
                                alt={bike.model}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                        </div>

                        {/* Content Layer */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-between">

                            {/* Top: Status & Brand */}
                            <div className="flex justify-between items-start">
                                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-white/5">
                                    {bike.brand}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform -translate-y-2 group-hover:translate-y-0 text-white">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Bottom: Info & Specs */}
                            <div>
                                <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase leading-none mb-2 italic">
                                    {bike.model}
                                </h3>

                                <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300">
                                    <div className="pt-4 flex items-center gap-4 text-xs font-mono text-zinc-300 border-t border-white/10 mt-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                        <div className="flex items-center gap-1.5">
                                            <Wrench className="w-3 h-3 text-moto-accent" />
                                            <span>{bike.modifications?.length || 0} Mods</span>
                                        </div>
                                        <div className="w-[1px] h-3 bg-white/20" />
                                        <div className="flex items-center gap-1.5">
                                            <Gauge className="w-3 h-3 text-moto-accent" />
                                            <span>{bike.km} KM</span>
                                        </div>
                                        <div className="w-[1px] h-3 bg-white/20" />
                                        <div className="flex items-center gap-1.5">
                                            <Activity className="w-3 h-3 text-moto-accent" />
                                            <span>{bike.year}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
