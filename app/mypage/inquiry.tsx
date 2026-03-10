import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '../../src/components/ui/Header';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { apiRequest } from '../../src/services/api';

export default function InquiryScreen() {
  const router = useRouter();
  const { propertyId, propertyTitle } = useLocalSearchParams<{
    propertyId?: string;
    propertyTitle?: string;
  }>();
  const [title, setTitle] = useState(
    propertyTitle ? `[매물문의] ${propertyTitle}` : ''
  );
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('알림', '제목과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/inquiries', {
        method: 'POST',
        body: {
          title: title.trim(),
          content: content.trim(),
          propertyId: propertyId || undefined,
        },
      });
      Alert.alert('완료', '문의가 접수되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('오류', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="문의하기" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>문의 안내</Text>
          <Text style={styles.infoDesc}>
            서비스 이용 중 궁금한 점이나 불편사항을 남겨주세요.{'\n'}
            영업일 기준 1~2일 내 답변드립니다.
          </Text>
        </View>

        <Input label="제목" placeholder="문의 제목을 입력하세요" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>내용</Text>
        <TextInput
          style={styles.textArea}
          placeholder="문의 내용을 상세히 입력해주세요"
          placeholderTextColor={COLORS.gray400}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />

        <Button title="문의 접수" onPress={handleSubmit} loading={loading} style={styles.submitButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.xl, paddingBottom: 40 },
  infoCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  infoTitle: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.xs },
  infoDesc: { fontSize: FONT_SIZE.sm, color: COLORS.gray500, lineHeight: 20 },
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
    minHeight: 180,
    marginBottom: SPACING.lg,
  },
  submitButton: { marginTop: SPACING.md },
});
