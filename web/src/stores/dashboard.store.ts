import { create } from 'zustand';
import { apiRequest } from '@/lib/api-client';
import type { DashboardSummary, HotRegion, Transaction } from '@/types/dashboard';

type DashboardState = {
  summary: DashboardSummary | null;
  hotRegions: HotRegion[];
  recentTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
  fetchHotRegions: (region?: string, period?: string) => Promise<void>;
  fetchRecentTransactions: () => Promise<void>;
};

export const useDashboardStore = create<DashboardState>()((set) => ({
  summary: null,
  hotRegions: [],
  recentTransactions: [],
  isLoading: false,
  error: null,

  fetchSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiRequest<{ data: DashboardSummary }>('/dashboard/summary');
      set({ summary: res.data, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  fetchHotRegions: async (region = 'all', period = '1month') => {
    try {
      const res = await apiRequest<{ data: { regions: HotRegion[] } }>(
        `/dashboard/hot-regions?region=${region}&period=${period}`,
      );
      set({ hotRegions: res.data.regions });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  fetchRecentTransactions: async () => {
    try {
      const res = await apiRequest<{ data: { transactions: Transaction[] } }>(
        '/dashboard/recent-transactions?limit=5',
      );
      set({ recentTransactions: res.data.transactions });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
