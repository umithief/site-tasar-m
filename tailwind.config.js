/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
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
                background: '#f9fafb', // Light Gray
                surface: '#ffffff',    // White
                'surface-hover': '#f3f4f6',
                border: '#e5e7eb',

                'moto-dark': '#ffffff',
                'moto-card': '#ffffff',
                'moto-accent': 'rgb(var(--moto-accent-rgb) / <alpha-value>)',
                'moto-accent-hover': 'var(--moto-accent-hover)',

                'text-main': '#111827', // Gray 900
                'text-muted': '#6b7280', // Gray 500
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Inter', 'sans-serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shine': 'shine 3s infinite linear',
            },
            boxShadow: {
                'glow': '0 0 20px -5px var(--moto-accent)',
            }
        },
    },
    plugins: [],
}
