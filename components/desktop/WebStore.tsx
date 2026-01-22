import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, ShoppingBag, ChevronDown, Check,
    ArrowRight, Star, Heart, Plus, Minus, X
} from 'lucide-react';

// Mock Data
const PRODUCTS = [
    {
        id: '1',
        brand: 'SHOEI',
        name: 'NXR2 Kask - Mat Siyah',
        price: 18900,
        image: 'https://images.unsplash.com/photo-1622185135505-2d795043dfeb?q=80&w=1964&auto=format&fit=crop',
        category: 'Kask',
        isNew: true
    },
    {
        id: '2',
        brand: 'DAINESE',
        name: 'Avro 4 Deri Mont',
        price: 24500,
        image: 'https://images.unsplash.com/photo-1551028919-ac7675cf5c63?q=80&w=1887&auto=format&fit=crop',
        category: 'Mont',
        discount: 10
    },
    {
        id: '3',
        brand: 'AGV',
        name: 'Pista GP RR - Carbon',
        price: 42000,
        image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1587&auto=format&fit=crop',
        category: 'Kask',
        isNew: true
    },
    {
        id: '4',
        brand: 'ALPINESTARS',
        name: 'GP Pro R3 Eldiven',
        price: 8500,
        image: 'https://images.unsplash.com/photo-1544652478-6653e09f1826?q=80&w=1887&auto=format&fit=crop',
        category: 'Eldiven'
    },
    {
        id: '5',
        brand: 'REVIT',
        name: 'Quantum 2 Air',
        price: 12400,
        image: 'https://images.unsplash.com/photo-1551028919-ac7675cf5c63?q=80&w=1887&auto=format&fit=crop',
        category: 'Mont'
    },
    {
        id: '6',
        brand: 'SHOEI',
        name: 'GT-Air II - Redux',
        price: 21000,
        image: 'https://images.unsplash.com/photo-1622185135505-2d795043dfeb?q=80&w=1964&auto=format&fit=crop',
        category: 'Kask'
    }
];

const FILTERS = {
    categories: ['Kask', 'Mont', 'Eldiven', 'Bot', 'Pantolon', 'Aksesuar'],
    brands: ['Dainese', 'Alpinestars', 'Shoei', 'AGV', 'Revit', 'Spidi']
};

