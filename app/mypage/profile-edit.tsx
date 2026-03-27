import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../src/components/ui/Header';
import Button from '../../src/components/ui/Button';
import ButtonGroup from '../../src/components/ui/ButtonGroup';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { apiRequest } from '../../src/services/api';

const USER_TYPES = [
  { key: 'broker', label: '공인중개사' },
  { key: 'assistant', label: '중개보조원' },
  { key: 'fieldManager', label: '현장담당자' },
  { key: 'consultant', label: '분양컨설턴트' },
  { key: 'owner', label: '건축주' },
];

const showAlert = (title: string, message: string, onOk?: () => void) => {
  if (Platform.OS === 'web') { window.alert(`${title}\n${message}`); onOk?.(); }
  else require('react-native').Alert.alert(title, message, onOk ? [{ text: '확인', onPress: onOk }] : undefined);
};

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, setAuth, token, logout } = useAuthStore();

  const [userType, setUserType] = useState(user?.userType || 'broker');
  const [affiliation, setAffiliation] = useState(user?.affiliation || user?.agencyName || '');
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: { userType, affiliation, name, agencyName: affiliation },
      });
      setAuth(token!, res.data);
      showAlert('완료', '프로필이 저장되었습니다.', () => router.back());
    } catch (err: any) {
      showAlert('오류', err.message);
    }
    setLoading(false);
  };

  const handleWithdraw = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        doWithdraw();
      }
    } else {
      require('react-native').Alert.alert(
        '회원 탈퇴',
        '정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '탈퇴', style: 'destructive', onPress: doWithdraw },
        ]
      );
    }
  };

  const doWithdraw = async () => {
    try {
      await apiRequest('/auth/account', { method: 'DELETE' });
      logout();
      router.replace('/login');
    } catch (err: any) {
      showAlert('오류', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="프로필 수정" showBack />
      <View style={styles.content}>
        <Text style={styles.label}>회원 유형</Text>
        <ButtonGroup options={USER_TYPES} selected={userType} onSelect={setUserType} />

        <Text style={styles.label}>소속</Text>
        <TextInput
          style={styles.input}
          placeholder="소속을 입력하세요"
          placeholderTextColor={COLORS.gray400}
          value={affiliation}
          onChangeText={setAffiliation}
        />

        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          placeholder="이름을 입력하세요"
          placeholderTextColor={COLORS.gray400}
          value={name}
          onChangeText={setName}
        />

        <View style={styles.actionRow}>
          <Button title="취소" variant="outline" onPress={() => router.back()} style={{ flex: 1 }} />
          <Button title="저장" onPress={handleSave} loading={loading} style={{ flex: 1 }} />
        </View>

        <Button
          title="회원 탈퇴"
          variant="ghost"
          onPress={handleWithdraw}
          textStyle={{ color: COLORS.danger }}
          style={styles.withdrawBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { flex: 1, padding: SPACING.xl },
  label: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING.xl, marginBottom: SPACING.sm },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
  },
  actionRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING['2xl'] },
  withdrawBtn: { marginTop: SPACING['3xl'] },
});
