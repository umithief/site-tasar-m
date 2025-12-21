import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { notify } from '../services/notificationService';

export const useFollow = () => {
    const queryClient = useQueryClient();
    const { user, updateProfile } = useAuthStore();

    return useMutation({
        mutationFn: async ({ targetUserId, isCurrentlyFollowing }: { targetUserId: string, isCurrentlyFollowing: boolean }) => {
            console.log('useFollow: Mutating...', { targetUserId });
            const { data } = await api.post(`/users/follow/${targetUserId}`);
            console.log('useFollow: Success', data);
            return data;
        },
        onMutate: async ({ targetUserId, isCurrentlyFollowing }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['user', targetUserId] });
            await queryClient.cancelQueries({ queryKey: ['profile', targetUserId] });

            // Snapshot the previous value
            const previousProfile = queryClient.getQueryData(['profile', targetUserId]);

            // Optimistically update to the new value
            // 1. Update Profile Cache (if viewing that user)
            queryClient.setQueryData(['profile', targetUserId], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    isFollowing: !isCurrentlyFollowing,
                    followersCount: isCurrentlyFollowing ? (old.followersCount - 1) : (old.followersCount + 1)
                };
            });

            // 2. Update Local User Store (following list)
            const previousUser = user;
            if (user) {
                const currentFollowing = (user.following as any[]) || [];
                let newFollowing: any[];

                if (isCurrentlyFollowing) {
                    newFollowing = currentFollowing.filter((f: any) => {
                        const fId = (typeof f === 'object' && f !== null) ? (f._id || f.id) : f;
                        return fId?.toString() !== targetUserId.toString();
                    });
                } else {
                    newFollowing = [...currentFollowing, targetUserId];
                }

                // Update the store immediately for all FollowButtons to see
                updateProfile({ following: newFollowing });
            }

            return { previousProfile, previousUser };
        },
        onError: (err, variables, context) => {
            console.error('useFollow: Mutation Error', err);
            // Rollback
            if (context?.previousProfile) {
                queryClient.setQueryData(['profile', variables.targetUserId], context.previousProfile);
            }
            if (context?.previousUser) {
                updateProfile({ following: context.previousUser.following });
            }
            notify.error('Takip işlemi başarısız oldu.');
        },
        onSuccess: (data, variables) => {
            // Invalidate to refetch fresh data
            queryClient.invalidateQueries({ queryKey: ['profile', variables.targetUserId] });
            queryClient.invalidateQueries({ queryKey: ['userProfile', variables.targetUserId] });
            queryClient.invalidateQueries({ queryKey: ['me'] });

            // Also update React Query cache for Riders list if needed
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
