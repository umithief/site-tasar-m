
import React from 'react';

export const LOGO_ASSETS = {
    VELOCITY: {
        path: (
            <g>
                <path d="M8 42 L20 6 L28 6 L16 42 H8Z" fill="currentColor" />
                <path d="M32 42 L44 6 L36 6 L24 42 H32Z" fill="currentColor" opacity="0.9" />
                <path d="M20 6 L26 24 L32 6 H20Z" fill="currentColor" />
            </g>
        ),
        viewBox: "0 0 48 48"
    },
    HELMET: {
        path: (
            <g>
                <path d="M24 4 C14 4 6 12 6 22 V36 C6 38 8 40 10 40 H14 L16 34 H32 L34 40 H38 C40 40 42 38 42 36 V22 C42 12 34 4 24 4ZM36 22 H12 C12 16 17 10 24 10 C31 10 36 16 36 22Z" fill="currentColor" />
                <rect x="14" y="24" width="20" height="4" fill="currentColor" opacity="0.5" />
            </g>
        ),
        viewBox: "0 0 48 48"
    },
    PISTON: {
        path: (
            <g>
                <rect x="14" y="6" width="20" height="24" rx="2" fill="currentColor" />
                <rect x="12" y="10" width="24" height="4" rx="1" fill="currentColor" opacity="0.5" />
                <rect x="12" y="18" width="24" height="4" rx="1" fill="currentColor" opacity="0.5" />
                <rect x="22" y="30" width="4" height="14" fill="currentColor" />
                <circle cx="24" cy="40" r="4" fill="currentColor" />
            </g>
        ),
        viewBox: "0 0 48 48"
    }
};

export const FONT_STYLES = {
    TECH: { fontFamily: "'Orbitron', sans-serif" },
    RACING: { fontFamily: "'Eurostile', sans-serif", fontStyle: "italic" },
    MINIMAL: { fontFamily: "'Inter', sans-serif", fontWeight: 900 }
};
