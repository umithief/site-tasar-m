import React, { memo } from 'react';
import { PostCard } from './PostCard';
import { MobilePostCard } from '../mobile/MobilePostCard';
import { SocialPost } from '../../types';

interface ResponsivePostCardProps {
    post: SocialPost;
    currentUserId?: string;
    onNavigate?: (view: any, data?: any) => void;
}

export const ResponsivePostCard: React.FC<ResponsivePostCardProps> = memo((props) => {
    return (
        <div className="w-full">
            {/* Mobile View */}
            <div className="md:hidden">
                <MobilePostCard {...props} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <PostCard {...props} />
            </div>
        </div>
    );
});
