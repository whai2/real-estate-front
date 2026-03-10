import React, { useState } from 'react';
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
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { apiRequest } from '../../src/services/api';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setAuth, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [agencyName, setAgencyName] = useState(user?.agencyName || '');
  const [licenseNo, setLicenseNo] = useState(user?.licenseNo || '');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: {
          userId: user?._id,
          name: name.trim(),
          agencyName: agencyName.trim(),
          licenseNo: licenseNo.trim() || undefined,
        },
      });
      if (token) {
        setAuth(token, result.data);
      }
      Alert.alert('완료', '프로필이 수정되었습니다.', [
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
      <Header title="프로필 수정" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 프로필 아바타 */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name?.charAt(0) || '?'}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>사진 변경</Text>
          </TouchableOpacity>
        </View>

        <Input label="이름" placeholder="이름을 입력하세요" value={name} onChangeText={setName} />
        <Input label="소속 중개사무소" placeholder="소속을 입력하세요" value={agencyName} onChangeText={setAgencyName} />
        <Input label="자격번호" placeholder="자격번호 (선택)" value={licenseNo} onChangeText={setLicenseNo} />

        <View style={styles.phoneRow}>
          <Text style={styles.phoneLabel}>전화번호</Text>
          <Text style={styles.phoneValue}>{user?.phone || '-'}</Text>
        </View>

        <Button
          title="저장하기"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.xl, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: SPACING['2xl'] },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: { fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.primary },
  changePhotoText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '600' },
  phoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    marginBottom: SPACING.xl,
  },
  phoneLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.gray700 },
  phoneValue: { fontSize: FONT_SIZE.base, color: COLORS.gray500 },
  saveButton: { marginTop: SPACING.md },
});
