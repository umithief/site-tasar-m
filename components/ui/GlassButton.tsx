import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'neon';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    glow?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    variant = 'glass',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    glow = false,
    className = '',
    ...props
}) => {
    const baseClasses = 'relative font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-moto-accent to-moto-orange-600 text-black hover:from-moto-orange-600 hover:to-moto-accent shadow-glow hover:shadow-glow-lg',
        secondary: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30',
        ghost: 'bg-transparent text-white hover:bg-white/5',
        glass: 'bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 hover:border-white/20 shadow-glass',
        neon: 'bg-transparent border-2 border-moto-accent text-moto-accent hover:bg-moto-accent hover:text-black shadow-neon hover:shadow-glow-lg'
    };

    const sizeClasses = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base'
    };

    const glowEffect = glow ? 'after:absolute after:inset-0 after:bg-gradient-shine after:animate-shine' : '';

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowEffect} ${className} rounded-2xl`}
            {...props}
        >
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
                {children}
                {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
            </span>
        </motion.button>
    );
};
