import React from 'react';
import { motion } from 'framer-motion';

export const ActiveMachine = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111] rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-moto-accent/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-moto-accent/20 transition-colors" />
            <h3 className="font-bold text-white tracking-wide text-sm mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                CANLI VERİLER
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Anlık Hız</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-mono font-bold text-white">0</span>
                        <span className="text-[10px] text-moto-accent font-bold">km/h</span>
                    </div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Mesafe</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-mono font-bold text-white">0.0</span>
                        <span className="text-[10px] text-moto-accent font-bold">km</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400">Aktif Motor</span>
                    <span className="text-xs font-bold text-white">Yamaha MT-07</span>
                </div>
            </div>
        </motion.div>
    );
};
