import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { motion } from 'framer-motion';

// --- Custom Icons ---

// Pulse for Live Riders
const createRiderIcon = (isLive: boolean) => divIcon({
    className: 'custom-marker',
    html: `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 12px; height: 12px; background: #06b6d4; border-radius: 50%; box-shadow: 0 0 10px #06b6d4;"></div>
            ${isLive ? `<div class="pulse-ring" style="position: absolute; width: 100%; height: 100%; border: 2px solid #06b6d4; border-radius: 50%; opacity: 0; animation: pulse 2s infinite;"></div>` : ''}
        </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

// Lime for Hotspots
const createHotspotIcon = () => divIcon({
    className: 'custom-marker',
    html: `
         <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 16px; height: 16px; background: #E2FF3B; transform: rotate(45deg); border: 2px solid #000;"></div>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});


export const RiderMarker = ({ position, name, status, onClick }: any) => {
    return (
        <Marker
            position={position}
            icon={createRiderIcon(status === 'live')}
            eventHandlers={{ click: onClick }}
        >
            <Popup className="premium-popup">
                <div className="p-2 min-w-[120px]">
                    <h3 className="font-bold text-black">{name}</h3>
                    <div className="text-xs text-cyan-600 font-mono flex items-center gap-1">
                        {status === 'live' && <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />}
                        {status === 'live' ? 'Riding Now' : 'Last seen 5m ago'}
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

export const HotspotMarker = ({ position, title, type, onClick }: any) => {
    return (
        <Marker
            position={position}
            icon={createHotspotIcon()}
            eventHandlers={{ click: onClick }}
        >
            <Popup className="premium-popup">
                <div className="p-2">
                    <h3 className="font-bold text-black">{title}</h3>
                    <div className="text-xs text-lime-600 font-bold uppercase">{type}</div>
                </div>
            </Popup>
        </Marker>
    );
};
