import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

interface LayoutSwitcherProps {
    MobileLayout: React.ComponentType;
    WebLayout: React.ComponentType;
}

const LayoutSwitcher: React.FC<LayoutSwitcherProps> = ({ MobileLayout, WebLayout }) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <MobileLayout />;
    }

    return <WebLayout />;
};

export default LayoutSwitcher;
