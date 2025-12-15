import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: any;
    trend: number;
    color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-[#1A1A17] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon className="w-16 h-16" />
        </div>
        <div className="relative z-10">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
            <h3 className="text-3xl font-mono font-bold text-white mb-4">{value}</h3>
            <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${trend > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(trend)}%
                </span>
                <span className="text-xs text-gray-600">geçen aya göre</span>
            </div>
        </div>
    </div>
);
