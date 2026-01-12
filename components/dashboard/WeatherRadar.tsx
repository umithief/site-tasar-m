import React from 'react';
import { CloudRain, Sun, Wind } from 'lucide-react';

export const WeatherRadar = () => {
    return (
        <div className="bg-[#111] rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
            <h3 className="font-bold text-white tracking-wide text-sm mb-4">HAVA DURUMU RADARI</h3>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Sun className="w-8 h-8 text-yellow-500" />
                    <div>
                        <div className="text-2xl font-bold text-white">24°</div>
                        <div className="text-[10px] text-gray-400">İstanbul, TR</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-white">Açık</div>
                    <div className="text-[10px] text-gray-500">H: 26° L: 18°</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-2 flex items-center gap-2">
                    <Wind className="w-4 h-4 text-blue-400" />
                    <div>
                        <div className="text-xs font-bold text-white">12 km/h</div>
                        <div className="text-[8px] text-gray-500">RÜZGAR</div>
                    </div>
                </div>
                <div className="bg-white/5 rounded-xl p-2 flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-gray-400" />
                    <div>
                        <div className="text-xs font-bold text-white">0%</div>
                        <div className="text-[8px] text-gray-500">YAĞIŞ</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
