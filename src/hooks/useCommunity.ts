import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../services/api';

export const communityKeys = {
  all: ['community'] as const,
  lists: () => [...communityKeys.all, 'list'] as const,
  list: (category: string) => [...communityKeys.lists(), category] as const,
  detail: (id: string) => [...communityKeys.all, 'detail', id] as const,
};

export function useCommunityPosts(category: string) {
  return useQuery({
    queryKey: communityKeys.list(category),
    queryFn: async () => {
      const query = category === '전체' ? '' : `?category=${category}`;
      const result = await apiRequest(`/community${query}`);
      return result.data?.posts || [];
    },
  });
}

export function useCommunityDetail(id: string) {
  return useQuery({
    queryKey: communityKeys.detail(id),
    queryFn: async () => {
      const result = await apiRequest(`/community/${id}`);
      return result.data as { post: any; comments: any[] };
    },
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { category: string; title: string; content: string }) => {
      return apiRequest('/community', { method: 'POST', body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
    },
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(`/community/${postId}/comments`, {
        method: 'POST',
        body: { content },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(postId) });
    },
  });
}
