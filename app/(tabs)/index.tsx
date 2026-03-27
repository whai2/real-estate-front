import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { apiRequest } from '../../src/services/api';
import FilterTabs from '../../src/components/ui/FilterTabs';
import SearchBar from '../../src/components/ui/SearchBar';
import PropertyCard from '../../src/components/PropertyCard';
import ScoreBadge from '../../src/components/ui/ScoreBadge';

const QUICK_MENUS = [
  { icon: 'map-outline', label: '지도', route: '/(tabs)/map' },
  { icon: 'add-circle-outline', label: '일반매물', route: '/property/general-register' },
  { icon: 'business-outline', label: '오픈현장', route: '/property/open-site-register' },
  { icon: 'list-outline', label: '매물관리', route: '/property/manage' },
  { icon: 'notifications-outline', label: '알림', route: '/notification/send' },
  { icon: 'calendar-outline', label: '캘린더', route: '/open-schedule' },
] as const;

const REGION_FILTERS = [
  { key: 'all', label: '전체' },
  { key: '서울', label: '서울' },
  { key: '경기', label: '경기' },
  { key: '인천', label: '인천' },
];

const PERIOD_FILTERS = [
  { key: '1month', label: '최신월' },
  { key: '3month', label: '3개월' },
  { key: '6month', label: '6개월' },
  { key: '1year', label: '1년' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // 매물 데이터
  const [properties, setProperties] = useState<any[]>([]);
  const [summary, setSummary] = useState({ total: 0, danger: 0, caution: 0, safe: 0 });
  const [activeRisk, setActiveRisk] = useState('all');
  const [keyword, setKeyword] = useState('');

  // HOT 지역
  const [hotRegions, setHotRegions] = useState<any[]>([]);
  const [hotRegion, setHotRegion] = useState('all');
  const [hotPeriod, setHotPeriod] = useState('1month');

  const subscription = user?.subscription;
  const daysLeft = subscription?.expiresAt
    ? Math.max(0, Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const fetchData = useCallback(async () => {
    try {
      const [propsRes, summaryRes] = await Promise.all([
        apiRequest('/properties/my?limit=10'),
        apiRequest('/dashboard/summary'),
      ]);
      setProperties(propsRes.data?.properties || []);
      setSummary(summaryRes.data || { total: 0, danger: 0, caution: 0, safe: 0 });
    } catch {}
  }, []);

  const fetchHotRegions = useCallback(async () => {
    try {
      const res = await apiRequest(`/dashboard/hot-regions?region=${hotRegion}&period=${hotPeriod}`);
      setHotRegions(res.data?.regions || []);
    } catch {}
  }, [hotRegion, hotPeriod]);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  useEffect(() => {
    fetchHotRegions();
  }, [fetchHotRegions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    await fetchHotRegions();
    setRefreshing(false);
  };

  const riskTabs = [
    { key: 'all', label: '전체', count: summary.total },
    { key: 'danger', label: '위험', count: summary.danger },
    { key: 'caution', label: '주의', count: summary.caution },
    { key: 'safe', label: '안전', count: summary.safe },
  ];

  const filteredProperties = activeRisk === 'all'
    ? properties
    : properties.filter((p) => p.riskLevel === activeRisk);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.logo}>매물분석</Text>
        {!isAuthenticated ? (
          <View style={styles.headerAuth}>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>로그인</Text>
            </TouchableOpacity>
            <Text style={styles.divider}>|</Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.registerLink}>회원가입</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.userName}>{user?.name || '회원'}님</Text>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 구독 정보 */}
        {isAuthenticated && (
          <View style={styles.statsRow}>
            {[
              { label: '잔여일', value: `${daysLeft}일`, color: COLORS.primary },
              { label: '포인트', value: `${(subscription?.points || 0).toLocaleString()}P`, color: COLORS.primary },
              { label: '상단고정', value: `${subscription?.pinCount || 0}`, color: COLORS.warning },
              { label: 'PUSH', value: `${subscription?.pushCount || 0}`, color: COLORS.safe },
            ].map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 빠른 메뉴 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
          {QUICK_MENUS.map((m) => (
            <TouchableOpacity
              key={m.label}
              style={styles.quickCard}
              onPress={() => router.push(m.route as any)}
            >
              <Ionicons name={m.icon as any} size={24} color={COLORS.primary} />
              <Text style={styles.quickLabel}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 위험도 필터 + 검색 */}
        {isAuthenticated && (
          <>
            <Text style={styles.sectionTitle}>내 매물 분석</Text>
            <FilterTabs tabs={riskTabs} activeKey={activeRisk} onTabPress={setActiveRisk} />
            <View style={{ marginVertical: SPACING.sm }}>
              <SearchBar
                placeholder="매물, 주소, 내용으로 검색"
                onSearch={(text) => setKeyword(text)}
              />
            </View>

            {/* 매물 카드 리스트 */}
            {filteredProperties.length > 0 ? (
              filteredProperties.slice(0, 5).map((p) => (
                <View key={p._id} style={{ marginBottom: SPACING.sm }}>
                  <PropertyCard
                    id={p._id}
                    title={p.title}
                    address={p.address}
                    propertyType={p.propertyType}
                    trades={p.trades}
                    rooms={p.rooms}
                    bathrooms={p.bathrooms}
                    score={p.score}
                    riskLevel={p.riskLevel}
                    thumbnail={p.photos?.[0]?.url}
                    onPress={() => router.push(`/property/${p._id}`)}
                    compact
                  />
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="home-outline" size={32} color={COLORS.gray300} />
                <Text style={styles.emptyText}>등록된 매물이 없습니다</Text>
              </View>
            )}

            {properties.length > 5 && (
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => router.push('/property/manage')}
              >
                <Text style={styles.viewAllText}>전체 매물 보기 ({summary.total}건)</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* HOT 거래 지역 */}
        <View style={styles.hotSection}>
          <View style={styles.hotHeader}>
            <Text style={styles.sectionTitle}>거래 HOT 지역</Text>
          </View>

          <FilterTabs
            tabs={REGION_FILTERS}
            activeKey={hotRegion}
            onTabPress={setHotRegion}
            scrollable
          />

          <FilterTabs
            tabs={PERIOD_FILTERS}
            activeKey={hotPeriod}
            onTabPress={setHotPeriod}
            scrollable
          />

          {hotRegions.map((r, i) => (
            <View key={i} style={styles.hotItem}>
              <View style={styles.hotRank}>
                <Text style={styles.hotRankText}>{r.rank}</Text>
              </View>
              <View style={styles.hotInfo}>
                <Text style={styles.hotRegion}>{r.region}</Text>
                <Text style={styles.hotTrades}>전체거래 {r.totalTrades.toLocaleString()}건</Text>
              </View>
              <View style={styles.hotTrend}>
                <Ionicons
                  name={r.trend === 'up' ? 'arrow-up' : r.trend === 'down' ? 'arrow-down' : 'remove'}
                  size={14}
                  color={r.trend === 'up' ? COLORS.danger : r.trend === 'down' ? COLORS.primary : COLORS.gray400}
                />
                <Text style={[
                  styles.hotChange,
                  { color: r.trend === 'up' ? COLORS.danger : r.trend === 'down' ? COLORS.primary : COLORS.gray400 },
                ]}>
                  {r.rankChange}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logo: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.primary },
  headerAuth: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  loginLink: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.primary },
  divider: { fontSize: FONT_SIZE.sm, color: COLORS.gray300 },
  registerLink: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.gray600 },
  userName: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.gray700 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.gray500, marginBottom: 2 },
  statValue: { fontSize: FONT_SIZE.base, fontWeight: '700' },
  quickRow: { marginBottom: SPACING.xl },
  quickCard: {
    alignItems: 'center',
    gap: 6,
    marginRight: SPACING.lg,
    paddingVertical: SPACING.sm,
    width: 64,
  },
  quickLabel: { fontSize: FONT_SIZE.xs, color: COLORS.gray600, fontWeight: '500', textAlign: 'center' },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
    gap: SPACING.sm,
  },
  emptyText: { fontSize: FONT_SIZE.sm, color: COLORS.gray400 },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: 4,
  },
  viewAllText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '600' },
  hotSection: { marginTop: SPACING.xl },
  hotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  hotRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotRankText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.primary },
  hotInfo: { flex: 1 },
  hotRegion: { fontSize: FONT_SIZE.base, fontWeight: '600', color: COLORS.textPrimary },
  hotTrades: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  hotTrend: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  hotChange: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
});
