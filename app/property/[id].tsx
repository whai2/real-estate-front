import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '../../src/components/ui/Header';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { apiRequest } from '../../src/services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;

type UnitDetail = {
  floor: string;
  unitNumber: string;
  area?: number;
  rooms?: number;
  price?: string;
  deposit?: string;
  monthlyRent?: string;
};

type PropertyDetail = {
  _id: string;
  type: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  price: string;
  deposit?: string;
  monthlyRent?: string;
  area?: number;
  floor?: string;
  rooms?: number;
  units?: UnitDetail[];
  description?: string;
  images: { url: string; order: number }[];
  userId: { name: string; agencyName: string; phone: string };
  createdAt: string;
};

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [propertyResult, favoriteResult] = await Promise.all([
          apiRequest(`/properties/${id}`),
          apiRequest(`/favorites/check/${id}`).catch(() => ({ data: { isFavorite: false } })),
        ]);
        setProperty(propertyResult.data);
        setIsFavorite(favoriteResult.data?.isFavorite || false);
      } catch (err: any) {
        Alert.alert('오류', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      const result = await apiRequest('/favorites/toggle', {
        method: 'POST',
        body: { propertyId: id },
      });
      setIsFavorite(result.data?.isFavorite);
    } catch (err: any) {
      Alert.alert('오류', err.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="매물 상세" showBack />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="매물 상세" showBack />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>매물을 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="매물 상세" showBack />
      <ScrollView style={styles.scroll}>
        {/* 이미지 */}
        {property.images.length > 0 ? (
          <View style={styles.imageContainer}>
            <FlatList
              data={[...property.images].sort((a, b) => a.order - b.order)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, idx) => `${item.url}-${idx}`}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setCurrentImageIndex(index);
              }}
              renderItem={({ item }) => (
                <Image source={{ uri: item.url }} style={styles.propertyImage} resizeMode="contain" />
              )}
            />
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1} / {property.images.length}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageIcon}>🏠</Text>
            <Text style={styles.imageText}>사진 없음</Text>
          </View>
        )}

        <View style={styles.content}>
          {/* 타입 태그 */}
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>
              {property.type === 'open' ? '오픈현장' : '일반매물'}
            </Text>
          </View>

          {/* 제목/가격 */}
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.price}>{property.price}</Text>
          <Text style={styles.address}>{property.address}</Text>

          {/* 상세 정보 */}
          {property.units && property.units.length > 0 ? (
            <View>
              <Text style={styles.sectionTitle}>호실별 정보</Text>
              {property.units.map((unit, idx) => (
                <View key={idx} style={styles.unitInfoCard}>
                  <Text style={styles.unitInfoTitle}>{unit.floor}층 {unit.unitNumber}호</Text>
                  <View style={styles.infoGrid}>
                    {unit.area != null && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>면적</Text>
                        <Text style={styles.infoValue}>{unit.area}평</Text>
                      </View>
                    )}
                    {unit.rooms != null && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>방 수</Text>
                        <Text style={styles.infoValue}>{unit.rooms}개</Text>
                      </View>
                    )}
                    {(unit.price || unit.deposit || unit.monthlyRent) && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>가격</Text>
                        <Text style={styles.infoValue}>
                          {unit.price ? `${unit.price}만` : `${unit.deposit}/${unit.monthlyRent}`}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.infoGrid}>
              {property.area != null && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>면적</Text>
                  <Text style={styles.infoValue}>{property.area}평</Text>
                </View>
              )}
              {property.floor && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>층수</Text>
                  <Text style={styles.infoValue}>{property.floor}층</Text>
                </View>
              )}
              {property.rooms != null && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>방 수</Text>
                  <Text style={styles.infoValue}>{property.rooms}개</Text>
                </View>
              )}
            </View>
          )}

          {/* 설명 */}
          {property.description && (
            <>
              <Text style={styles.sectionTitle}>상세 설명</Text>
              <Text style={styles.description}>{property.description}</Text>
            </>
          )}

          {/* 등록자 */}
          <Text style={styles.sectionTitle}>등록자 정보</Text>
          <View style={styles.agentCard}>
            <View style={styles.agentAvatar}>
              <Text style={styles.agentAvatarText}>
                {property.userId.name?.charAt(0) || '?'}
              </Text>
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{property.userId.name}</Text>
              <Text style={styles.agentAgency}>{property.userId.agencyName}</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => {
                if (property.userId.phone) {
                  Linking.openURL(`tel:${property.userId.phone}`);
                } else {
                  Alert.alert('알림', '전화번호가 등록되지 않았습니다.');
                }
              }}
            >
              <Text style={styles.callButtonText}>📞 전화</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.favoriteBtn, isFavorite && styles.favoriteBtnActive]}
          onPress={toggleFavorite}
        >
          <Text style={styles.favoriteBtnText}>{isFavorite ? '❤️' : '♡'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => {
            router.push({
              pathname: '/mypage/inquiry',
              params: {
                propertyId: property._id,
                propertyTitle: property.title,
              },
            });
          }}
        >
          <Text style={styles.contactBtnText}>문의하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: FONT_SIZE.base, color: COLORS.gray400 },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 220,
    backgroundColor: COLORS.gray100,
  },
  propertyImage: {
    width: SCREEN_WIDTH,
    height: 220,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: { color: COLORS.white, fontSize: FONT_SIZE.xs, fontWeight: '600' },
  imagePlaceholder: {
    width: SCREEN_WIDTH,
    height: 240,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIcon: { fontSize: 48, marginBottom: 8 },
  imageText: { fontSize: FONT_SIZE.sm, color: COLORS.gray400 },
  content: { padding: SPACING.xl },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: SPACING.sm,
  },
  typeText: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.primary },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  price: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  address: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.xl,
  },
  unitInfoCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  unitInfoTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.xl,
  },
  infoItem: { alignItems: 'center' },
  infoLabel: { fontSize: FONT_SIZE.xs, color: COLORS.gray400, marginBottom: 4 },
  infoValue: { fontSize: FONT_SIZE.base, fontWeight: '600', color: COLORS.gray900 },
  sectionTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray700,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING['3xl'],
  },
  agentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  agentAvatarText: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.primary },
  agentInfo: { flex: 1 },
  agentName: { fontSize: FONT_SIZE.base, fontWeight: '600', color: COLORS.gray900 },
  agentAgency: { fontSize: FONT_SIZE.xs, color: COLORS.gray500, marginTop: 2 },
  callButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  callButtonText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.gray700 },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    gap: SPACING.sm,
  },
  favoriteBtn: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteBtnActive: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  favoriteBtnText: { fontSize: 24 },
  contactBtn: {
    flex: 1,
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactBtnText: { color: COLORS.white, fontSize: FONT_SIZE.base, fontWeight: '600' },
});
