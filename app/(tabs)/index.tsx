import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZE, SPACING } from '../../src/constants/theme';
import { useAuthStore } from '../../src/stores/authStore';

const QUICK_MENUS = [
  { icon: '📍', label: '지도', route: '/(tabs)/map' },
  { icon: '🏠', label: '일반매물 등록', route: '/property/register' },
  { icon: '🏢', label: '오픈현장 등록', route: '/property/register' },
  { icon: '🔔', label: '알림 보내기', route: '/notification/send' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const subscription = user?.subscription;
  const daysLeft = subscription?.expiresAt
    ? Math.max(0, Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>부동산매물공유</Text>
        {!isAuthenticated && (
          <View style={styles.headerAuth}>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>로그인</Text>
            </TouchableOpacity>
            <Text style={styles.headerDivider}>|</Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.registerLink}>회원가입</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>
            {isAuthenticated ? `${user?.name || '회원'}님 환영합니다` : '종사자 전용 매물공유 플랫폼'}
          </Text>
          <Text style={styles.welcomeDesc}>
            실시간으로 매물을 등록하고 공유하세요
          </Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: '잔여일', value: isAuthenticated ? `${daysLeft}일` : '-' },
            { label: '포인트', value: isAuthenticated ? `${subscription?.points || 0}P` : '0P' },
            { label: '상단고정', value: `${subscription?.pinCount || 0}` },
            { label: 'PUSH', value: `${subscription?.pushCount || 0}` },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>빠른 메뉴</Text>
          <View style={styles.actionRow}>
            {QUICK_MENUS.map((menu) => (
              <TouchableOpacity
                key={menu.label}
                style={styles.actionCard}
                onPress={() => router.push(menu.route as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>{menu.icon}</Text>
                <Text style={styles.actionLabel}>{menu.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerAuth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loginLink: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  headerDivider: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray300,
  },
  registerLink: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  logo: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.xl,
  },
  welcomeCard: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 16,
    padding: SPACING['2xl'],
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  welcomeTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  welcomeDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING['2xl'],
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  quickActions: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    gap: SPACING.sm,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray800,
  },
});
