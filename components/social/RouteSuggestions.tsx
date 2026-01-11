import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { RouteCard } from './RouteCard';
import { ChevronRight } from 'lucide-react';

export const RouteSuggestions: React.FC = () => {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    // Mock Data
    const routes = [
        {
            id: '1',
            title: 'Toroslar Geçidi & Kanyon Yolu',
            image: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?auto=format&fit=crop&q=80&w=1000',
            difficulty: 'ORTA (Virajlı)',
            distance: '145 KM',
            duration: '~3s 15dk',
            curves: '52 Viraj'
        },
        {
            id: '2',
            title: 'Sahil Şeridi: Kaş - Kalkan',
            image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000',
            difficulty: 'KOLAY (Manzara)',
            distance: '28 KM',
            duration: '~45dk',
            curves: '18 Viraj'
        },
        {
            id: '3',
            title: 'Ilgaz Dağı Zirve Tırmanışı',
            image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000',
            difficulty: 'ZOR (Technical)',
            distance: '85 KM',
            duration: '~2s 10dk',
            curves: '110 Viraj'
        }
    ];

    return (
        <div ref={containerRef} className="py-8 space-y-4">
            {/* Header */}
            <motion.div
                className="px-6 flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
            >
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-moto-accent mb-1">ÖNERİLENLER</span>
                    <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                        SANA ÖZEL ROTALAR
                        <div className="w-2 h-2 rounded-full bg-moto-accent animate-pulse" />
                    </h2>
                </div>

                <button className="text-xs font-bold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                    Tümünü Gör <ChevronRight className="w-3 h-3" />
                </button>
            </motion.div>

            {/* Carousel Container */}
            <div className="relative w-full">
                {/* Scrollable Area */}
                <div
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 pb-8 no-scrollbar"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {routes.map((route, i) => (
                        <motion.div
                            key={route.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{
                                duration: 0.5,
                                delay: i * 0.15 + 0.2,
                                type: "spring",
                                stiffness: 100,
                                damping: 20
                            }}
                        >
                            <RouteCard route={route} />
                        </motion.div>
                    ))}

                    {/* End Spacer */}
                    <div className="w-2 flex-shrink-0" />
                </div>

                {/* Left Fade Indicator (Optional, if we want to show there's more) */}
                <div className="absolute top-0 right-0 bottom-8 w-12 bg-gradient-to-l from-black/80 to-transparent pointer-events-none md:hidden" />
            </div>
        </div>
    );
};
