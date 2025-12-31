import React from 'react';
import { FilterState } from '../../types';
import { Search, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageProvider';

interface ShopFiltersProps {
    filters: FilterState;
    onChange: (newFilters: FilterState) => void;
    categories: string[];
    onClear: () => void;
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({
    filters,
    onChange,
    categories,
    onClear
}) => {
    const { t } = useLanguage();

    const handleCategoryChange = (category: string) => {
        const newCategories = filters.categories.includes(category)
            ? filters.categories.filter(c => c !== category)
            : [...filters.categories, category];

        onChange({ ...filters, categories: newCategories });
    };

    return (
        <div className="w-full lg:w-64 space-y-8 sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{t('shop.filters')}</h3>
                <button
                    onClick={onClear}
                    className="text-xs text-gray-400 hover:text-moto-accent flex items-center gap-1 transition-colors"
                >
                    <RotateCcw size={12} />
                    {t('shop.clear_filters')}
                </button>
            </div>

            {/* Search Filter */}
            <div className="relative">
                <input
                    type="text"
                    placeholder={t('common.search_placeholder')}
                    value={filters.search}
                    onChange={(e) => onChange({ ...filters, search: e.target.value })}
                    className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-4 py-2 pl-10 text-sm focus:border-moto-accent focus:outline-none transition-colors"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
            </div>

            {/* Categories */}
            <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                    {t('shop.categories')}
                </h4>
                <div className="space-y-2">
                    {categories.map(category => (
                        <label
                            key={category}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.categories.includes(category)
                                    ? 'bg-moto-accent border-moto-accent'
                                    : 'border-white/20 group-hover:border-white/40'
                                }`}>
                                {filters.categories.includes(category) && (
                                    <span className="text-black text-xs font-bold">✓</span>
                                )}
                            </div>
                            <span className={`text-sm transition-colors ${filters.categories.includes(category) ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                                }`}>
                                {category}
                            </span>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={filters.categories.includes(category)}
                                onChange={() => handleCategoryChange(category)}
                            />
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                    {t('shop.price_range')}
                </h4>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={filters.minPrice}
                            onChange={(e) => onChange({ ...filters, minPrice: Number(e.target.value) })}
                            placeholder="Min"
                            className="w-full bg-[#1A1A1C] border border-white/10 rounded px-3 py-2 text-sm text-center"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                            type="number"
                            value={filters.maxPrice}
                            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
                            placeholder="Max"
                            className="w-full bg-[#1A1A1C] border border-white/10 rounded px-3 py-2 text-sm text-center"
                        />
                    </div>
                    {/* Range Slider could be added here */}
                </div>
            </div>

            {/* Sort Options */}
            <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                    {t('shop.sort')}
                </h4>
                <select
                    value={filters.sortBy}
                    onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
                    className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-moto-accent focus:outline-none cursor-pointer"
                >
                    <option value="featured">{t('shop.recommended')}</option>
                    <option value="price-asc">{t('shop.price_low_high')}</option>
                    <option value="price-desc">{t('shop.price_high_low')}</option>
                    <option value="rating">{t('shop.rating_high')}</option>
                </select>
            </div>
        </div>
    );
};
