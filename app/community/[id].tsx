import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import Header from '../../src/components/ui/Header';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useCommunityDetail, useCreateComment } from '../../src/hooks/useCommunity';

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useCommunityDetail(id!);
  const [commentText, setCommentText] = useState('');
  const createComment = useCreateComment(id!);

  const post = data?.post;
  const comments = data?.comments || [];

  const handleComment = () => {
    if (!commentText.trim()) return;

    createComment.mutate(commentText.trim(), {
      onSuccess: () => setCommentText(''),
      onError: (err: any) => Alert.alert('오류', err.message),
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}.${m}.${d} ${h}:${min}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="게시글" showBack />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="게시글" showBack />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>게시글을 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="게시글" showBack />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* 게시글 */}
          <View style={styles.postSection}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{post.category}</Text>
            </View>
            <Text style={styles.title}>{post.title}</Text>
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.userId?.name?.charAt(0) || '?'}
                </Text>
              </View>
              <View>
                <Text style={styles.authorName}>{post.userId?.name || '알 수 없음'}</Text>
                <Text style={styles.authorAgency}>{post.userId?.agencyName || ''}</Text>
              </View>
              <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
            </View>
            <Text style={styles.content}>{post.content}</Text>
          </View>

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 댓글 */}
          <View style={styles.commentSection}>
            <Text style={styles.commentTitle}>댓글 {comments.length}개</Text>
            {comments.map((comment: any) => (
              <View key={comment._id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAvatarSmall}>
                    <Text style={styles.commentAvatarText}>
                      {comment.userId?.name?.charAt(0) || '?'}
                    </Text>
                  </View>
                  <Text style={styles.commentAuthor}>
                    {comment.userId?.name || '알 수 없음'}
                  </Text>
                  <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 댓글 입력 */}
        <View style={styles.commentInput}>
          <TextInput
            style={styles.commentTextInput}
            placeholder="댓글을 입력하세요"
            placeholderTextColor={COLORS.gray400}
            value={commentText}
            onChangeText={setCommentText}
          />
          <TouchableOpacity
            style={[styles.commentSubmit, !commentText.trim() && styles.commentSubmitDisabled]}
            onPress={handleComment}
            disabled={createComment.isPending || !commentText.trim()}
          >
            <Text style={styles.commentSubmitText}>등록</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: FONT_SIZE.base, color: COLORS.gray400 },
  postSection: { padding: SPACING.xl },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: SPACING.md,
  },
  categoryTagText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.lg,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  authorName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  authorAgency: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
  },
  date: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
    marginLeft: 'auto',
  },
  content: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray700,
    lineHeight: 24,
  },
  divider: {
    height: 8,
    backgroundColor: COLORS.gray100,
  },
  commentSection: { padding: SPACING.xl },
  commentTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.lg,
  },
  commentItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  commentAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  commentAuthor: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  commentDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
    marginLeft: 'auto',
  },
  commentContent: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray700,
    lineHeight: 20,
    paddingLeft: 36,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    gap: SPACING.sm,
  },
  commentTextInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.lg,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray900,
  },
  commentSubmit: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  commentSubmitDisabled: {
    backgroundColor: COLORS.gray300,
  },
  commentSubmitText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
});
