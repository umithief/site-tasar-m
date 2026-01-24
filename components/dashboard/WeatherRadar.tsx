import React from 'react';
import { CloudRain, Sun, Wind } from 'lucide-react';

export const WeatherRadar = () => {
    return (
        <div className="bg-white dark:bg-[#111] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <h3 className="font-bold text-gray-900 dark:text-white tracking-wide text-sm mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                HAVA DURUMU RADARI
            </h3>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Sun className="w-10 h-10 text-yellow-500 fill-yellow-500/20" />
                    <div>
                        <div className="text-3xl font-display font-black text-gray-900 dark:text-white">24°</div>
                        <div className="text-xs text-gray-500 font-medium">İstanbul, TR</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">Açık</div>
                    <div className="text-xs text-gray-500 font-medium">H: 26° L: 18°</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-3 flex items-center gap-3 border border-gray-100 dark:border-white/5 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-500/10 group-hover:border-blue-100 dark:group-hover:border-blue-500/20 transition-colors">
                    <Wind className="w-5 h-5 text-blue-500" />
                    <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">12 <span className="text-[10px] text-gray-500 font-normal">km/h</span></div>
                        <div className="text-[8px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">RÜZGAR</div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-3 flex items-center gap-3 border border-gray-100 dark:border-white/5 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-500/10 group-hover:border-blue-100 dark:group-hover:border-blue-500/20 transition-colors">
                    <CloudRain className="w-5 h-5 text-blue-400" />
                    <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">0%</div>
                        <div className="text-[8px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">YAĞIŞ</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
