import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../src/components/ui/Header';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useCommunityPosts } from '../../src/hooks/useCommunity';

type Post = {
  _id: string;
  category: string;
  title: string;
  content: string;
  userId: { name: string; agencyName: string };
  createdAt: string;
};

const CATEGORIES = ['전체', '자유', '매물정보', '질문', '공지'] as const;

export default function CommunityScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const { data: posts = [], isLoading, refetch, isRefetching } = useCommunityPosts(selectedCategory);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}일 전`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => router.push(`/community/${item._id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.postHeader}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>{item.category}</Text>
        </View>
        <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>
      <View style={styles.postFooter}>
        <Text style={styles.postAuthor}>
          {item.userId?.name || '알 수 없음'} · {item.userId?.agencyName || ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="커뮤니티"
        rightElement={
          <TouchableOpacity onPress={() => router.push('/community/write' as any)}>
            <Text style={styles.writeBtn}>글쓰기</Text>
          </TouchableOpacity>
        }
      />

      {/* 카테고리 필터 */}
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              selectedCategory === cat && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>게시글이 없습니다</Text>
              <Text style={styles.emptyDesc}>첫 번째 글을 작성해보세요</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  writeBtn: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray100,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  categoryChipTextActive: { color: COLORS.white },
  listContent: {
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryTag: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  postDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
  },
  postTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  postContent: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAuthor: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
  },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.gray800 },
  emptyDesc: { fontSize: FONT_SIZE.sm, color: COLORS.gray400, marginTop: 4 },
});
