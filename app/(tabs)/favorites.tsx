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

type FavoriteProperty = {
  _id: string;
  type: string;
  title: string;
  address: string;
  price: string;
  area?: number;
  floor?: string;
  rooms?: number;
  userId: { name: string; agencyName: string };
  createdAt: string;
};

export default function FavoritesScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      const result = await apiRequest('/favorites');
      setProperties(result.data?.properties || []);
    } catch {
      // API 미연결 시 무시
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      await apiRequest('/favorites/toggle', {
        method: 'POST',
        body: { propertyId },
      });
      setProperties((prev) => prev.filter((p) => p._id !== propertyId));
    } catch (err: any) {
      Alert.alert('오류', err.message);
    }
  };

  const renderProperty = ({ item }: { item: FavoriteProperty }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => router.push(`/property/${item._id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.cardLeft}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageIcon}>🏠</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.typeTag}>
          <Text style={styles.typeTagText}>
            {item.type === 'open' ? '오픈현장' : '일반매물'}
          </Text>
        </View>
        <Text style={styles.propertyTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.propertyPrice}>{item.price}</Text>
        <Text style={styles.propertyAddress} numberOfLines={1}>{item.address}</Text>
        <View style={styles.propertyInfo}>
          {item.area && <Text style={styles.infoText}>{item.area}평</Text>}
          {item.floor && <Text style={styles.infoText}>{item.floor}층</Text>}
          {item.rooms && <Text style={styles.infoText}>{item.rooms}방</Text>}
        </View>
      </View>
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={() => handleRemoveFavorite(item._id)}
      >
        <Text style={styles.heartIcon}>❤️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="관심매물" />
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
              <Text style={styles.emptyIcon}>❤️</Text>
              <Text style={styles.emptyText}>관심매물이 없습니다</Text>
              <Text style={styles.emptyDesc}>마음에 드는 매물을 찜해보세요</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  listContent: {
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  cardLeft: {},
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIcon: { fontSize: 28 },
  cardContent: { flex: 1 },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  typeTagText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  propertyTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 2,
  },
  propertyPrice: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  propertyAddress: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  propertyInfo: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
  },
  heartBtn: {
    padding: SPACING.xs,
    alignSelf: 'flex-start',
  },
  heartIcon: { fontSize: 20 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.gray800 },
  emptyDesc: { fontSize: FONT_SIZE.sm, color: COLORS.gray400, marginTop: 4 },
});
