import React from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
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

    // Determine follow status from store if not explicitly passed (or fallback)
    const amIFollowing = React.useMemo(() => {
        if (isFollowing !== undefined) return isFollowing; // Prop priority? Or Store priority?
        // Usually Store is truth.
        if (!currentUser || !currentUser.following) return false;

        // Handle following as number (count) vs array (ids) type mismatch
        if (typeof currentUser.following === 'number') return false; // Can't know from count

        const followingList = currentUser.following as any[];
        return followingList.some(f => {
            const fId = typeof f === 'object' ? f._id : f;
            return fId === targetUserId;
        });
    }, [currentUser, targetUserId, isFollowing]);

    // Use derived state for UI
    const isActive = isFollowing || amIFollowing;

    // Actually, simply:
    // If we passed `isFollowing` prop, use it (optimistic parent).
    // If we didn't, check store.
    // Given usage in PublicProfile where we might not pass it, we should check store.
    // BUT `useFollow` optimistically updates the cache which might update parent prop.
    // Let's rely on the prop if passed, otherwise store.   
    const effectiveIsFollowing = isFollowing ?? amIFollowing;

    const handleFollow = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card clicks
        if (!currentUser) {
            // Redirect to login or open auth modal (handled by parent or global interceptor usually)
            // For now just alert or ignore
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
