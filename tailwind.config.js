/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],

    theme: {
        container: {
            center: true,
            padding: "1.5rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                // Dark Theme Base
                'dark-bg': '#000000',
                'dark-surface': '#0A0A0A',
                'dark-card': '#111111',
                'dark-elevated': '#1A1A1A',

                // Premium Accent Colors
                'moto-accent': '#E2FF3B', // Refactored to Neon Lime
                'moto-orange': {
                    400: '#FF6B35',
                    500: '#FF4500',
                    600: '#E63E00',
                    700: '#CC3700',
                },
                'neon-yellow': '#FCD34D',
                'neon-cyan': '#06B6D4',
                'neon-green': '#10B981',
                'neon-purple': '#A855F7',
                'neon-pink': '#EC4899',

                // Gradients (use in bg-gradient-to-*)
                'gradient-orange-start': '#FF6B35',
                'gradient-orange-end': '#FCD34D',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Sora', 'Outfit', 'Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
            fontSize: {
                'hero': ['4rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
                'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shine': 'shine 3s infinite linear',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'fade-in': 'fadeIn 0.6s ease-out',
                'shimmer': 'shimmer 1.5s infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%) skewX(-20deg)' },
                    '100%': { transform: 'translateX(200%) skewX(-20deg)' },
                },
                shine: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(255, 69, 0, 0.5)' },
                    '100%': { boxShadow: '0 0 40px rgba(255, 69, 0, 0.8)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            boxShadow: {
                'glow-sm': '0 0 10px rgba(255, 69, 0, 0.3)',
                'glow': '0 0 20px rgba(255, 69, 0, 0.5)',
                'glow-lg': '0 0 40px rgba(255, 69, 0, 0.6)',
                'neon': '0 0 5px theme("colors.moto-accent"), 0 0 20px theme("colors.moto-accent")',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'gradient-shine': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
