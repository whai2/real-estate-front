import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../src/components/ui/Button';
import Input from '../src/components/ui/Input';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { useAuthStore } from '../src/stores/authStore';
import { apiRequest } from '../src/services/api';

type Step = 'phone' | 'code';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 전화번호 포맷팅 (010-1234-5678)
  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handleSendCode = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 11) {
      Alert.alert('알림', '올바른 전화번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiRequest('/auth/send-code', {
        method: 'POST',
        body: { phone: cleaned },
      });
      setStep('code');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('알림', '6자리 인증번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await apiRequest('/auth/verify', {
        method: 'POST',
        body: { phone: phone.replace(/\D/g, ''), code },
      });
      setAuth(result.data.token, result.data.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 로고 영역 */}
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🏠</Text>
          </View>
          <Text style={styles.logoTitle}>부동산매물공유</Text>
          <Text style={styles.logoSubtitle}>종사자 전용 실시간 매물 공유 플랫폼</Text>
        </View>

        {/* 입력 영역 */}
        <View style={styles.formSection}>
          {step === 'phone' ? (
            <>
              <Input
                label="휴대폰 번호"
                placeholder="010-1234-5678"
                value={phone}
                onChangeText={(text) => setPhone(formatPhone(text))}
                keyboardType="phone-pad"
                maxLength={13}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button
                title="인증번호 받기"
                onPress={handleSendCode}
                loading={loading}
              />
            </>
          ) : (
            <>
              <View style={styles.phoneDisplay}>
                <Text style={styles.phoneText}>{phone}</Text>
                <Button
                  title="변경"
                  variant="ghost"
                  onPress={() => setStep('phone')}
                  style={styles.changeButton}
                  textStyle={styles.changeButtonText}
                />
              </View>
              <Input
                label="인증번호"
                placeholder="6자리 숫자 입력"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button
                title="로그인"
                onPress={handleVerify}
                loading={loading}
              />
            </>
          )}
        </View>

        {/* 하단 안내 */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.footerNotice}>
              아직 회원이 아니신가요? <Text style={styles.footerLink}>회원가입</Text>
            </Text>
          </TouchableOpacity>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>
            승인된 부동산 중개업자만 이용 가능합니다
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  inner: {
    flex: 1,
    paddingHorizontal: SPACING['2xl'],
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  logoEmoji: {
    fontSize: 36,
  },
  logoTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '800',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  logoSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
  },
  formSection: {
    flex: 1,
  },
  errorText: {
    color: '#DC2626',
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  phoneText: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  changeButton: {
    height: 32,
    paddingHorizontal: 12,
  },
  changeButtonText: {
    fontSize: FONT_SIZE.sm,
  },
  footer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerNotice: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.md,
  },
  footerLink: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.gray200,
    marginBottom: SPACING.md,
  },
  footerText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
  },
});
