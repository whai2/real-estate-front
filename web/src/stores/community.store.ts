import { create } from 'zustand';
import { apiRequest } from '@/lib/api-client';
import type { Post } from '@/types/community';

type CommunityState = {
  posts: Post[];
  total: number;
  page: number;
  category: string;
  mineOnly: boolean;
  isLoading: boolean;
  showWrite: boolean;
  fetchPosts: (params?: { page?: number; category?: string; mine?: boolean }) => Promise<void>;
  setCategory: (category: string) => void;
  toggleMineOnly: () => void;
  setShowWrite: (show: boolean) => void;
};

export const useCommunityStore = create<CommunityState>()((set, get) => ({
  posts: [],
  total: 0,
  page: 1,
  category: '',
  mineOnly: false,
  isLoading: false,
  showWrite: false,

  setShowWrite: (show) => set({ showWrite: show }),

  toggleMineOnly: () => {
    const next = !get().mineOnly;
    set({ mineOnly: next });
    get().fetchPosts({ mine: next });
  },

  fetchPosts: async (params) => {
    set({ isLoading: true });
    try {
      const cat = params?.category ?? get().category;
      const page = params?.page ?? 1;
      const mine = params?.mine ?? get().mineOnly;
      const query = new URLSearchParams();
      query.set('page', String(page));
      query.set('limit', '20');
      if (cat) query.set('category', cat);
      if (mine) query.set('mine', 'true');

      const res = await apiRequest<{
        data: { posts: Post[]; total: number; page: number };
      }>(`/community?${query}`);

      set({
        posts: res.data.posts,
        total: res.data.total,
        page: res.data.page,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setCategory: (category) => {
    set({ category });
    get().fetchPosts({ category });
  },
}));
