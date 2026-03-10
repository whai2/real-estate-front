import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../src/components/ui/Header';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useCreatePost } from '../../src/hooks/useCommunity';

const CATEGORIES = ['자유', '매물정보', '질문'] as const;

export default function CommunityWriteScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<string>('자유');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const createPost = useCreatePost();

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    createPost.mutate(
      { category, title: title.trim(), content: content.trim() },
      {
        onSuccess: () => {
          Alert.alert('완료', '게시글이 등록되었습니다.', [
            { text: '확인', onPress: () => router.back() },
          ]);
        },
        onError: (err: any) => {
          Alert.alert('오류', err.message);
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="글쓰기" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 카테고리 */}
        <Text style={styles.sectionTitle}>카테고리</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 제목 */}
        <Input
          label="제목"
          placeholder="제목을 입력하세요"
          value={title}
          onChangeText={setTitle}
        />

        {/* 내용 */}
        <Text style={styles.label}>내용</Text>
        <TextInput
          style={styles.textArea}
          placeholder="내용을 입력하세요"
          placeholderTextColor={COLORS.gray400}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />

        <Button
          title="게시글 등록"
          onPress={handleSubmit}
          loading={createPost.isPending}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.xl, paddingBottom: 40 },
  sectionTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  chipTextActive: { color: COLORS.white },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: FONT_SIZE.base,
    color: COLORS.gray900,
    minHeight: 200,
    marginBottom: SPACING.lg,
  },
  submitButton: { marginTop: SPACING.md },
});
