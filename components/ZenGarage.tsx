import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Wrench, Gauge, ArrowUpRight, Zap, Trophy, Shield, Activity, Calendar } from 'lucide-react';
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
            <div className="w-full h-80 border border-dashed border-zinc-800 rounded-[2.5rem] flex flex-col items-center justify-center bg-[#0A0A0A] relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(242,166,25,0.05),transparent_70%)] opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="p-6 bg-zinc-900 rounded-full mb-6 border border-white/5 relative z-10 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                    <Zap className="w-8 h-8 text-gray-600 group-hover:text-moto-accent transition-colors" />
                </div>
                <h3 className="text-xl font-display font-black text-white uppercase tracking-wider relative z-10">Garage Empty</h3>
                <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.2em] mt-2 relative z-10">No machines detected</p>
            </div>
        );
    }

    return (
        <div className="w-full pb-12">
            {/* 1. Cinematic Header */}
            <div className="flex items-end justify-between mb-10 px-2 relative">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2 opacity-80">
                        <div className="h-[1px] w-12 bg-moto-accent" />
                        <span className="text-[10px] font-mono text-moto-accent uppercase tracking-widest">System Grid</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter leading-none">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-moto-accent to-white">Paddock</span>
                    </h2>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Machine Collection • {bikes.length} Units Active
                    </p>
                </div>

                {isEditable && (
                    <button
                        onClick={onAdd}
                        className="hidden md:flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-moto-accent/50 transition-all group"
                    >
                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-moto-accent transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-300 group-hover:text-white">Add Machine</span>
                    </button>
                )}
            </div>

            {/* 2. Cinematic Grid (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Add Card (Always First if Editable) */}
                {isEditable && (
                    <motion.button
                        whileHover={{ scale: 0.99 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onAdd}
                        className="group relative h-[420px] rounded-[2.5rem] border border-dashed border-zinc-800 bg-[#0A0A0A] hover:bg-zinc-900/30 hover:border-moto-accent/40 transition-all flex flex-col items-center justify-center overflow-hidden"
                    >
                        {/* Blueprint Grid Background */}
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(242,166,25,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(242,166,25,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

                        <div className="relative z-10 w-20 h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-moto-accent transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <Plus className="w-8 h-8 text-zinc-600 group-hover:text-moto-accent transition-colors duration-300" />
                        </div>

                        <h3 className="relative z-10 text-lg font-display font-black text-zinc-500 group-hover:text-white uppercase tracking-widest transition-colors duration-300">
                            Acquire Machine
                        </h3>
                        <p className="relative z-10 text-[10px] text-zinc-700 font-mono mt-3 uppercase tracking-widest group-hover:text-moto-accent transition-colors duration-300">
                            Initialize New Protocol
                        </p>
                    </motion.button>
                )}

                {/* Bike Cards */}
                {bikes.map((bike, index) => (
                    <motion.div
                        key={bike._id}
                        layoutId={`bike-card-${bike._id}`}
                        onClick={() => onBikeClick?.(bike)}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15, type: "spring", stiffness: 50, damping: 20 }}
                        className={`group relative h-[420px] rounded-[2.5rem] overflow-hidden cursor-pointer bg-[#0A0A0A] border border-white/5 hover:border-white/20 transition-all duration-500 ${index === 0 && !isEditable ? 'md:col-span-2' : ''}`}
                    >
                        {/* Image Layer - Full Bleed */}
                        <div className="absolute inset-0 z-0">
                            <motion.img
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                src={bike.image}
                                alt={bike.model}
                                className="w-full h-full object-cover filter grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
                            />
                            {/* Dramatic Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-75 transition-opacity duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60" />
                        </div>

                        {/* Floating Glass Content */}
                        <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">

                            {/* Top: Status Badge */}
                            <div className="flex justify-between items-start">
                                <div className="px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-moto-accent animate-pulse' : 'bg-green-500'}`} />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{bike.brand}</span>
                                </div>

                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-moto-accent hover:border-moto-accent hover:text-black hover:scale-110">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Bottom: Info & Specs */}
                            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="text-3xl md:text-4xl font-display font-black text-white uppercase leading-[0.9] mb-4 italic drop-shadow-2xl">
                                    {bike.model}
                                </h3>

                                {/* Tech Specs Grid */}
                                <div className="grid grid-cols-2 gap-2 max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex flex-col justify-center">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Gauge className="w-3 h-3 text-moto-accent" />
                                            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Mileage</span>
                                        </div>
                                        <span className="text-lg font-mono font-bold text-white leading-none">{bike.km} <span className="text-[10px] text-gray-500">KM</span></span>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex flex-col justify-center">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Calendar className="w-3 h-3 text-moto-accent" />
                                            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Year</span>
                                        </div>
                                        <span className="text-lg font-mono font-bold text-white leading-none">{bike.year}</span>
                                    </div>
                                </div>

                                {/* Default View (Hidden on Hover) */}
                                <div className="flex items-center gap-4 mt-4 group-hover:hidden transition-all delay-75">
                                    <div className="flex items-center gap-2">
                                        <Wrench className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{bike.modifications?.length || 0} Improvements</span>
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
