import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
    wrapperClassName?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
    label,
    error,
    icon: Icon,
    wrapperClassName = '',
    className = '',
    ...props
}) => {
    return (
        <div className={`space-y-2 ${wrapperClassName}`}>
            {label && (
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-moto-accent transition-colors">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <input
                    className={`
                        w-full bg-white/5 backdrop-blur-md border border-white/10
                        rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30
                        focus:outline-none focus:border-moto-accent focus:bg-white/10
                        transition-all duration-300
                        ${Icon ? 'pl-12' : ''}
                        ${error ? 'border-red-500/50 focus:border-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {/* Focus Glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-moto-accent/20 to-neon-yellow/20 blur-xl" />
                </div>
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 ml-1"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    wrapperClassName?: string;
}

export const GlassTextarea: React.FC<GlassTextareaProps> = ({
    label,
    error,
    wrapperClassName = '',
    className = '',
    ...props
}) => {
    return (
        <div className={`space-y-2 ${wrapperClassName}`}>
            {label && (
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                <textarea
                    className={`
                        w-full bg-white/5 backdrop-blur-md border border-white/10
                        rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30
                        focus:outline-none focus:border-moto-accent focus:bg-white/10
                        transition-all duration-300 resize-none
                        ${error ? 'border-red-500/50 focus:border-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {/* Focus Glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-moto-accent/20 to-neon-yellow/20 blur-xl" />
                </div>
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 ml-1"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    wrapperClassName?: string;
    options: { value: string; label: string }[];
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
    label,
    error,
    options,
    wrapperClassName = '',
    className = '',
    ...props
}) => {
    return (
        <div className={`space-y-2 ${wrapperClassName}`}>
            {label && (
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                <select
                    className={`
                        w-full bg-white/5 backdrop-blur-md border border-white/10
                        rounded-2xl px-4 py-3.5 text-white
                        focus:outline-none focus:border-moto-accent focus:bg-white/10
                        transition-all duration-300 appearance-none cursor-pointer
                        ${error ? 'border-red-500/50 focus:border-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-dark-card text-white">
                            {option.label}
                        </option>
                    ))}
                </select>
                {/* Chevron Icon */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                {/* Focus Glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-moto-accent/20 to-neon-yellow/20 blur-xl" />
                </div>
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 ml-1"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};
