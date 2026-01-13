import React from 'react';
import { useBranding } from '../../context/BrandingContext';
import { LOGO_ASSETS, FONT_STYLES } from './LogoAssets';

interface LogoProps {
    variant?: 'full' | 'icon' | 'text';
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'full', className = "h-8 w-auto" }) => {
    const { settings, isLoading } = useBranding();

    // Default to Velocity if loading or error
    const activeIcon = LOGO_ASSETS[settings?.iconType || 'VELOCITY'];
    const activeFont = FONT_STYLES[settings?.fontStyle || 'TECH'];

    // Render Icon based on settings
    const renderIcon = () => (
        <g style={{ color: settings?.primaryColor || 'currentColor' }}>
            {activeIcon.path}
        </g>
    );

    // Render Text with dynamic font and spacing
    const renderText = (offsetX = 0) => (
        <g transform={`translate(${offsetX}, 0)`}>
            <text
                x="0"
                y="34"
                fill="currentColor"
                style={{
                    ...activeFont,
                    fontSize: '28px',
                    letterSpacing: `${settings?.letterSpacing || 0}px`,
                    fontWeight: 'bold' // Ensure it's bold enough
                }}
            >
                MOTOVIBE
            </text>
        </g>
    );

    // ViewBox logic
    let viewBox = activeIcon?.viewBox || "0 0 48 48"; // Default icon viewbox

    if (variant === 'full') {
        // Approximate width calculation based on text
        // Icon (48) + Gap (12) + Text (approx 140)
        viewBox = "0 0 200 48";
    } else if (variant === 'text') {
        viewBox = "0 0 150 48";
    }

    if (isLoading) return <div className="h-8 w-8 bg-gray-800 animate-pulse rounded-full" />;

    return (
        <svg
            viewBox={viewBox}
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
        >
            {(variant === 'full' || variant === 'icon') && renderIcon()}

            {(variant === 'full') && (
                <g transform="translate(60, 0)">
                    <text
                        x="0"
                        y="34"
                        fill="currentColor"
                        style={{
                            ...activeFont,
                            fontSize: '28px',
                            letterSpacing: `${settings?.letterSpacing || 0}px`,
                            fontWeight: 'bold'
                        }}
                    >
                        MOTOVIBE
                    </text>
                </g>
            )}

            {(variant === 'text') && (
                <text
                    x="0"
                    y="34"
                    fill="currentColor"
                    style={{
                        ...activeFont,
                        fontSize: '28px',
                        letterSpacing: `${settings?.letterSpacing || 0}px`,
                        fontWeight: 'bold'
                    }}
                >
                    MOTOVIBE
                </text>
            )}
        </svg>
    );
};
