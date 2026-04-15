import { useEffect, useRef, useCallback, useState } from 'react';
import type { Property } from '@/types/property';

type Bounds = {
  sw: { lat: number; lng: number };
  ne: { lat: number; lng: number };
};

type KakaoMapProps = {
  onBoundsChanged?: (bounds: Bounds) => void;
  onMarkerClick?: (property: Property) => void;
  properties: Property[];
  drawingMode?: boolean;
  showTransactionLayer?: boolean;
};

function waitForKakao(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof kakao !== 'undefined' && kakao.maps) {
      kakao.maps.load(() => resolve());
      return;
    }
    // SDK 스크립트가 아직 로드 안 된 경우 폴링
    const interval = setInterval(() => {
      if (typeof kakao !== 'undefined' && kakao.maps) {
        clearInterval(interval);
        kakao.maps.load(() => resolve());
      }
    }, 100);
  });
}

export function KakaoMap({ onBoundsChanged, onMarkerClick, properties, drawingMode, showTransactionLayer }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const clustererRef = useRef<kakao.maps.MarkerClusterer | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const [ready, setReady] = useState(false);

  // Initialize map after SDK loads
  useEffect(() => {
    let cancelled = false;

    waitForKakao().then(() => {
      if (cancelled || !containerRef.current) return;

      const map = new kakao.maps.Map(containerRef.current, {
        center: new kakao.maps.LatLng(37.5665, 126.978),
        level: 5,
      });
      mapRef.current = map;

      clustererRef.current = new kakao.maps.MarkerClusterer({
        map,
        averageCenter: true,
        minLevel: 6,
        styles: [
          {
            width: '48px',
            height: '48px',
            background: 'rgba(3, 22, 54, 0.9)',
            borderRadius: '24px',
            border: '4px solid rgba(255,255,255,0.2)',
            color: '#fff',
            textAlign: 'center',
            lineHeight: '40px',
            fontSize: '14px',
            fontWeight: '700',
          },
        ],
      });

      kakao.maps.event.addListener(map, 'zoom_changed', () => {
        const level = map.getLevel();
        overlaysRef.current.forEach((ov) => {
          ov.setMap(level < 6 ? map : null);
        });
      });

      kakao.maps.event.addListener(map, 'idle', () => {
        const bounds = map.getBounds();
        onBoundsChanged?.({
          sw: {
            lat: bounds.getSouthWest().getLat(),
            lng: bounds.getSouthWest().getLng(),
          },
          ne: {
            lat: bounds.getNorthEast().getLat(),
            lng: bounds.getNorthEast().getLng(),
          },
        });
      });

      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when properties change
  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    const clusterer = clustererRef.current;
    if (!map || !clusterer) return;

    clusterer.clear();
    overlaysRef.current.forEach((ov) => ov.setMap(null));
    overlaysRef.current = [];

    const markers: kakao.maps.Marker[] = [];
    const showOverlays = map.getLevel() < 6;

    properties.forEach((p) => {
      if (!p.trades?.[0]) return;
      const lat = (p as unknown as { lat: number }).lat;
      const lng = (p as unknown as { lng: number }).lng;
      if (!lat || !lng) return;

      const price = p.trades[0].price
        ? `₩ ${(p.trades[0].price / 100000000).toFixed(1)}억`
        : '-';

      const el = document.createElement('div');
      el.className =
        'flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-md border border-slate-200 cursor-pointer hover:border-[#055db6] transition-all';
      el.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#055db6;display:inline-block"></span><span style="font-size:12px;font-weight:700;color:#071b3b">${price}</span>`;
      el.onclick = () => onMarkerClick?.(p);

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(lat, lng),
        content: el,
        yAnchor: 1.3,
        zIndex: 10,
      });

      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(lat, lng),
        opacity: 0,
      });

      markers.push(marker);
      overlaysRef.current.push(overlay);
      overlay.setMap(showOverlays ? map : null);
    });

    clusterer.addMarkers(markers);
  }, [properties, onMarkerClick]);

  useEffect(() => {
    if (ready) updateMarkers();
  }, [ready, updateMarkers]);

  // Drawing mode: polygon click-to-draw
  const polygonRef = useRef<any>(null);
  const drawPointsRef = useRef<kakao.maps.LatLng[]>([]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    if (!drawingMode) {
      // Clean up drawing
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
      drawPointsRef.current = [];
      return;
    }

    function handleClick(e: any) {
      const latlng = e.latLng;
      drawPointsRef.current.push(latlng);

      if (polygonRef.current) {
        polygonRef.current.setMap(null);
      }

      polygonRef.current = new (kakao.maps as any).Polygon({
        path: drawPointsRef.current,
        strokeWeight: 3,
        strokeColor: '#055db6',
        strokeOpacity: 0.8,
        fillColor: '#055db6',
        fillOpacity: 0.15,
      });
      polygonRef.current.setMap(map!);
    }

    kakao.maps.event.addListener(map, 'click', handleClick as () => void);

    return () => {
      (kakao.maps.event as any).removeListener(map, 'click', handleClick as () => void);
    };
  }, [drawingMode, ready]);

  // Transaction layer indicator (visual feedback)
  useEffect(() => {
    // Transaction layer overlay would fetch and show real transaction data
    // For now, this serves as the toggle state handler
    // Actual transaction data rendering would be added when the API is available
  }, [showTransactionLayer]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {showTransactionLayer && (
        <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          실거래 레이어 활성
        </div>
      )}
    </div>
  );
}
