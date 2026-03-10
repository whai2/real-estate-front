import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../src/components/ui/Header';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useAuthStore } from '../../src/stores/authStore';

export default function MyPageScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="내정보" />
        <View style={styles.loginPrompt}>
          <Text style={styles.promptIcon}>👤</Text>
          <Text style={styles.promptText}>로그인이 필요합니다</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const subscription = user?.subscription;
  const daysLeft = subscription?.expiresAt
    ? Math.max(0, Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const MENU_SECTIONS = [
    {
      title: '매물 관리',
      items: [
        { label: '내 매물 목록', icon: '🏠', route: '/mypage/my-properties' },
        { label: '관심매물', icon: '❤️', route: '/(tabs)/favorites' },
      ],
    },
    {
      title: '알림',
      items: [
        { label: '알림 목록', icon: '🔔', route: '/mypage/notifications' },
        { label: '알림 보내기', icon: '📢', route: '/notification/send' },
      ],
    },
    {
      title: '계정',
      items: [
        { label: '프로필 수정', icon: '✏️', route: '/mypage/edit-profile' },
        { label: '포인트 내역', icon: '💰', route: '/mypage/point-history' },
        { label: '문의하기', icon: '❓', route: '/mypage/inquiry' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="내정보" />
      <ScrollView>
        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.name || '이름 미등록'}</Text>
              <Text style={styles.agency}>{user?.agencyName || '소속 미등록'}</Text>
              <Text style={styles.phone}>{user?.phone}</Text>
            </View>
          </View>

          {/* 구독 현황 */}
          <View style={styles.subscriptionCard}>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>
                {subscription?.plan === 'free' ? 'FREE' : subscription?.plan?.toUpperCase() || 'FREE'}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{daysLeft}일</Text>
                <Text style={styles.statLabel}>잔여일</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{subscription?.points || 0}P</Text>
                <Text style={styles.statLabel}>포인트</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{subscription?.pinCount || 0}</Text>
                <Text style={styles.statLabel}>상단고정</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{subscription?.pushCount || 0}</Text>
                <Text style={styles.statLabel}>PUSH</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 메뉴 섹션 */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuList}>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.menuItem}
                  onPress={() => router.push(item.route as any)}
                >
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* 로그아웃 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray50 },
  loginPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  promptIcon: { fontSize: 48, marginBottom: 16 },
  promptText: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.gray800, marginBottom: 20 },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
  },
  loginButtonText: { color: COLORS.white, fontSize: FONT_SIZE.base, fontWeight: '600' },
  profileCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  avatarText: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.primary },
  profileInfo: { flex: 1 },
  name: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.gray900 },
  agency: { fontSize: FONT_SIZE.sm, color: COLORS.gray500, marginTop: 2 },
  phone: { fontSize: FONT_SIZE.xs, color: COLORS.gray400, marginTop: 2 },
  subscriptionCard: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  planBadgeText: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.white },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.gray900 },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.gray500, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: COLORS.primarySoft },
  menuSection: { marginTop: SPACING.sm },
  sectionTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.gray400,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    textTransform: 'uppercase',
  },
  menuList: { backgroundColor: COLORS.white },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  menuIcon: { fontSize: 20, marginRight: SPACING.md },
  menuLabel: { flex: 1, fontSize: FONT_SIZE.base, color: COLORS.gray800 },
  menuArrow: { fontSize: 20, color: COLORS.gray300 },
  logoutButton: {
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  logoutText: { fontSize: FONT_SIZE.base, color: COLORS.gray500 },
});
