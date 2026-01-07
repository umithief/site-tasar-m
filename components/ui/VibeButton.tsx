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
    theme?: 'default' | 'cyber' | 'brutal' | 'racing' | 'pixel' | 'flow'; // Structural design
    skin?: 'default' | 'cosmic' | 'liquid' | 'carbon' | 'glass' | 'holographic' | 'magma' | 'glitch'; // Background/Texture design
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
    theme,
    skin,
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
    const activeTheme = theme || config.buttonStyle || 'default';
    const activeSkin = skin || config.buttonSkin || 'default';

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

    // --- THEME DEFINITIONS ---
    const themeStyles: Record<string, string> = {
        default: "", // Standard logic applies
        cyber: "rounded-none border-l-2 border-r-2 border-t-0 border-b-0 border-[var(--primary)] hover:border-white tracking-[0.25em] skew-x-[-10deg] hover:skew-x-0 font-mono text-[10px]",
        brutal: "rounded-none border-2 border-white shadow-[4px_4px_0px_white] hover:shadow-[none] hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[4px] active:translate-y-[4px] font-black",
        racing: "rounded rounded-tr-2xl rounded-bl-2xl italic border-b-4 border-black/30 hover:border-black/50 transform hover:-translate-y-1 active:translate-y-0 active:border-b-0",
        pixel: "rounded-none border-4 border-white font-mono uppercase tracking-widest hover:border-[#E2FF3B] active:border-white shadow-[inset_-4px_-4px_0px_rgba(0,0,0,0.5)]",
        flow: "rounded-[2rem] border border-white/20 hover:rounded-xl transition-all duration-500 ease-out hover:shadow-[0_10px_40px_rgba(var(--primary),0.4)]"
    };

    // Inject custom properties for themes that use them
    const themeVariables = {
        '--primary': customPrimaryColor || '#E2FF3B'
    } as React.CSSProperties;

    // --- SKIN DEFINITIONS ---
    // These override the background and text colors of the variant
    const skinStyles: Record<string, string> = {
        default: "",
        cosmic: "bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-center before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-900 before:via-blue-900 before:to-black before:mix-blend-multiply !text-white border border-white/20 hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]",
        liquid: "bg-gradient-to-br from-gray-200 via-white to-gray-300 !text-black border-white/50 bg-[length:200%_200%] animate-[gradient_3s_ease_infinite] hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.8),0_0_20px_rgba(255,255,255,0.4)]",
        carbon: "bg-[radial-gradient(black_15%,transparent_16%),radial-gradient(black_15%,transparent_16%)] bg-[length:4px_4px] bg-zinc-900 !text-zinc-300 border border-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-zinc-800",
        glass: "bg-white/10 backdrop-blur-xl border border-white/20 !text-white shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:bg-white/20",
        holographic: "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] !text-white border-none shadow-[0_0_20px_rgba(255,255,255,0.4)]",
        magma: "bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 bg-[length:200%_200%] animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite] !text-black font-black border-red-900",
        glitch: "bg-black text-[#E2FF3B] border border-[#E2FF3B] hover:shadow-[2px_0_0_red,-2px_0_0_cyan] hover:translate-x-[1px]"
    };

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
        borderRadius: (activeTheme === 'default') ? globalRadius : undefined, // Themes override radius
        width: fullWidth ? '100%' : 'auto',
        ...themeVariables,
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
            className={cn(baseStyles, sizeStyles[size], variantStyles[variant], themeStyles[activeTheme], skinStyles[activeSkin], className)}

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
