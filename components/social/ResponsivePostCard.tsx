import React, { memo } from 'react';
import { PostCard } from './PostCard';
import { MobilePostCard } from '../mobile/MobilePostCard';
import { SocialPost } from '../../types';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ResponsivePostCardProps {
    post: SocialPost;
    currentUserId?: string;
    onNavigate?: (view: any, data?: any) => void;
    onCommentClick?: () => void;
    className?: string;
    variant?: 'default' | 'glass';
    priority?: boolean;
}

export const ResponsivePostCard: React.FC<ResponsivePostCardProps> = memo((props) => {
    const isMobile = useIsMobile();

    return (
        <div className={`w-full ${props.className || ''}`}>
            {isMobile ? (
                <MobilePostCard
                    post={props.post}
                    currentUserId={props.currentUserId}
                    onNavigate={props.onNavigate}
                    onCommentClick={props.onCommentClick}
                    priority={props.priority}
                />
            ) : (
                <PostCard
                    post={props.post}
                    onComment={() => props.onCommentClick?.()}
                    onNavigate={props.onNavigate}
                    variant={props.variant}
                />
            )}
        </div>
    );
});
