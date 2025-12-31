import React from 'react';
import { useLanguage } from '../../contexts/LanguageProvider';

interface RouteFiltersProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

export const RouteFilters: React.FC<RouteFiltersProps> = ({ activeFilter, onFilterChange }) => {
    const { t } = useLanguage();
    const filters = ['All', 'Kolay', 'Orta', 'Zor', 'Extreme'];

    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {filters.map(filter => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeFilter === filter
                            ? 'bg-moto-accent text-black border-moto-accent shadow-lg shadow-moto-accent/20'
                            : 'bg-[#1A1A1C] text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                        }`}
                >
                    {filter === 'All' ? t('shop.all') : filter}
                </button>
            ))}
        </div>
    );
};
