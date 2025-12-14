import { useState, useEffect } from 'react';

export type DayPhase = 'morning' | 'day' | 'evening' | 'night';

export const useLivingTime = () => {
    const [isNight, setIsNight] = useState(false);
    const [phase, setPhase] = useState<DayPhase>('day');

    useEffect(() => {
        const checkTime = () => {
            const hour = new Date().getHours();
            
            // Night Mode: 7 PM to 6 AM
            const nightMode = hour >= 19 || hour < 6;
            setIsNight(nightMode);

            if (hour >= 5 && hour < 11) setPhase('morning');
            else if (hour >= 11 && hour < 17) setPhase('day');
            else if (hour >= 17 && hour < 21) setPhase('evening');
            else setPhase('night');
        };

        checkTime();
        // Check every minute
        const timer = setInterval(checkTime, 60000); 
        return () => clearInterval(timer);
    }, []);

    return { isNight, phase };
};