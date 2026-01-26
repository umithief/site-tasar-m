import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { SocialPost } from '../types';

// Fetch Feed Function
const fetchFeed = async ({ pageParam = 1, queryKey }: any) => {
    const [_key, feedType] = queryKey; // Extract feed type from key
    const type = feedType || 'feed';

    // Backend should support pagination, e.g., ?page=1
    const { data } = await api.get(`/social/${type}?page=${pageParam}&limit=10`);
    // Unwrap the actual posts array from the API response envelope: { status: 'success', data: { posts: [...] } }
    const rawPosts = data.data.feed || data.data.posts; // Support both structures

    return rawPosts.map((post: any) => ({
        ...post,
        userId: post.user?._id || post.user,
        userName: post.user?.name || post.userName || 'Anonim',
        userAvatar: post.user?.avatar || post.userAvatar || '',
        userRank: post.user?.rank || post.userRank,
        commentList: post.comments || [],
        comments: post.commentCount || 0,
        likes: post.likeCount || 0,
        rideStats: post.rideStats || {
            maxSpeed: Math.floor(Math.random() * (299 - 120) + 120),
            avgSpeed: Math.floor(Math.random() * (100 - 60) + 60),
            leanAngle: Math.floor(Math.random() * (45 - 20) + 20),
            distance: parseFloat((Math.random() * 150).toFixed(1)),
            duration: `${Math.floor(Math.random() * 4)}h ${Math.floor(Math.random() * 60)}m`
        }
    }));
};

export const usePosts = (feedType: 'feed' | 'discover' = 'feed') => {
    const token = localStorage.getItem('token');
    return useInfiniteQuery({
        queryKey: ['posts', feedType],
        queryFn: fetchFeed,
        enabled: !!token,
        getNextPageParam: (lastPage, allPages) => {
            // Mocking logic: stop after 5 pages or if empty
            if (!lastPage || lastPage.length === 0) return undefined;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        staleTime: 60000, // 1 minute cache
        refetchOnWindowFocus: false, // Don't refetch when switching tabs
    });
};

export const useLikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, userId }: { postId: string, userId: string }) => {
            return api.post(`/social/${postId}/like`, { userId }); // Using api.ts
        },
        onMutate: async ({ postId, userId }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['posts'] });

            // Snapshot previous value
            const previousPosts = queryClient.getQueryData(['posts']);

            // System Audit Tracer
            console.log(`👍 [React Query] Optimistic Like: Post ${postId} (User: ${userId})`);

            // Optimistic Update
            queryClient.setQueryData(['posts'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: SocialPost[]) =>
                        page.map(post => {
                            if (post._id === postId) {
                                const isLiked = post.isLiked;
                                return {
                                    ...post,
                                    likes: isLiked ? post.likes - 1 : post.likes + 1,
                                    isLiked: !isLiked
                                };
                            }
                            return post;
                        })
                    )
                };
            });

            return { previousPosts };
        },
        onError: (err, newTodo, context) => {
            console.error('❌ [React Query] Like Mutation Failed:', err);
            queryClient.setQueryData(['posts'], context?.previousPosts);
        },
        onSettled: () => {
            console.log('✅ [React Query] Like Mutation Settled (Refetching...)');
            // queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};

export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newPostData: any) => {
            const { data } = await api.post('/social', newPostData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
};
