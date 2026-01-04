import React from 'react';
import { ViewState } from '../../types';
import { ExploreMap } from '../map/ExploreMap';

interface MobileExploreProps {
    onNavigate: (view: ViewState, data?: any) => void;
}

export const MobileExplore: React.FC<MobileExploreProps> = ({ onNavigate }) => {
    return (
        <div className="h-[100dvh] w-full bg-[#050505] overflow-hidden">
            <ExploreMap onNavigate={onNavigate} variant="mobile" />
        </div>
    );
};
