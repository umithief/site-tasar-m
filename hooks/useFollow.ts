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
            if (user) {
                const currentFollowing = (user.following as any) || [];
                let newFollowing: any[];

                if (isCurrentlyFollowing) {
                    // Remove
                    newFollowing = Array.isArray(currentFollowing)
                        ? currentFollowing.filter((f: any) => {
                            const fId = typeof f === 'object' ? f._id : f;
                            return fId !== targetUserId;
                        })
                        : [];
                } else {
                    // Add (optimistically push ID)
                    newFollowing = Array.isArray(currentFollowing) ? [...currentFollowing, targetUserId] : [targetUserId];
                }

                // We update the local user object in store to reflect change immediately
                // updateProfile is available from useAuthStore? 
                // Creating a simplified update since updateProfile usually calls API. 
                // Here we just want to update the CLIENT state.
                // useAuthStore might need a set method or we just wait for invalidation.
                // For now, relying on invalidation 'me' in onSuccess is safer than hacking the store state directly without a proper reducer.
                // So I will comment out the manual store update to avoid complex type hacks and rely on 'me' refetching.
            }

            return { previousProfile };
        },
        onError: (err, newTodo, context) => {
            console.error('useFollow: Mutation Error', err);
            // Rollback
            queryClient.setQueryData(['profile', newTodo.targetUserId], context?.previousProfile);
            notify.error('Takip işlemi başarısız oldu.');
        },
        onSuccess: (data, variables) => {
            // Invalidate to refetch fresh data
            queryClient.invalidateQueries({ queryKey: ['profile', variables.targetUserId] });
            queryClient.invalidateQueries({ queryKey: ['me'] }); // Refetch own profile to update 'following' array

            // Also update React Query cache for Riders list if needed
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
