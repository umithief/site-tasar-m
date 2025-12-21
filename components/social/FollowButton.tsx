import React from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { notify } from '../../services/notificationService';
import { useFollow } from '../../hooks/useFollow';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils'; // Assuming utility exists, or use template literal
import { Button } from '../ui/Button'; // Assuming UI component exists

interface FollowButtonProps {
    targetUserId: string;
    isFollowing?: boolean;
    className?: string;
    onToggle?: (newState: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ targetUserId, isFollowing = false, className, onToggle }) => {
    const { mutate: toggleFollow, isPending } = useFollow();
    const { user: currentUser } = useAuthStore();

    // Determine follow status from store.
    // This is the absolute source of truth to avoid sync issues.
    const amIFollowing = React.useMemo(() => {
        if (!currentUser || !currentUser.following) return false;

        const followingList = Array.isArray(currentUser.following)
            ? currentUser.following
            : [];

        return followingList.some(f => {
            const fId = (typeof f === 'object' && f !== null) ? (f._id || f.id) : f;
            if (!fId || !targetUserId) return false;
            return fId.toString() === targetUserId.toString();
        });
    }, [currentUser?.following, targetUserId]);

    // Use derived state: prop can override if needed for immediate animations,
    // but default to amIFollowing.
    const effectiveIsFollowing = isFollowing !== undefined ? isFollowing : amIFollowing;

    const handleFollow = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card clicks
        console.log('FollowButton clicked:', { targetUserId, currentUser: currentUser?._id, isFollowing: effectiveIsFollowing });

        if (!currentUser) {
            console.warn('FollowButton: No current user, ignoring click.');
            notify.error('Takip etmek için giriş yapmalısınız.');
            return;
        }

        // Optimistic toggle for local callback
        if (onToggle) onToggle(!effectiveIsFollowing);

        toggleFollow({ targetUserId, isCurrentlyFollowing: effectiveIsFollowing });
    };

    // Don't show button for self
    if (currentUser?._id === targetUserId) return null;

    return (
        <button
            onClick={handleFollow}
            disabled={isPending}
            className={`
                group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300
                ${effectiveIsFollowing
                    ? 'bg-transparent border border-white/20 text-white hover:border-red-500 hover:text-red-500'
                    : 'bg-white text-black hover:bg-moto-accent hover:scale-105 shadow-lg shadow-white/10'}
                ${isPending ? 'opacity-80 cursor-wait' : ''}
                ${className}
            `}
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : effectiveIsFollowing ? (
                <>
                    <UserCheck className="w-4 h-4" />
                    <span className="group-hover:hidden">TAKİP EDİLİYOR</span>
                    <span className="hidden group-hover:inline">TAKİBİ BIRAK</span>
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4" />
                    TAKİP ET
                </>
            )}
        </button>
    );
};
