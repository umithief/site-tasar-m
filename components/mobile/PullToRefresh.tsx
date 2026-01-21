import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Settings, RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    isMobile?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, isMobile = false }) => {
    const [pullY, setPullY] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const isValidPull = useRef(false);
    const controls = useAnimation();
    const THRESHOLD = 80;

    // Only enable on mobile touch devices
    useEffect(() => {
        if (!isMobile) return;

        const container = containerRef.current;
        if (!container) return;

        const handleTouchStart = (e: TouchEvent) => {
            // Only allow pulling if we are exactly at the top
            if (window.scrollY === 0) {
                isValidPull.current = true;
                startY.current = e.touches[0].clientY;
            } else {
                isValidPull.current = false;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isValidPull.current) return;

            const currentY = e.touches[0].clientY;
            const diff = currentY - startY.current;

            if (window.scrollY === 0 && diff > 0 && !isRefreshing) {
                // Prevent default pull-to-refresh of browser if possible (tricky)
                // e.preventDefault(); // Warning: passive event listener issues
                setPullY(Math.min(diff * 0.5, 120)); // Damping
            }
        };

        const handleTouchEnd = async () => {
            if (pullY > THRESHOLD && !isRefreshing) {
                setIsRefreshing(true);
                setPullY(THRESHOLD); // Snap to threshold

                // Spin animation handled by CSS/Framer
                await onRefresh();

                setIsRefreshing(false);
                setPullY(0);
            } else {
                setPullY(0); // Snap back
            }
        };

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: true });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isMobile, pullY, isRefreshing, onRefresh]);

    return (
        <div ref={containerRef} className="relative">
            {/* Spinning Gear Indicator */}
            <div
                className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-10"
                style={{
                    transform: `translateY(${pullY - 40}px)`,
                    opacity: pullY > 0 ? 1 : 0
                }}
            >
                <motion.div
                    animate={isRefreshing ? { rotate: 360 } : { rotate: pullY * 2 }}
                    transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0 }}
                    className="bg-black/80 backdrop-blur-md p-2 rounded-full border border-moto-accent/50 shadow-[0_0_15px_rgba(255,87,34,0.3)]"
                >
                    <Settings className="w-6 h-6 text-moto-accent" />
                </motion.div>
            </div>

            {/* Content with Elastic Pull */}
            <motion.div
                animate={{ y: pullY }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {children}
            </motion.div>
        </div>
    );
};
