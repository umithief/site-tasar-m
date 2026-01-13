import React from 'react';

interface LogoProps {
    variant?: 'full' | 'icon' | 'text';
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'full', className = "h-8 w-auto text-white" }) => {
    // Premium Geometric "Velocity Mark" Design
    // ViewBox handling based on variant

    // Icon Dimensions: 48x48
    // Text Dimensions: 140x48
    // Full Dimensions: 200x48 (Icon + Gap + Text)

    const renderIcon = () => (
        <g>
            {/* The Velocity Mark M */}
            {/* Two parallel racing lines converging into a sharp turn */}
            {/* Left Wing (The Approach) */}
            <path
                d="M8 42 L20 6 L28 6 L16 42 H8Z"
                fill="currentColor"
            />

            {/* Right Wing (The Exit) - Mirrored Angle but Parallel flow implies speed */}
            {/* Actually user said "M". Let's make it look like an M by mirroring geometry */}
            {/* Using a sharp V cut in the middle. */}

            <path
                d="M32 42 L44 6 L36 6 L24 42 H32Z"
                fill="currentColor"
                opacity="0.9"
            />

            {/* Connecting Curve / Bridge to form distinct M shape if needed, 
                or relying on the Gestalt "M" from the two pillars. 
                Let's add a center chevron to bridge them. 
            */}
            <path
                d="M20 6 L26 24 L32 6 H20Z"
                fill="currentColor"
            />

            {/* Accent Spark - Ignition Light */}
            <circle cx="44" cy="6" r="3" fill="#E2FF3B" />
        </g>
    );

    const renderText = (offsetX = 0) => (
        <g transform={`translate(${offsetX}, 0)`}>
            {/* MOTOVIBE Geometric Wordmark */}
            {/* Custom paths for consistent "Technical/Expensive" look without font dependencies */}

            {/* M */}
            <path d="M4 36 L4 12 L10 12 L14 24 L18 12 L24 12 L24 36 H20 L20 18 L16 30 H12 L8 18 L8 36 H4Z" fill="currentColor" />

            {/* O */}
            <path d="M30 36 L30 12 H42 L42 36 H30ZM34 32 H38 L38 16 H34 L34 32Z" fill="currentColor" />

            {/* T */}
            <path d="M48 12 H64 L64 16 H58 L58 36 H54 L54 16 H48 L48 12Z" fill="currentColor" />

            {/* O */}
            <path d="M70 36 L70 12 H82 L82 36 H70ZM74 32 H78 L78 16 H74 L74 32Z" fill="currentColor" />

            {/* V - Mirroring the Icon Angle */}
            <path d="M88 12 L94 36 H98 L104 12 H100 L96 28 L92 12 H88Z" fill="currentColor" />

            {/* I */}
            <path d="M110 36 L110 12 H114 L114 36 H110Z" fill="currentColor" />

            {/* B */}
            <path d="M120 36 L120 12 H130 C134 12 136 14 136 17 C136 19 135 21 132 22 C135 23 136 25 136 28 C136 32 134 36 128 36 H120ZM124 16 L124 21 H129 C131 21 132 20 132 18 C132 17 131 16 129 16 H124ZM124 32 H129 C131 32 132 30 132 28 C132 26 131 24 129 24 H124 L124 32Z" fill="currentColor" />

            {/* E */}
            <path d="M142 36 L142 12 H154 L154 16 H146 L146 22 H152 L152 26 H146 L146 32 H154 L154 36 H142Z" fill="currentColor" />
        </g>
    );

    let viewBox = "0 0 210 48";
    if (variant === 'icon') viewBox = "0 0 48 48";
    if (variant === 'text') viewBox = "0 0 160 48";

    return (
        <svg
            viewBox={viewBox}
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            fill="none" // Ensure we control fill via paths
        >
            {(variant === 'full' || variant === 'icon') && renderIcon()}
            {(variant === 'full') && renderText(60)}
            {(variant === 'text') && renderText(0)}
        </svg>
    );
};
