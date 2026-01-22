import React from 'react';

interface LoadingSkeletonProps {
    className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className = "bg-gray-50 dark:bg-[#050505]" }) => {
    return (
        <div className={`w-full min-h-screen p-4 space-y-6 animate-pulse ${className}`}>
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-8 pt-4">
                <div className="h-8 w-32 bg-gray-200/50 dark:bg-white/10 rounded-lg"></div>
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-200/50 dark:bg-white/10 rounded-full"></div>
                    <div className="h-8 w-8 bg-gray-200/50 dark:bg-white/10 rounded-full"></div>
                </div>
            </div>

            {/* Hero / Big Card */}
            <div className="w-full aspect-[16/9] bg-gray-200/50 dark:bg-white/10 rounded-3xl mb-6"></div>

            {/* Grid Items */}
            <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-3">
                        {/* Image */}
                        <div className="aspect-square bg-gray-200/50 dark:bg-white/10 rounded-2xl"></div>
                        {/* Text Lines */}
                        <div className="space-y-2">
                            <div className="h-4 w-3/4 bg-gray-200/50 dark:bg-white/10 rounded"></div>
                            <div className="h-3 w-1/2 bg-gray-200/50 dark:bg-white/10 rounded opacity-60"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* List Items */}
            <div className="space-y-4 pt-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-200/50 dark:bg-white/10 rounded-xl flex-shrink-0"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-4 w-full bg-gray-200/50 dark:bg-white/10 rounded"></div>
                            <div className="h-3 w-2/3 bg-gray-200/50 dark:bg-white/10 rounded opacity-60"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
