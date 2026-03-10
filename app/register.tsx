import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../src/components/ui/Button';
import Input from '../src/components/ui/Input';
import Header from '../src/components/ui/Header';
import { COLORS, FONT_SIZE, SPACING } from '../src/constants/theme';
import { useAuthStore } from '../src/stores/authStore';
import { apiRequest } from '../src/services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !agencyName.trim()) {
      Alert.alert('알림', '이름과 소속을 입력해주세요.');
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
          licenseNo: licenseNo.trim() || null,
        },
      });
      setAuth(useAuthStore.getState().token!, result.data);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('오류', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="회원가입" />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>정보를 입력해주세요</Text>
        <Text style={styles.subtitle}>
          부동산 중개업자 인증을 위해 필요합니다
        </Text>

        <Input
          label="이름"
          placeholder="실명을 입력해주세요"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="소속 (상호명)"
          placeholder="부동산 상호명을 입력해주세요"
          value={agencyName}
          onChangeText={setAgencyName}
        />
        <Input
          label="개업공인중개사 등록번호 (선택)"
          placeholder="등록번호를 입력해주세요"
          value={licenseNo}
          onChangeText={setLicenseNo}
        />

        <Button
          title="가입하기"
          onPress={handleSubmit}
          loading={loading}
          disabled={!name.trim() || !agencyName.trim()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING['2xl'],
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginBottom: SPACING['3xl'],
  },
});
