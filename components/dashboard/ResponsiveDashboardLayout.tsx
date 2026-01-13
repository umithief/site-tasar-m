import React, { useEffect } from 'react';
import { DashboardDrawer } from './DashboardDrawer';
import { RiderProfile } from './RiderProfile';
import { ActiveMachine } from './ActiveMachine';
import { WeatherRadar } from './WeatherRadar';

interface ResponsiveDashboardLayoutProps {
    children: React.ReactNode; // Feed
    rightSidebar?: React.ReactNode; // Existing Right Sidebar
    user: any;
    isMobileDrawerOpen: boolean;
    onCloseMobileDrawer: () => void;
}

export const ResponsiveDashboardLayout: React.FC<ResponsiveDashboardLayoutProps> = ({
    children,
    rightSidebar,
    user,
    isMobileDrawerOpen,
    onCloseMobileDrawer
}) => {

    // Lock Body Scroll when Drawer is Open
    useEffect(() => {
        if (isMobileDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileDrawerOpen]);

    return (
        <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] 2xl:grid-cols-[280px_1fr_320px] gap-6 relative items-start max-w-[1800px] px-0 lg:px-6 overflow-x-hidden">

            {/* LEFT SIDEBAR (Desktop Only) */}
            <div className="hidden lg:block sticky top-24 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar space-y-6">
                <RiderProfile user={user} />
                <ActiveMachine />
                <WeatherRadar />
            </div>

            {/* MOBILE DRAWER (Hidden on Desktop) */}
            <DashboardDrawer
                isOpen={isMobileDrawerOpen}
                onClose={onCloseMobileDrawer}
                user={user}
            />

            {/* MAIN CONTENT FEED */}
            <div className="min-h-screen min-w-0">
                {children}
            </div>

            {/* RIGHT SIDEBAR (Desktop Only, Passed as Prop) */}
            {rightSidebar && (
                <div className="hidden 2xl:block sticky top-0 h-screen overflow-y-auto custom-scrollbar p-0 space-y-8 bg-transparent">
                    {rightSidebar}
                </div>
            )}
        </div>
    );
};
