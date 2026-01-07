import React from 'react';
import { Shield, Weight, Wind, Droplets } from 'lucide-react';

interface ProductSpecsProps {
    specs?: {
        material?: string;
        weight?: string;
        protection?: string;
        weather?: string;
    }
}

export const ProductSpecs: React.FC<ProductSpecsProps> = ({ specs }) => {
    // Default values if not provided
    const data = {
        material: specs?.material || 'Carbon Fiber',
        protection: specs?.protection || 'ECE 22.06',
        weight: specs?.weight || '1350g',
        weather: specs?.weather || 'Waterproof'
    };

    const items = [
        { label: 'Material', value: data.material, icon: Shield, colSpan: 'col-span-1' },
        { label: 'Protection', value: data.protection, icon: Shield, colSpan: 'col-span-1' },
        { label: 'Weight', value: data.weight, icon: Weight, colSpan: 'col-span-1' },
        { label: 'Weather', value: data.weather, icon: Droplets, colSpan: 'col-span-1' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="bg-[#111] border border-white/5 p-4 rounded-xl flex flex-col justify-between h-28 group hover:border-[#E2FF3B]/30 transition-colors"
                >
                    <div className="flex justify-between items-start">
                        <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">{item.label}</span>
                        <item.icon size={16} className="text-[#E2FF3B] opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="font-mono text-lg font-bold text-white group-hover:text-[#E2FF3B] transition-colors truncat">
                        {item.value}
                    </div>
                </div>
            ))}
        </div>
    );
};
