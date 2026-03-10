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
import { apiRequest } from '../../src/services/api';

const AREA_OPTIONS = [
  '서울 전체', '강남구', '서초구', '송파구', '강동구',
  '마포구', '용산구', '성동구', '광진구', '영등포구',
] as const;

export default function NotificationSendScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSend = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/notifications', {
        method: 'POST',
        body: {
          title: title.trim(),
          content: content.trim(),
          targetArea: selectedAreas.length > 0 ? selectedAreas.join(',') : undefined,
        },
      });
      Alert.alert('완료', '알림이 발송되었습니다.', [
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
      <Header title="알림 보내기" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 포인트 안내 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📢</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>PUSH 알림 발송</Text>
            <Text style={styles.infoDesc}>
              선택한 지역의 종사자에게 푸시 알림을 보냅니다.{'\n'}
              1회 발송 시 포인트가 차감됩니다.
            </Text>
          </View>
        </View>

        {/* 제목 */}
        <Input
          label="알림 제목"
          placeholder="알림 제목을 입력하세요"
          value={title}
          onChangeText={setTitle}
        />

        {/* 내용 */}
        <Text style={styles.label}>알림 내용</Text>
        <TextInput
          style={styles.textArea}
          placeholder="알림 내용을 입력하세요"
          placeholderTextColor={COLORS.gray400}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />

        {/* 지역 선택 */}
        <Text style={styles.sectionTitle}>대상 지역 선택</Text>
        <Text style={styles.sectionDesc}>미선택 시 전체 지역에 발송됩니다.</Text>
        <View style={styles.areaGrid}>
          {AREA_OPTIONS.map((area) => (
            <TouchableOpacity
              key={area}
              style={[
                styles.areaChip,
                selectedAreas.includes(area) && styles.areaChipActive,
              ]}
              onPress={() => toggleArea(area)}
            >
              <Text
                style={[
                  styles.areaChipText,
                  selectedAreas.includes(area) && styles.areaChipTextActive,
                ]}
              >
                {area}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 미리보기 */}
        {title.trim() && (
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>미리보기</Text>
            <View style={styles.previewContent}>
              <Text style={styles.previewTitle}>{title}</Text>
              <Text style={styles.previewBody} numberOfLines={2}>
                {content || '(내용 없음)'}
              </Text>
            </View>
          </View>
        )}

        <Button
          title="알림 발송하기"
          onPress={handleSend}
          loading={loading}
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
    gap: SPACING.md,
  },
  infoIcon: { fontSize: 28 },
  infoContent: { flex: 1 },
  infoTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  infoDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    lineHeight: 20,
  },
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
    minHeight: 120,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  sectionDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray400,
    marginBottom: SPACING.md,
  },
  areaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  areaChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  areaChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  areaChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  areaChipTextActive: { color: COLORS.white },
  previewCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  previewLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.gray400,
    marginBottom: SPACING.sm,
  },
  previewContent: { gap: SPACING.xs },
  previewTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  previewBody: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  submitButton: { marginTop: SPACING.md },
});
