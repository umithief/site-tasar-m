import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { RouteCard } from './RouteCard';
import { ChevronRight } from 'lucide-react';

import { routeService } from '../../services/routeService';
import { Route } from '../../types';

export const RouteSuggestions: React.FC = () => {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });
    const [routes, setRoutes] = React.useState<Route[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const data = await routeService.getRoutes('recommended'); // Assuming 'recommended' or similar filter
                // If API returns fewer than 3, maybe show all. For suggestions, top 5 is good.
                setRoutes(data.slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch suggested routes', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRoutes();
    }, []);

    if (isLoading) return <div className="py-8 text-center text-xs text-gray-400">Rotalar yükleniyor...</div>;
    if (routes.length === 0) return null;

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
                    <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        SANA ÖZEL ROTALAR
                        <div className="w-2 h-2 rounded-full bg-moto-accent animate-pulse" />
                    </h2>
                </div>

                <button className="text-xs font-bold text-gray-500 dark:text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors">
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
                            key={route._id || i}
                            initial={{ opacity: 0, x: 50 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{
                                duration: 0.5,
                                delay: i * 0.15 + 0.2,
                                type: "spring",
                                stiffness: 100,
                                damping: 20
                            }}
                            className="flex-shrink-0 w-80 md:w-96"
                        >
                            <RouteCard route={{
                                id: route._id,
                                title: route.title,
                                image: route.image,
                                difficulty: route.difficulty || 'Orta',
                                distance: route.distance,
                                duration: route.estimatedTime || '~2s',
                                curves: route.stats?.curves ? `${route.stats.curves} Viraj` : 'Virajlı'
                            }} />
                        </motion.div>
                    ))}

                    {/* End Spacer */}
                    <div className="w-2 flex-shrink-0" />
                </div>

                {/* Left Fade Indicator (Optional, if we want to show there's more) */}
                <div className="absolute top-0 right-0 bottom-8 w-12 bg-gradient-to-l from-gray-50/0 to-gray-50 dark:from-black/0 dark:to-black pointer-events-none md:hidden" />
            </div>
        </div>
    );
};
