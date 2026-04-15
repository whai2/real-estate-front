import { useCallback } from 'react';
import { useMapStore } from '@/stores/map.store';
import { KakaoMap } from './components/KakaoMap';
import { PropertyListPanel } from './components/PropertyListPanel';
import { MapControls } from './components/MapControls';
import { MapLegend } from './components/MapLegend';
import { MobileMapSearch } from './components/MobileMapSearch';
import { MobileMapControls } from './components/MobileMapControls';
import { MobilePropertySlider } from './components/MobilePropertySlider';
import type { Property } from '@/types/property';

export default function MapPage() {
  const { properties, total, fetchByBounds, setSelectedProperty, drawingMode, showTransactionLayer } =
    useMapStore();

  const handleBoundsChanged = useCallback(
    (bounds: { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } }) => {
      fetchByBounds(bounds);
    },
    [fetchByBounds],
  );

  const handleMarkerClick = useCallback(
    (p: Property) => {
      setSelectedProperty(p);
    },
    [setSelectedProperty],
  );

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* ── Desktop Layout (lg 이상) ── */}
      <div className="hidden lg:flex h-full w-full">
        <PropertyListPanel
          properties={properties}
          total={total}
          onPropertyClick={handleMarkerClick}
        />
        <div className="flex-1 relative h-full">
          <KakaoMap
            properties={properties}
            onBoundsChanged={handleBoundsChanged}
            onMarkerClick={handleMarkerClick}
            drawingMode={drawingMode}
            showTransactionLayer={showTransactionLayer}
          />
          <MapControls />
          <MapLegend />
        </div>
      </div>

      {/* ── Mobile Layout (lg 미만) ── */}
      <div className="lg:hidden h-full w-full relative">
        {/* Full-screen Map — z-10 so it sits above any stacking issues */}
        <div className="absolute inset-0 z-10">
          <KakaoMap
            properties={properties}
            onBoundsChanged={handleBoundsChanged}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Floating Search + Filter Chips — only inner elements capture touch */}
        <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
          <MobileMapSearch
            locationLabel="강남구 반포동 일대"
            onSearch={(kw) => console.log('search:', kw)}
          />
        </div>

        {/* Zoom & Location Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
          <MobileMapControls />
        </div>

        {/* Bottom Property Slider — only cards capture touch */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          <MobilePropertySlider
            properties={properties}
            total={total}
            onPropertyClick={handleMarkerClick}
          />
        </div>
      </div>
    </div>
  );
}
