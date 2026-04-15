import { create } from 'zustand';
import { apiRequest } from '@/lib/api-client';
import type { Property } from '@/types/property';

type Bounds = {
  sw: { lat: number; lng: number };
  ne: { lat: number; lng: number };
};

type MapState = {
  properties: Property[];
  total: number;
  isLoading: boolean;
  selectedProperty: Property | null;
  drawingMode: boolean;
  showTransactionLayer: boolean;
  fetchByBounds: (bounds: Bounds) => Promise<void>;
  setSelectedProperty: (p: Property | null) => void;
  toggleDrawingMode: () => void;
  toggleTransactionLayer: () => void;
};

export const useMapStore = create<MapState>()((set) => ({
  properties: [],
  total: 0,
  isLoading: false,
  selectedProperty: null,
  drawingMode: false,
  showTransactionLayer: false,

  fetchByBounds: async (bounds) => {
    set({ isLoading: true });
    try {
      const res = await apiRequest<{ data: Property[] }>(
        `/properties/geo-search?swLat=${bounds.sw.lat}&swLng=${bounds.sw.lng}&neLat=${bounds.ne.lat}&neLng=${bounds.ne.lng}&limit=100`,
      );
      set({ properties: res.data, total: res.data.length, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setSelectedProperty: (p) => set({ selectedProperty: p }),
  toggleDrawingMode: () => set((s) => ({ drawingMode: !s.drawingMode })),
  toggleTransactionLayer: () => set((s) => ({ showTransactionLayer: !s.showTransactionLayer })),
}));
