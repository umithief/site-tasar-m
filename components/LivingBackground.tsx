import React from 'react';

export const LivingBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Pure Black Base */}
            <div className="absolute inset-0 bg-[#0f0f0f]"></div>

            {/* Showroom Spotlight - Top Center */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.06)_0%,transparent_100%)] blur-3xl"></div>

            {/* Subtle Ambient Glow - Bottom */}
            <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>
    );
};