export default function WebStore() {
    const [cartCount, setCartCount] = useState(2);
    const [priceRange, setPriceRange] = useState(15000);
    const [isCartExpanded, setIsCartExpanded] = useState(false);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#E2FF3B] selection:text-black relative overflow-hidden">

            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-3xl" />
            </div>

            {/* Main Layout */}
            <div className="relative z-10 max-w-[1600px] mx-auto p-8 flex gap-8">

                {/* 2. Left Sidebar: The "Filter Cockpit" */}
                <aside className="w-64 flex-shrink-0">
                    <div className="sticky top-24 h-[85vh] bg-[#0F1012]/60 backdrop-blur-xl border border-white/5 rounded-[32px] p-6 flex flex-col shadow-2xl">

                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-bold tracking-widest text-sm text-gray-400 font-display">FİLTRELER</h2>
                            <button className="text-xs text-[#E2FF3B] hover:text-white transition-colors">Temizle</button>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">

                            {/* Categories */}
                            <div>
                                <h3 className="font-bold text-white mb-4 flex items-center justify-between cursor-pointer group">
                                    <span>Kategoriler</span>
                                    <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                </h3>
                                <div className="space-y-2">
                                    {FILTERS.categories.map((cat, i) => (
                                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center group-hover:border-[#E2FF3B] transition-colors">
                                                {/* Mock Checkbox logic */}
                                                {i === 0 && <div className="w-2 h-2 bg-[#E2FF3B] rounded-[1px]" />}
                                            </div>
                                            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Brands */}
                            <div>
                                <h3 className="font-bold text-white mb-4 flex items-center justify-between cursor-pointer group">
                                    <span>Markalar</span>
                                    <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                </h3>
                                <div className="space-y-2">
                                    {FILTERS.brands.map((brand, i) => (
                                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center group-hover:border-[#E2FF3B] transition-colors">
                                            </div>
                                            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{brand}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h3 className="font-bold text-white mb-6">Fiyat Aralığı</h3>
                                <div className="relative h-1 bg-white/10 rounded-full mb-4">
                                    <div className="absolute left-0 top-0 h-full bg-[#E2FF3B] w-[60%]" />
                                    <div className="absolute left-[60%] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#E2FF3B] rounded-full shadow-[0_0_10px_#E2FF3B] cursor-grab active:cursor-grabbing" />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 font-mono">
                                    <span>₺0</span>
                                    <span className="text-white">₺{priceRange.toLocaleString('tr-TR')}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </aside>

                {/* Right Content */}
                <main className="flex-1 space-y-8">

                    {/* 3. Hero Section (The "Featured Drop") */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-[400px] w-full rounded-[32px] overflow-hidden relative group"
                    >
                        {/* Background Image */}
                        <img
                            src="https://images.unsplash.com/photo-1622185135755-1e3500d02b54?q=80&w=2070&auto=format&fit=crop"
                            alt="Featured"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-center p-16">
                            <span className="inline-block px-3 py-1 border border-[#E2FF3B] text-[#E2FF3B] text-xs font-bold tracking-widest uppercase rounded-full w-fit mb-6">
                                Yeni Koleksiyon
                            </span>
                            <h1 className="text-6xl font-black text-white leading-none mb-4 tracking-tighter italic">
                                PISTA GP RR <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">FUTURO</span>
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 max-w-lg font-light">
                                Profesyonel yarışçılar için tasarlanmış, rüzgar tünelinde şekillendirilmiş karbon fiber şaheser.
                            </p>

                            <div className="flex items-center gap-8">
                                <span className="text-5xl font-bold text-[#E2FF3B] tracking-tight">
                                    ₺42.000
                                </span>
                                <button className="h-14 px-8 bg-[#E2FF3B] text-black font-bold text-lg rounded-full hover:bg-white hover:scale-105 transition-all flex items-center gap-2">
                                    ŞİMDİ İNCELE
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>


                    {/* 4. Product Grid (The Gear Rack) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                        {PRODUCTS.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative bg-[#1A1A1A]/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden hover:border-white/20 transition-all hover:bg-[#1A1A1A]/60 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                            >
                                {/* Badges */}
                                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                    {product.isNew && (
                                        <span className="px-2 py-1 bg-[#E2FF3B] text-black text-[10px] font-black uppercase rounded-md tracking-wider">
                                            YENİ
                                        </span>
                                    )}
                                    {product.discount && (
                                        <span className="px-2 py-1 bg-white text-black text-[10px] font-black uppercase rounded-md tracking-wider">
                                            %{product.discount} İNDİRİM
                                        </span>
                                    )}
                                </div>

                                {/* Wishlist */}
                                <button className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/50 transition-colors">
                                    <Heart className="w-4 h-4" />
                                </button>

                                {/* Image Area */}
                                <div className="aspect-[4/5] relative p-6 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                                    />

                                    {/* Quick View Button - Fade in on hover */}
                                    <div className="absolute inset-x-0 bottom-6 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                                        <button className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold rounded-full hover:bg-white hover:text-black transition-colors">
                                            Hızlı Bakış
                                        </button>
                                    </div>
                                </div>

                                {/* Info Area */}
                                <div className="p-5 border-t border-white/5 bg-black/20">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{product.brand}</p>
                                            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-[#E2FF3B] transition-colors truncate pr-4">
                                                {product.name}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between mt-2">
                                        <div className="flex flex-col">
                                            {product.discount ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500 text-xs line-through">
                                                        ₺{Math.round(product.price * 1.1).toLocaleString('tr-TR')}
                                                    </span>
                                                    <span className="text-white font-bold text-lg">
                                                        ₺{product.price.toLocaleString('tr-TR')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-white font-bold text-lg">
                                                    ₺{product.price.toLocaleString('tr-TR')}
                                                </span>
                                            )}
                                        </div>

                                        <button className="w-10 h-10 rounded-full bg-[#E2FF3B] flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(226,255,59,0.3)]">
                                            <Plus className="w-5 h-5" strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </main>
            </div>

            {/* 5. Floating Cart Widget */}
            <motion.div
                className="fixed bottom-8 right-8 z-50"
                onHoverStart={() => setIsCartExpanded(true)}
                onHoverEnd={() => setIsCartExpanded(false)}
            >
                <motion.button
                    className="relative bg-black/60 backdrop-blur-xl border border-[#E2FF3B]/30 rounded-full h-16 flex items-center overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                    animate={{ width: isCartExpanded ? 200 : 64 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <div className="absolute left-0 w-16 h-16 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-[#E2FF3B]" />
                        {cartCount > 0 && (
                            <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full border border-black animate-pulse" />
                        )}
                    </div>

                    <div className="pl-16 pr-6 whitespace-nowrap">
                        <span className="text-xs text-gray-400 block font-medium">Toplam Tutar</span>
                        <span className="text-sm text-white font-bold">₺18.900</span>
                    </div>
                </motion.button>
            </motion.div>

        </div>
    );
}
