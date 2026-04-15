/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: any);
    setCenter(latlng: LatLng): void;
    getCenter(): LatLng;
    setLevel(level: number): void;
    getLevel(): number;
    getBounds(): LatLngBounds;
  }
  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }
  class LatLngBounds {
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
    extend(latlng: LatLng): void;
  }
  class Marker {
    constructor(options: any);
    setMap(map: Map | null): void;
  }
  class CustomOverlay {
    constructor(options: any);
    setMap(map: Map | null): void;
  }
  class MarkerClusterer {
    constructor(options: any);
    addMarkers(markers: Marker[]): void;
    clear(): void;
  }
  namespace event {
    function addListener(target: any, type: string, handler: () => void): void;
  }
  namespace services {
    class Places {
      keywordSearch(keyword: string, callback: (data: any[], status: string) => void): void;
    }
    const Status: { OK: string };
  }
  function load(callback: () => void): void;
}
