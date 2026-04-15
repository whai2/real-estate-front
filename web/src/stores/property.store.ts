import { create } from 'zustand';
import { apiRequest } from '@/lib/api-client';
import type { Property, StatusCount } from '@/types/property';

type PropertyState = {
  properties: Property[];
  total: number;
  page: number;
  statusCounts: StatusCount[];
  isLoading: boolean;
  error: string | null;
  statusFilter: string;
  keyword: string;

  fetchMyProperties: (params?: {
    page?: number;
    status?: string;
    keyword?: string;
  }) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  batchRefresh: () => Promise<void>;
  setStatusFilter: (status: string) => void;
  setKeyword: (keyword: string) => void;
};

export const usePropertyStore = create<PropertyState>()((set, get) => ({
  properties: [],
  total: 0,
  page: 1,
  statusCounts: [],
  isLoading: false,
  error: null,
  statusFilter: '',
  keyword: '',

  fetchMyProperties: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { statusFilter, keyword } = get();
      const status = params?.status ?? statusFilter;
      const kw = params?.keyword ?? keyword;
      const page = params?.page ?? 1;

      const query = new URLSearchParams();
      query.set('page', String(page));
      query.set('limit', '10');
      if (status) query.set('status', status);
      if (kw) query.set('keyword', kw);

      const res = await apiRequest<{
        data: {
          properties: Property[];
          total: number;
          page: number;
          statusCounts: StatusCount[];
        };
      }>(`/properties/my?${query}`);

      set({
        properties: res.data.properties,
        total: res.data.total,
        page: res.data.page,
        statusCounts: res.data.statusCounts,
        isLoading: false,
      });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  updateStatus: async (id, status) => {
    await apiRequest(`/properties/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
    get().fetchMyProperties();
  },

  deleteProperty: async (id) => {
    await apiRequest(`/properties/${id}`, { method: 'DELETE' });
    get().fetchMyProperties();
  },

  batchRefresh: async () => {
    await apiRequest('/properties/batch-refresh', { method: 'POST' });
    get().fetchMyProperties();
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().fetchMyProperties({ status });
  },

  setKeyword: (keyword) => {
    set({ keyword });
  },
}));
