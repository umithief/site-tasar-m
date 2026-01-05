import React, { useRef, useState, useEffect } from 'react';
import { motion, HTMLMotionProps, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Loader2, LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for class merging
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- MAGNETIC HOOK ---
const useMagnetic = (active: boolean) => {
    const ref = useRef<HTMLButtonElement>(null);
    const position = { x: useMotionValue(0), y: useMotionValue(0) };

    const smoothOptions = { damping: 15, stiffness: 150, mass: 0.1 };
    const x = useSpring(position.x, smoothOptions);
    const y = useSpring(position.y, smoothOptions);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!active || !ref.current) return;
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();

        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;

        // Only activate if within range (simulated by checking if hovering usually, 
        // but here we limit the movement range to avoid it flying away)
        if (Math.abs(distanceX) < width && Math.abs(distanceY) < height) {
            position.x.set(distanceX * 0.2); // Sensitivity factor
            position.y.set(distanceY * 0.2);
        } else {
            position.x.set(0);
            position.y.set(0);
        }
    };

    const handleMouseLeave = () => {
        position.x.set(0);
        position.y.set(0);
    };

    return { ref, x, y, handleMouseMove, handleMouseLeave };
};

// --- TYPES ---
interface VibeButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'glass' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    withMagnetic?: boolean; // Enable/Disable magnetic effect
}

// --- COMPONENT ---
export const VibeButton = React.forwardRef<HTMLButtonElement, VibeButtonProps>(({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon: Icon,
    iconPosition = 'left',
    withMagnetic = true,
    className = '',
    onClick,
    ...props
}, forwardedRef) => {

    const { ref: magneticRef, x, y, handleMouseMove, handleMouseLeave } = useMagnetic(withMagnetic && !isLoading);

    // Combine refs
    const setRefs = (element: HTMLButtonElement) => {
        // @ts-ignore
        magneticRef.current = element;
        if (typeof forwardedRef === 'function') forwardedRef(element);
        else if (forwardedRef) forwardedRef.current = element;
    };

    // --- STYLES ---
    const baseStyles = "relative inline-flex items-center justify-center overflow-hidden transition-colors duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const sizeStyles = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base"
    };

    const variantStyles = {
        primary: `
            bg-[#E2FF3B] text-black font-black uppercase tracking-tighter rounded-full
            hover:shadow-[0_0_20px_rgba(226,255,59,0.5)] 
        `,
        secondary: `
            bg-transparent border border-white/20 text-white font-bold uppercase rounded-full
            hover:bg-white hover:text-black hover:border-white
        `,
        glass: `
            bg-white/5 border border-white/10 backdrop-blur-xl text-white font-bold rounded-xl
            hover:bg-white/10 hover:border-white/20
        `,
        danger: `
            bg-[#FF3E3E] text-white font-bold uppercase tracking-wide rounded-full
            hover:shadow-[0_0_20px_rgba(255,62,62,0.5)]
        `
    };

    const shimmerEffect = (
        <motion.div
            className="absolute inset-0 -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"
            style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transform: 'skewX(-20deg)'
            }}
        />
    );

    return (
        <motion.button
            ref={setRefs}
            style={{ x, y }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileTap={{ scale: 0.95 }}
            whileHover={variant === 'primary' ? { scale: 1.05 } : {}}
            className={cn(baseStyles, sizeStyles[size], variantStyles[variant], "group", className)}
            onClick={isLoading ? undefined : onClick}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {/* Hover Shine / Shimmer (Excluded for simple variants if desired, but good for all premium feel) */}
            {variant !== 'secondary' && shimmerEffect}

            {/* Content Wrapper for Relative Z-Index */}
            <div className="relative z-10 flex items-center gap-2">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}

                {!isLoading && Icon && iconPosition === 'left' && (
                    <Icon className={cn("w-4 h-4", size === 'lg' && "w-5 h-5")} />
                )}

                <span>{children}</span>

                {!isLoading && Icon && iconPosition === 'right' && (
                    <Icon className={cn("w-4 h-4", size === 'lg' && "w-5 h-5")} />
                )}
            </div>

        </motion.button>
    );
});

VibeButton.displayName = 'VibeButton';

// Add this to your globals.css or tailwind config for the shimmer animation to work perfectly if not already standard:
// @keyframes shimmer {
//   0% { transform: translateX(-100%) skewX(-20deg); }
//   100% { transform: translateX(200%) skewX(-20deg); }
// }
//
// Or use CSS in JS for the animation definition if you prefer self-contained:
/*
<style jsx global>{`
  @keyframes shimmer {
    from { transform: translateX(-100%) skewX(-20deg); }
    to { transform: translateX(200%) skewX(-20deg); }
  }
`}</style>
*/
