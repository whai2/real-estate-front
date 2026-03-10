import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../src/components/ui/Header';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { apiRequest } from '../../src/services/api';

type MyProperty = {
  _id: string;
  type: string;
  title: string;
  address: string;
  price: string;
  status: string;
  createdAt: string;
};

export default function MyPropertiesScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<MyProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProperties = useCallback(async () => {
    try {
      const result = await apiRequest('/properties/my');
      setProperties(result.data?.properties || []);
    } catch {
      // API 미연결 시 무시
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const handleDelete = (id: string) => {
    Alert.alert('삭제', '이 매물을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest(`/properties/${id}`, { method: 'DELETE' });
            setProperties((prev) => prev.filter((p) => p._id !== id));
          } catch (err: any) {
            Alert.alert('오류', err.message);
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const renderProperty = ({ item }: { item: MyProperty }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/property/${item._id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.typeTag}>
          <Text style={styles.typeTagText}>
            {item.type === 'open' ? '오픈현장' : '일반매물'}
          </Text>
        </View>
        <View style={[styles.statusTag, item.status === 'active' ? styles.statusActive : styles.statusClosed]}>
          <Text style={[styles.statusText, item.status === 'active' ? styles.statusActiveText : styles.statusClosedText]}>
            {item.status === 'active' ? '공개중' : '마감'}
          </Text>
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.cardPrice}>{item.price}</Text>
      <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        <TouchableOpacity onPress={() => handleDelete(item._id)}>
          <Text style={styles.deleteText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="내 매물"
        showBack
        rightElement={
          <TouchableOpacity onPress={() => router.push('/property/register' as any)}>
            <Text style={styles.addBtn}>+ 등록</Text>
          </TouchableOpacity>
        }
      />
      <FlatList
        data={properties}
        keyExtractor={(item) => item._id}
        renderItem={renderProperty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏠</Text>
              <Text style={styles.emptyText}>등록한 매물이 없습니다</Text>
              <TouchableOpacity
                style={styles.registerBtn}
                onPress={() => router.push('/property/register' as any)}
              >
                <Text style={styles.registerBtnText}>매물 등록하기</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  addBtn: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.primary },
  listContent: { padding: SPACING.xl, gap: SPACING.md },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  typeTag: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeTagText: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.primary },
  statusTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusActive: { backgroundColor: '#DCFCE7' },
  statusClosed: { backgroundColor: COLORS.gray100 },
  statusText: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  statusActiveText: { color: '#16A34A' },
  statusClosedText: { color: COLORS.gray400 },
  cardTitle: { fontSize: FONT_SIZE.base, fontWeight: '600', color: COLORS.gray900, marginBottom: 2 },
  cardPrice: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.primary, marginBottom: 2 },
  cardAddress: { fontSize: FONT_SIZE.xs, color: COLORS.gray500, marginBottom: SPACING.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: FONT_SIZE.xs, color: COLORS.gray400 },
  deleteText: { fontSize: FONT_SIZE.xs, color: COLORS.error },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.gray800, marginBottom: 20 },
  registerBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
  },
  registerBtnText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '600' },
});
