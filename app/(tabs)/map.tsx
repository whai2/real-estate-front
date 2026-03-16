import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { KakaoMapWithRef, MapProperty } from '../../src/components/map/KakaoMap';
import PropertyBottomSheet from '../../src/components/map/PropertyBottomSheet';
import { apiRequest } from '../../src/services/api';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';

// 모듈 레벨 캐시: 한 번 가져온 위치는 탭 전환 시 다시 요청하지 않음
let cachedLocation: { lat: number; lng: number } | null = null;
let locationRequested = false;

type DealFilter = 'all' | 'sale' | 'jeonse' | 'monthly';
type SortOption = 'newest' | 'price_asc' | 'price_desc';

const DEAL_FILTERS: { key: DealFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'sale', label: '매매' },
  { key: 'jeonse', label: '전세' },
  { key: 'monthly', label: '월세' },
];

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'newest', label: '최신순' },
  { key: 'price_asc', label: '가격 낮은순' },
  { key: 'price_desc', label: '가격 높은순' },
];

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<{ setMarkers: (p: MapProperty[]) => void; moveTo: (lat: number, lng: number, level?: number) => void; searchPlace: (keyword: string) => void }>(null);
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(cachedLocation);

  // 필터 상태
  const [keyword, setKeyword] = useState('');
  const [dealFilter, setDealFilter] = useState<DealFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showSort, setShowSort] = useState(false);

  // 마지막 bounds 저장
  const lastCenter = useRef<{ lat: number; lng: number } | null>(null);

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

  // 매물 로드 함수
  const loadProperties = useCallback(
    async (center?: { lat: number; lng: number }, kw?: string) => {
      const c = center || lastCenter.current;
      if (!c) return;

      const params = new URLSearchParams();
      params.set('lat', String(c.lat));
      params.set('lng', String(c.lng));
      params.set('radius', '3');
      params.set('sort', sortOption);
      if (dealFilter !== 'all') params.set('dealType', dealFilter);
      const searchKeyword = kw ?? keyword;
      if (searchKeyword.trim()) params.set('keyword', searchKeyword.trim());

      try {
        const result = await apiRequest(`/properties?${params.toString()}`);
        if (result.data?.properties) {
          mapRef.current?.setMarkers(result.data.properties);
        }
      } catch {
        // API 미연결 시 무시
      }
    },
    [dealFilter, sortOption, keyword]
  );

  // 필터 변경 시 다시 로드
  useEffect(() => {
    if (lastCenter.current) {
      loadProperties();
    }
  }, [dealFilter, sortOption]);

  // 지도 영역 변경 시 매물 로드
  const handleBoundsChange = useCallback(
    (event: any) => {
      const { center } = event.data;
      lastCenter.current = center;
      loadProperties(center);
    },
    [loadProperties]
  );

  // 매물 키워드 검색 + 카카오 장소 검색 동시 실행
  const handleSearch = useCallback(() => {
    const kw = keyword.trim();
    if (!kw) return;
    // 1. 카카오 장소 검색 (지도 이동)
    mapRef.current?.searchPlace(kw);
    // 2. DB 매물 검색 (필터링)
    loadProperties(undefined, kw);
  }, [keyword, loadProperties]);

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
      {/* 검색바 */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="매물 검색 (제목, 주소)"
          placeholderTextColor={COLORS.gray400}
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>검색</Text>
        </TouchableOpacity>
      </View>

      {/* 필터 바 */}
      <View style={styles.filterBar}>
        <View style={styles.dealFilters}>
          {DEAL_FILTERS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, dealFilter === key && styles.filterChipActive]}
              onPress={() => setDealFilter(key)}
            >
              <Text style={[styles.filterChipText, dealFilter === key && styles.filterChipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setShowSort(!showSort)}
        >
          <Text style={styles.sortBtnText}>
            {SORT_OPTIONS.find((o) => o.key === sortOption)?.label}
          </Text>
          <Text style={styles.sortArrow}>{showSort ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      </View>

      {/* 정렬 드롭다운 */}
      {showSort && (
        <View style={styles.sortDropdown}>
          {SORT_OPTIONS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.sortItem, sortOption === key && styles.sortItemActive]}
              onPress={() => {
                setSortOption(key);
                setShowSort(false);
              }}
            >
              <Text style={[styles.sortItemText, sortOption === key && styles.sortItemTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 지도 */}
      <View style={styles.mapContainer}>
        <KakaoMapWithRef
          ref={mapRef}
          initialLat={myLocation?.lat || 37.5665}
          initialLng={myLocation?.lng || 126.978}
          onBoundsChange={handleBoundsChange}
          onMarkerClick={handleMarkerClick}
          onRequestLocation={handleRequestLocation}
        />
      </View>

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
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'web' ? SPACING.md : 56,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray900,
    backgroundColor: COLORS.gray50,
  },
  searchBtn: {
    height: 40,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    justifyContent: 'space-between',
  },
  dealFilters: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    gap: 4,
  },
  sortBtnText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  sortArrow: {
    fontSize: 8,
    color: COLORS.gray500,
  },
  sortDropdown: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 90 : 146,
    right: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    zIndex: 100,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
      default: { elevation: 4 },
    }),
  },
  sortItem: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sortItemActive: {
    backgroundColor: COLORS.gray50,
  },
  sortItemText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray700,
  },
  sortItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    zIndex: 1,
  },
});
