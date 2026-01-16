import React, { memo } from 'react';
import { PostCard } from './PostCard';
import { MobilePostCard } from '../mobile/MobilePostCard';
import { SocialPost } from '../../types';

interface ResponsivePostCardProps {
    post: SocialPost;
    currentUserId?: string;
    onNavigate?: (view: any, data?: any) => void;
    onCommentClick?: () => void;
    className?: string;
}

export const ResponsivePostCard: React.FC<ResponsivePostCardProps> = memo((props) => {
    return (
        <div className={`w-full ${props.className || ''}`}>
            <PostCard
                post={props.post}
                onComment={() => props.onCommentClick?.()}
                onNavigate={props.onNavigate}
            />
        </div>
    );
});
