import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { KakaoMapWithRef, MapProperty } from '../../src/components/map/KakaoMap';
import PropertyBottomSheet from '../../src/components/map/PropertyBottomSheet';
import { apiRequest } from '../../src/services/api';
import { COLORS } from '../../src/constants/theme';

// 모듈 레벨 캐시: 한 번 가져온 위치는 탭 전환 시 다시 요청하지 않음
let cachedLocation: { lat: number; lng: number } | null = null;
let locationRequested = false;

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<{ setMarkers: (p: MapProperty[]) => void; moveTo: (lat: number, lng: number, level?: number) => void }>(null);
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(cachedLocation);

  // 현재 위치 가져오기 (최초 1회만)
  useEffect(() => {
    if (locationRequested) return;
    locationRequested = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const location = await Location.getCurrentPositionAsync({});
        cachedLocation = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };
        setMyLocation(cachedLocation);
      } catch {
        // 위치 가져오기 실패 시 무시
      }
    })();
  }, []);

  // 지도 영역 변경 시 매물 로드
  const handleBoundsChange = useCallback(
    async (event: any) => {
      const { center } = event.data;
      try {
        const result = await apiRequest(
          `/properties?lat=${center.lat}&lng=${center.lng}&radius=3`
        );
        if (result.data?.properties) {
          mapRef.current?.setMarkers(result.data.properties);
        }
      } catch {
        // API 미연결 시 무시
      }
    },
    []
  );

  // 마커 클릭
  const handleMarkerClick = useCallback((property: MapProperty) => {
    setSelectedProperty(property);
  }, []);

  // 내 위치로 이동 요청
  const handleRequestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('알림', '위치 권한이 필요합니다.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      mapRef.current?.moveTo(
        location.coords.latitude,
        location.coords.longitude,
        4
      );
    } catch {
      Alert.alert('오류', '위치를 가져올 수 없습니다.');
    }
  }, []);

  // 상세보기
  const handleDetail = useCallback((id: string) => {
    router.push(`/property/${id}` as any);
  }, [router]);

  return (
    <View style={styles.container}>
      <KakaoMapWithRef
        ref={mapRef}
        initialLat={myLocation?.lat || 37.5665}
        initialLng={myLocation?.lng || 126.978}
        onBoundsChange={handleBoundsChange}
        onMarkerClick={handleMarkerClick}
        onRequestLocation={handleRequestLocation}
      />
      <PropertyBottomSheet
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onDetail={handleDetail}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});
