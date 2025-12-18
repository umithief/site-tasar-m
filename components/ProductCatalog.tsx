import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, Hexagon, Shield, Zap } from 'lucide-react';

interface ProductSpec {
    label: string;
    value: string;
}

interface Product {
    id: string;
    sku: string;
    name: string;
    price: string;
    image: string;
    specs: ProductSpec[];
    description: string;
}

const PRODUCTS: Product[] = [
    {
        id: '1',
        sku: 'AGV-PSTA-RR',
        name: 'PISTA GP RR',
        price: '₺55.000',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200',
        description: 'World championship aerodynamic performance.',
        specs: [
            { label: 'Weight', value: '1.450g' },
            { label: 'Shell', value: '100% Carbon' },
            { label: 'Safety', value: 'ECE 22.06' }
        ]
    },
    {
        id: '2',
        sku: 'ALP-GP-TCH',
        name: 'SUPERTECH R',
        price: '₺28.400',
        image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=1200',
        description: 'The definitive racing boot.',
        specs: [
            { label: 'Material', value: 'Microfiber' },
            { label: 'Slider', value: 'TPU/Alu' },
            { label: 'Cert', value: 'CE Level 2' }
        ]
    },
    {
        id: '3',
        sku: 'DAI-LGN-S4',
        name: 'LAGUNA SECA 4',
        price: '₺42.900',
        image: 'https://images.unsplash.com/photo-1596706173770-3d7793b8e894?q=80&w=1200',
        description: 'Iconic racing leather suit.',
        specs: [
            { label: 'Hide', value: 'Cowhide' },
            { label: 'Hump', value: 'Aero 2.0' },
            { label: 'System', value: 'Tri-Axial' }
        ]
    },
    {
        id: '4',
        sku: 'SHO-NXR-2',
        name: 'NXR 2 MM93',
        price: '₺24.500',
        image: 'https://images.unsplash.com/photo-1622185135505-2d795043997a?q=80&w=1200',
        description: 'Pure sport riding definition.',
        specs: [
            { label: 'Weight', value: '1.390g' },
            { label: 'Shell', value: 'AIM Fiber' },
            { label: 'Visor', value: 'CWR-F2' }
        ]
    },
    {
        id: '5',
        sku: 'REV-GT-AIR',
        name: 'GT-AIR II',
        price: '₺18.900',
        image: 'https://images.unsplash.com/photo-1625043484555-47841a723e74?q=80&w=1200',
        description: 'Premium touring functionality.',
        specs: [
            { label: 'Comfort', value: '3D Liner' },
            { label: 'Sun', value: 'Integrated' },
            { label: 'Pinlock', value: 'Included' }
        ]
    },
    {
        id: '6',
        sku: 'KLI-IND-PRO',
        name: 'INDUCTION PRO',
        price: '₺12.100',
        image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=1200',
        description: 'Maximum airflow protection.',
        specs: [
            { label: 'Mesh', value: 'Karbonite' },
            { label: 'Armor', value: 'D3O L1' },
            { label: 'Fit', value: 'Regular' }
        ]
    }
];

