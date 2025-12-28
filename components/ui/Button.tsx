
import React from 'react';
import { useAppSounds } from '../../hooks/useAppSounds';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'danger' | 'premium' | 'icon-glass' | 'cyber';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  disableSound?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled,
  disableSound = false,
  onClick,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}) => {
  const { playClick } = useAppSounds();

  const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-wider relative overflow-hidden transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 rounded-xl select-none";

  const variants = {
    // Solid Moto Accent with Glow & Shine
    primary: `
      bg-moto-accent text-black 
      hover:bg-[#ffb733] hover:scale-105
      shadow-[0_0_20px_rgba(242,166,25,0.4)] hover:shadow-[0_0_30px_rgba(242,166,25,0.6)]
      after:content-[''] after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent after:skew-x-[-20deg]
      hover:after:translate-x-[150%] hover:after:duration-700 after:transition-transform after:duration-500
    `,

    // Dark Surface
    secondary: "bg-[#1A1A17] hover:bg-[#252525] text-white border border-white/10 shadow-lg hover:border-white/20",

    // Premium White/Glass
    premium: "bg-white text-black hover:bg-gray-200 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105",

    // Glass (Misty)
    glass: `
      bg-white/5 backdrop-blur-md border border-white/10 text-white 
      hover:bg-white/10 hover:border-white/30 hover:scale-105 hover:text-moto-accent
      shadow-[0_0_20px_rgba(255,255,255,0.1)]
    `,

    // Wired
    outline: "bg-transparent border border-white/20 text-white hover:border-moto-accent hover:text-moto-accent hover:bg-moto-accent/5",

    // Minimal
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",

    // Danger
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.4)]",

    // Icon Glass (specific for small icon buttons)
    'icon-glass': `
      bg-white/5 border border-white/10 text-white 
      hover:bg-white/20 hover:border-white/40 hover:scale-110 hover:rotate-3 hover:text-moto-accent
      shadow-[0_0_15px_rgba(255,255,255,0.2)]
    `,

    // Cyber (Gradient Active State)
    cyber: `
      bg-gradient-to-r from-moto-accent to-yellow-500 text-black 
      hover:brightness-110 hover:scale-105 active:scale-95
      shadow-[0_0_20px_rgba(242,166,25,0.4)]
    `
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-3 text-xs",
    lg: "px-8 py-4 text-sm",
    icon: "p-3 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center" // Fixed size for icons
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      if (!disableSound) playClick();
      onClick?.(e);
    }
  };

  // Helper function to combine classes (simple version if cn not available, but user has clsx/tailwind-merge so better to reuse if possible. 
  // For now I'll just use template literal concatenation which I used in my previous step.
  // Note: I am not importing 'cn' here to avoid potential path issues with 'lib/utils' if it's different.
  // But wait, the original file I wrote to components/Button.tsx imported 'cn' from '../lib/utils'.
  // Now I am in 'components/ui/Button.tsx'. So path to 'lib/utils' should be '../../lib/utils'.
  // I will check if I can use '../../lib/utils'.
  // I'll stick to string concatenation for safety unless I verify.

  return (
    <button
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      <span className={`flex items-center gap-2 relative z-10 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {leftIcon}
        {children}
        {rightIcon}
      </span>

      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="animate-spin w-5 h-5" />
        </span>
      )}
    </button>
  );
};