
// Helper functions to create DOM elements for Mapbox custom markers

export const createRiderMarkerElement = (isLive: boolean) => {
    const el = document.createElement('div');
    el.className = 'w-6 h-6 relative flex items-center justify-center cursor-pointer group';

    // Inner Dot
    const dot = document.createElement('div');
    dot.className = 'w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4] z-10';
    el.appendChild(dot);

    if (isLive) {
        // Pulse Ring
        const ring = document.createElement('div');
        ring.className = 'absolute w-full h-full border-2 border-cyan-500 rounded-full animate-ping opacity-75';
        el.appendChild(ring);
    }

    return el;
};

export const createHotspotMarkerElement = (type: string) => {
    const el = document.createElement('div');
    el.className = 'w-8 h-8 relative flex items-center justify-center cursor-pointer hover:scale-110 transition-transform';

    // Diamond Shape
    const diamond = document.createElement('div');
    diamond.className = 'w-4 h-4 bg-[#E2FF3B] border-2 border-black rotate-45 shadow-lg';
    el.appendChild(diamond);

    return el;
};
