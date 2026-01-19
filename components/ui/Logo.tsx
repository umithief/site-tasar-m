import React from 'react';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
    className = "",
    size = 'md',
    showText = true
}) => {

    // Size Configurations
    const sizeConfig = {
        sm: {
            container: "w-6 h-6 rounded-md",
            icon: "w-4 h-4",
            text: "text-lg",
            gap: "gap-1.5"
        },
        md: {
            container: "w-8 h-8 rounded-lg",
            icon: "w-6 h-6",
            text: "text-xl",
            gap: "gap-2"
        },
        lg: {
            container: "w-12 h-12 rounded-xl",
            icon: "w-8 h-8",
            text: "text-3xl",
            gap: "gap-3"
        }
    };

    const config = sizeConfig[size];

    return (
        <div className={`flex items-center ${config.gap} cursor-pointer select-none ${className}`}>
            {/* Icon Container */}
            <div className={`${config.container} flex items-center justify-center bg-white/5 border border-white/10 text-orange-500 shadow-lg shadow-orange-500/10`}>
                <Zap className={`${config.icon} fill-current`} />
            </div>

            {/* Text */}
            {showText && (
                <span className={`font-display font-bold ${config.text} text-white tracking-tight relative leading-none mt-0.5 drop-shadow-md`}>
                    MOTO
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">
                        VIBE
                    </span>
                </span>
            )}
        </div>
    );
};