const ProductCatalog: React.FC = () => {
    const [activeProductId, setActiveProductId] = useState<string>(PRODUCTS[0].id);
    const activeProduct = PRODUCTS.find(p => p.id === activeProductId) || PRODUCTS[0];

    return (
        <section className="bg-neutral-900 border-t border-white/5">
            <div className="flex flex-col lg:flex-row min-h-screen">

                {/* --- Left Column: Data Archive --- */}
                <div className="w-full lg:w-1/2 flex flex-col pt-12 lg:pt-24 pb-12 px-4 lg:px-12 border-r border-white/5 bg-neutral-900 relative z-10">

                    {/* Header */}
                    <div className="mb-12 lg:mb-20">
                        <div className="flex items-center gap-3 text-orange-500 mb-4">
                            <Hexagon size={14} fill="currentColor" />
                            <span className="text-xs font-mono tracking-[0.2em] uppercase">Inventory Manifest</span>
                        </div>
                        <h2 className="text-4xl lg:text-6xl font-display font-black text-white uppercase tracking-tighter leading-[0.9]">
                            Technical <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-700">Archive</span>
                        </h2>
                    </div>

                    {/* The List */}
                    <div className="flex flex-col">
                        <div className="flex justify-between text-[10px] items-center text-gray-600 uppercase tracking-widest font-mono mb-4 px-4">
                            <span>Product Unit</span>
                            <span>Specification / Cost</span>
                        </div>
                        <div className="h-px bg-white/10 w-full mb-2" />

                        {PRODUCTS.map((product) => (
                            <div
                                key={product.id}
                                onMouseEnter={() => setActiveProductId(product.id)}
                                onClick={() => setActiveProductId(product.id)}
                                className={`
                                    group relative flex flex-col md:flex-row md:items-center justify-between py-6 px-4 md:px-6 cursor-pointer border-b border-white/5 transition-all duration-300
                                    ${activeProductId === product.id ? 'bg-white/5' : 'hover:bg-white/[0.02]'}
                                `}
                            >
                                {/* Active Indicator Bar */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-orange-500 transition-transform duration-300 ${activeProductId === product.id ? 'scale-y-100' : 'scale-y-0'}`} />

                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono text-gray-500 group-hover:text-orange-500 transition-colors">
                                        //{product.sku}
                                    </span>
                                    <h3 className={`text-xl md:text-2xl font-bold uppercase transition-colors ${activeProductId === product.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        {product.specs.slice(0, 2).map((spec, idx) => (
                                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-gray-400 uppercase tracking-wide">
                                                {spec.value}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mt-4 md:mt-0">
                                    <span className="text-lg font-mono font-medium text-white/90">
                                        {product.price}
                                    </span>
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-orange-600 text-white transition-all duration-300 ${activeProductId === product.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`}>
                                        {activeProductId === product.id ? <ArrowRight size={16} /> : <Plus size={16} />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto pt-12 text-gray-600 text-xs font-mono flex justify-between">
                        <span>SYSr: READY</span>
                        <span>DB_V: 2.1.4</span>
                    </div>
                </div>

                {/* --- Right Column: Visual Stage (Sticky) --- */}
                <div className="hidden lg:block w-1/2 h-screen sticky top-0 bg-[#050505] overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeProductId}
                            initial={{ opacity: 0, scale: 1.1, filter: 'grayscale(100%) blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'grayscale(0%) blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.95, filter: 'grayscale(100%) blur(5px)' }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0 z-0"
                        >
                            <img
                                src={activeProduct.image}
                                alt={activeProduct.name}
                                className="w-full h-full object-cover opacity-80"
                            />
                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/50 to-transparent" />
                        </motion.div>
                    </AnimatePresence>

                    {/* HUD Overlay Details */}
                    <div className="absolute inset-0 p-12 flex flex-col justify-between z-10 pointer-events-none">

                        {/* Top Right Specs */}
                        <div className="flex flex-col items-end gap-2">
                            <motion.div
                                key={`badge-${activeProductId}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full"
                            >
                                <Shield size={14} className="text-orange-500" />
                                <span className="text-xs text-white font-mono uppercase tracking-widest">{activeProduct.specs[2]?.value || 'Certified'}</span>
                            </motion.div>
                        </div>

                        {/* Bottom Left: Huge Title + Desc */}
                        <div className="max-w-md">
                            <motion.span
                                key={`sku-${activeProductId}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="block text-orange-500 font-mono text-sm tracking-[0.3em] mb-2"
                            >
                                {activeProduct.sku}
                            </motion.span>

                            <div className="overflow-hidden">
                                <motion.h2
                                    key={`title-${activeProductId}`}
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1, ease: "circOut" }}
                                    className="text-6xl font-black text-white uppercase leading-[0.85] tracking-tighter mb-4"
                                >
                                    {activeProduct.name}
                                </motion.h2>
                            </div>

                            <motion.p
                                key={`desc-${activeProductId}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-400 text-sm leading-relaxed border-l-2 border-orange-500 pl-4"
                            >
                                {activeProduct.description}
                                <br />
                                <span className="text-[10px] text-gray-600 font-mono mt-2 block uppercase">
                                    Config: {activeProduct.specs.map(s => s.value).join(' / ')}
                                </span>
                            </motion.p>
                        </div>

                        {/* Decoration Lines */}
                        <div className="absolute bottom-12 right-12 w-32 h-32 border-b-2 border-r-2 border-white/10 rounded-br-3xl"></div>
                        <div className="absolute top-12 left-12 w-8 h-8 border-t-2 border-l-2 border-orange-500/50"></div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default ProductCatalog;
