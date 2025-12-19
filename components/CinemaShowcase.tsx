import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CinemaCard } from './CinemaCard';
import { Product, ProductCategory } from '../types';
import { showcaseService } from '../services/showcaseService';
import { notify } from '../services/notificationService';
import { useAppSounds } from '../hooks/useAppSounds';
import { orderService } from '../services/orderService';
import { authService } from '../services/auth';

export const CinemaShowcase: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(1); // Default to middle one for best look
    const [isPaused, setIsPaused] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await showcaseService.getAll();
                if (data && data.length > 0) {
                    setProducts(data);
                    // Set active to middle item
                    setActiveIndex(Math.floor(data.length / 2));
                }
            } catch (error) {
                console.error("Failed to fetch showcase products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Auto-rotation
    React.useEffect(() => {
        if (isPaused || products.length === 0) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => {
                if (prev === null) return 0;
                return (prev + 1) % products.length;
            });
        }, 4000);
        return () => clearInterval(interval);
    }, [isPaused, products]);

    const { playSuccess } = useAppSounds();

    const handleAddToCart = async (product: Product) => {
        try {
            playSuccess();

            // Get current user or use a guest placeholder
            const currentUser = authService.getCurrentUser() || {
                _id: 'guest_' + Date.now(),
                name: 'Misafir Kullanıcı',
                email: 'misafir@motovibe.tr'
            } as any;

            // Create a single item order
            await orderService.createOrder(currentUser, [{
                ...product,
                quantity: 1
            }], product.price);

            notify.success(`${product.name} için ön sipariş talebiniz alındı!`);
        } catch (error) {
            console.error("Order creation failed", error);
            notify.error("Sipariş oluşturulurken bir hata oluştu.");
        }
    };

    const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

    return (
        <section className="relative py-24 md:py-32 bg-[#050505] overflow-hidden">
            {/* ... (Existing Background Elements) ... */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--moto-accent-rgb),0.05)_0%,transparent_70%)]" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                {/* Animated Particles (Simplified) */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-px h-32 bg-gradient-to-b from-transparent via-moto-accent/20 to-transparent"
                        initial={{ top: "-20%", left: `${20 * i}%`, opacity: 0 }}
                        animate={{
                            top: ["-20%", "120%"],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 5 + i,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 2
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-10">
                <div className="flex flex-col mb-12 md:mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 mb-6"
                    >
                        <div className="w-12 h-[1px] bg-moto-accent" />
                        <span className="text-moto-accent font-black tracking-[0.5em] text-[10px] uppercase">
                            The Winter '24 Selection
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl font-black text-white tracking-tighter"
                    >
                        FOCUS & <span className="text-white/10 italic">EXPANSION</span>
                    </motion.h2>
                </div>

                {/* Container: Stack on mobile, Row on desktop */}
                <div
                    className="flex flex-col md:flex-row gap-6 min-h-[650px] items-stretch"
                    style={{ perspective: "2000px" }}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {products.map((product, index) => (
                        <CinemaCard
                            key={product._id}
                            product={product}
                            isActive={activeIndex === index}
                            onHover={() => setActiveIndex(index)}
                            onLeave={() => { }}
                            onAddToCart={handleAddToCart}
                            onPreview={setPreviewProduct}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-20 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 pt-12"
                >
                    <div className="flex flex-col gap-1">
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-widest leading-none">Curation Metadata</span>
                        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Auto-Cycle: {isPaused ? "PAUSED" : "ACTIVE"}</span>
                    </div>

                    <div className="flex gap-4">
                        {products.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className="group flex flex-col gap-3 py-2"
                            >
                                <div className={`w-12 md:w-20 h-1 transition-all duration-700 rounded-full ${activeIndex === i ? 'bg-moto-accent shadow-[0_0_15px_rgba(var(--moto-accent-rgb),0.8)]' : 'bg-white/10 group-hover:bg-white/20'}`} />
                                <span className={`text-[9px] font-black transition-all duration-500 uppercase tracking-widest ${activeIndex === i ? 'text-white opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-100'}`}>0{i + 1}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 text-white/20 text-[10px] font-black uppercase tracking-widest">
                        <span>Scroll</span>
                        <div className="w-8 h-[1px] bg-white/10" />
                        <span>Discover</span>
                    </div>
                </motion.div>
            </div>

            {/* PREVIEW MODAL */}
            {previewProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        onClick={() => setPreviewProduct(null)}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative z-10 w-full max-w-5xl bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setPreviewProduct(null)}
                            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-white/10 flex items-center justify-center text-white transition-colors border border-white/10"
                        >
                            ✕
                        </button>

                        {/* Image Side */}
                        <div className="w-full md:w-1/2 h-[300px] md:h-auto relative bg-black">
                            <img
                                src={previewProduct.image}
                                alt={previewProduct.name}
                                className="w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent md:bg-gradient-to-r" />
                        </div>

                        {/* Content Side */}
                        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto">
                            <span className="text-moto-accent text-xs font-black tracking-widest uppercase mb-2">
                                {previewProduct.category}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-white leading-[0.9] tracking-tighter mb-6">
                                {previewProduct.name}
                            </h2>

                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-3xl font-mono font-bold text-white">₺{previewProduct.price.toLocaleString('tr-TR')}</span>
                                <span className="text-white/40 text-sm font-bold line-through">₺{(previewProduct.price * 1.2).toLocaleString('tr-TR')}</span>
                            </div>

                            <p className="text-white/70 text-lg leading-relaxed mb-8 border-l-2 border-white/10 pl-6">
                                {previewProduct.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {previewProduct.features.map((feat, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-moto-accent" />
                                        <span className="text-sm text-white/80 font-medium">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto pt-8 border-t border-white/10">
                                <button
                                    onClick={() => handleAddToCart(previewProduct)}
                                    className="w-full py-4 bg-moto-accent hover:bg-white text-black font-bold uppercase tracking-widest text-sm transition-colors rounded-xl flex items-center justify-center gap-2"
                                >
                                    <span>Pre-Order Now</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </section>
    );
};
