import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Navigation, Filter, Star, MapPin, ChevronRight, Share2 } from 'lucide-react';
import { Route } from '../../types';
import { RouteDetailSheet } from './RouteDetailSheet';
import { routeService } from '../../services/routeService';

interface MobileRoutesProps {
    onStartRide?: (route: Route) => void;
}

export const MobileRoutes: React.FC<MobileRoutesProps> = ({ onStartRide }) => {
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    // ... params

    // ... (rest of logic)

    {/* Route Detail Sheet */ }
    <RouteDetailSheet
        route={selectedRoute}
        onClose={() => setSelectedRoute(null)}
        onStartNavigation={(route) => {
            if (onStartRide) onStartRide(route);
            else console.warn('onStartRide prop missing in MobileRoutes');
        }}
        onSaveRoute={() => console.log('Save Route')}
    />

        </div >
    );
};
