import { useEffect, useCallback } from 'react';
import { useMapStore } from '@/stores/map.store';
import { KakaoMap } from '@/pages/map/components/KakaoMap';

export function InteractiveMap() {
  const { properties, fetchByBounds, setSelectedProperty } = useMapStore();

  const handleBoundsChanged = useCallback(
    (bounds: { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } }) => {
      fetchByBounds(bounds);
    },
    [fetchByBounds],
  );

  // 초기 서울 전체 영역 로드
  useEffect(() => {
    fetchByBounds({
      sw: { lat: 37.42, lng: 126.8 },
      ne: { lat: 37.7, lng: 127.2 },
    });
  }, [fetchByBounds]);

  return (
    <div className="lg:col-span-8 h-[600px] rounded-3xl overflow-hidden relative border border-outline-variant/10">
      <KakaoMap
        properties={properties}
        onBoundsChanged={handleBoundsChanged}
        onMarkerClick={(p) => setSelectedProperty(p)}
      />
    </div>
  );
}
