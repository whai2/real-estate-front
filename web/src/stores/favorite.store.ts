import { create } from 'zustand';
import { apiRequest } from '@/lib/api-client';

type FavoriteState = {
  favoriteIds: Set<string>;
  isLoading: boolean;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (propertyId: string) => Promise<boolean>;
  isFavorite: (propertyId: string) => boolean;
};

export const useFavoriteStore = create<FavoriteState>()((set, get) => ({
  favoriteIds: new Set<string>(),
  isLoading: false,

  fetchFavorites: async () => {
    set({ isLoading: true });
    try {
      const res = await apiRequest<{
        data: { properties: { _id: string }[]; total: number };
      }>('/favorites?limit=1000');
      const ids = new Set(res.data.properties.map((p) => p._id));
      set({ favoriteIds: ids, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (propertyId: string) => {
    try {
      const res = await apiRequest<{ data: { isFavorite: boolean } }>(
        '/favorites/toggle',
        { method: 'POST', body: { propertyId } },
      );
      const next = new Set(get().favoriteIds);
      if (res.data.isFavorite) {
        next.add(propertyId);
      } else {
        next.delete(propertyId);
      }
      set({ favoriteIds: next });
      return res.data.isFavorite;
    } catch {
      return get().favoriteIds.has(propertyId);
    }
  },

  isFavorite: (propertyId: string) => get().favoriteIds.has(propertyId),
}));
