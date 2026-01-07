import React, { useRef, useEffect } from 'react';
import { motion, HTMLMotionProps, useSpring, useMotionValue } from 'framer-motion';
import { Loader2, LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useUIStore } from '../../store/useUIStore';

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
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    isDisabled?: boolean;
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    withMagnetic?: boolean;
    configOverride?: any;
}

// --- MASTER COMPONENT ---
export const VibeButton = React.forwardRef<HTMLButtonElement, VibeButtonProps>(({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    isDisabled = false,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    withMagnetic = true,
    className = '',
    configOverride,
    onClick,
    ...props
}, forwardedRef) => {

    // --- GLOBAL SETTINGS INTEGRATION ---
    const settings = useUIStore((state) => state.settings);
    let config = settings['VibeButton'] || {};

    // Allow local override for previews
    if (configOverride) {
        config = { ...config, ...configOverride };
    }

    // Merge Master Design Defaults with Admin Overrides
    const globalMagnetStrength = config.magneticStrength ?? 0.2;
    const globalRadius = config.borderRadius ?? (size === 'sm' ? '9999px' : '9999px'); // Default full rounded
    const globalAnimSpeed = config.animationSpeed ?? 1.5;
    const customPrimaryColor = config.primaryColor;

    // Initialize Magnetic Hook
    const { ref: magneticRef, x, y, handleMouseMove, handleMouseLeave } = useMagnetic(
        withMagnetic && !isLoading && !isDisabled && globalMagnetStrength > 0
    );

    // Combine refs
    const setRefs = (element: HTMLButtonElement) => {
        // @ts-ignore
        magneticRef.current = element;
        if (typeof forwardedRef === 'function') forwardedRef(element);
        else if (forwardedRef) forwardedRef.current = element;
    };

    // --- STYLES SYSTEM ---
    const baseStyles = "relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#E2FF3B] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed uppercase font-bold tracking-widest";

    const sizeStyles = {
        sm: "h-10 px-6 text-[10px]",
        md: "h-12 px-8 text-xs",
        lg: "h-14 px-10 text-sm"
    };

    const variantStyles = {
        primary: `
            bg-[#E2FF3B] text-black 
            shadow-[0_0_20px_rgba(226,255,59,0.3)]
            border-t border-white/20
            hover:shadow-[0_0_30px_rgba(226,255,59,0.6)]
        `,
        secondary: `
            bg-transparent border border-white/10 text-white
            hover:border-[#E2FF3B] hover:text-[#E2FF3B]
            hover:shadow-[0_0_15px_rgba(226,255,59,0.2)]
            backdrop-blur-md
        `,
        ghost: `
            bg-transparent text-white border-none
            hover:bg-white/5 hover:text-[#E2FF3B]
        `,
        outline: `
            bg-transparent border border-white/10 text-white backdrop-blur-md
            hover:border-[#E2FF3B] hover:text-[#E2FF3B]
            hover:bg-white/5
        `,
        danger: `
            bg-[#FF3E3E] text-white border-t border-white/40
            hover:shadow-[0_0_20px_rgba(255,62,62,0.5)]
        `
    };

    // Admin Panel Colors Override
    const dynamicStyle: React.CSSProperties = {
        borderRadius: globalRadius,
        width: fullWidth ? '100%' : 'auto',
        ...(variant === 'primary' && customPrimaryColor ? {
            backgroundColor: customPrimaryColor,
            boxShadow: `0 0 20px ${customPrimaryColor}60`,
            borderColor: 'rgba(255,255,255,0.4)'
        } : {})
    };

    // Shimmer Effect (Only for Primary or Solid variants)
    const showShimmer = (variant === 'primary' || variant === 'danger') && !isLoading && !isDisabled;

    const shimmerEffect = (
        <motion.div
            className="absolute inset-0 -translate-x-[150%]"
            variants={{
                hover: { translateX: '150%' }
            }}
            transition={{
                repeat: Infinity,
                duration: globalAnimSpeed,
                ease: "linear",
                repeatDelay: 0.5
            }}
            style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                transform: 'skewX(-20deg)',
                width: '50%'
            }}
        />
    );

    return (
        <motion.button
            ref={setRefs}
            style={{ x, y, ...dynamicStyle }}
            className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}

            // Interaction Props
            whileTap={!isLoading && !isDisabled ? { scale: 0.97 } : {}}
            whileHover={!isLoading && !isDisabled ? "hover" : ""}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}

            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={isLoading || isDisabled ? undefined : onClick}
            disabled={isDisabled || isLoading || props.disabled}
            {...props}
        >
            {/* Shimmer Layer */}
            {showShimmer && shimmerEffect}

            {/* Content Layer */}
            <div className="relative z-10 flex items-center justify-center gap-3">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}

                {!isLoading && Icon && iconPosition === 'left' && (
                    <Icon className="w-4 h-4" strokeWidth={2.5} />
                )}

                <span>{children}</span>

                {!isLoading && Icon && iconPosition === 'right' && (
                    <Icon className="w-4 h-4" strokeWidth={2.5} />
                )}
            </div>
        </motion.button>
    );
});

VibeButton.displayName = 'VibeButton';
