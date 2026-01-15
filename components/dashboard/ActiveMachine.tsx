import React from 'react';
import { motion } from 'framer-motion';

export const ActiveMachine = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#111] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-lg dark:shadow-xl relative overflow-hidden transition-colors duration-300"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-moto-accent/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-moto-accent/20 transition-colors" />
            <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <h3 className="font-bold text-gray-900 dark:text-white tracking-wide text-xs uppercase">CANLI VERİLER</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-transparent">
                    <div className="text-[10px] text-gray-500 uppercase mb-1">ANLIK HIZ</div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white font-mono flex items-end gap-1">
                        0 <span className="text-[10px] text-gray-400 font-sans font-bold mb-1">km/h</span>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-transparent">
                    <div className="text-[10px] text-gray-500 uppercase mb-1">MESAFE</div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white font-mono flex items-end gap-1">
                        0.0 <span className="text-[10px] text-gray-400 font-sans font-bold mb-1">km</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                <span className="text-[10px] text-gray-500 font-bold">Aktif Motor</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">Yamaha MT-07</span>
            </div>
        </motion.div>
    );
};
