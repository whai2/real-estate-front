import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../src/components/ui/Header';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { apiRequest } from '../../src/services/api';

type PointRecord = {
  _id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
};

export default function PointHistoryScreen() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<PointRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const result = await apiRequest('/auth/point-history');
      setRecords(result.data?.records || []);
    } catch {
      // API 미연결 시 무시
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const renderRecord = ({ item }: { item: PointRecord }) => (
    <View style={styles.record}>
      <View style={styles.recordLeft}>
        <Text style={styles.recordDesc}>{item.description}</Text>
        <Text style={styles.recordDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text style={[styles.recordAmount, item.amount > 0 ? styles.plus : styles.minus]}>
        {item.amount > 0 ? '+' : ''}{item.amount}P
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="포인트 내역" showBack />
      {/* 현재 포인트 */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>보유 포인트</Text>
        <Text style={styles.balanceValue}>{user?.subscription?.points || 0}P</Text>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        renderItem={renderRecord}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>포인트 내역이 없습니다</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  balanceCard: {
    backgroundColor: COLORS.primaryBg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primarySoft,
  },
  balanceLabel: { fontSize: FONT_SIZE.sm, color: COLORS.gray500, marginBottom: SPACING.xs },
  balanceValue: { fontSize: FONT_SIZE['2xl'], fontWeight: '800', color: COLORS.primary },
  listContent: { padding: SPACING.xl },
  record: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  recordLeft: { flex: 1 },
  recordDesc: { fontSize: FONT_SIZE.base, color: COLORS.gray800, marginBottom: 2 },
  recordDate: { fontSize: FONT_SIZE.xs, color: COLORS.gray400 },
  recordAmount: { fontSize: FONT_SIZE.base, fontWeight: '700' },
  plus: { color: COLORS.primary },
  minus: { color: COLORS.error },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: FONT_SIZE.base, color: COLORS.gray400 },
});
