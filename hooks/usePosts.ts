import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { SocialPost } from '../types';

// Fetch Feed Function
const fetchFeed = async ({ pageParam = 1 }) => {
    // Backend should support pagination, e.g., ?page=1
    const { data } = await api.get(`/social/feed?page=${pageParam}&limit=10`);
    // Unwrap the actual posts array from the API response envelope: { status: 'success', data: { posts: [...] } }
    const rawPosts = data.data.posts;
    return rawPosts.map((post: any) => ({
        ...post,
        commentList: post.comments || [],
        comments: post.commentCount || 0,
        likes: post.likeCount || 0
    }));
};

export const usePosts = () => {
    return useInfiniteQuery({
        queryKey: ['posts'],
        queryFn: fetchFeed,
        getNextPageParam: (lastPage, allPages) => {
            // Mocking logic: stop after 5 pages or if empty
            if (!lastPage || lastPage.length === 0) return undefined;
            return allPages.length + 1;
        },
        initialPageParam: 1,
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
            queryClient.invalidateQueries({ queryKey: ['posts'] });
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
