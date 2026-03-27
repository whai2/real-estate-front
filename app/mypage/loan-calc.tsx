import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../src/components/ui/Header';
import Button from '../../src/components/ui/Button';
import FilterTabs from '../../src/components/ui/FilterTabs';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';

type Method = 'equalPrincipalInterest' | 'equalPrincipal' | 'bullet';

const METHODS = [
  { key: 'equalPrincipalInterest', label: '원리금균등' },
  { key: 'equalPrincipal', label: '원금균등' },
  { key: 'bullet', label: '만기일시' },
];

const AMOUNT_QUICK = [
  { label: '5천만', value: 50000000 },
  { label: '1억', value: 100000000 },
  { label: '2억', value: 200000000 },
  { label: '3억', value: 300000000 },
  { label: '5억', value: 500000000 },
  { label: '10억', value: 1000000000 },
];

const RATE_QUICK = [2, 2.5, 3, 3.5, 4, 5];

const PERIOD_QUICK = [
  { label: '1년', value: 12 },
  { label: '2년', value: 24 },
  { label: '10년', value: 120 },
  { label: '20년', value: 240 },
  { label: '30년', value: 360 },
  { label: '40년', value: 480 },
];

function calculate(amount: number, rate: number, months: number, method: Method) {
  const monthlyRate = rate / 100 / 12;

  if (method === 'equalPrincipalInterest') {
    if (monthlyRate === 0) {
      const monthly = amount / months;
      return { monthlyPayment: monthly, totalInterest: 0, totalPayment: amount };
    }
    const monthly = amount * monthlyRate * Math.pow(1 + monthlyRate, months)
      / (Math.pow(1 + monthlyRate, months) - 1);
    const total = monthly * months;
    return { monthlyPayment: monthly, totalInterest: total - amount, totalPayment: total };
  }

  if (method === 'equalPrincipal') {
    const principalPerMonth = amount / months;
    let totalInterest = 0;
    let remaining = amount;
    for (let i = 0; i < months; i++) {
      totalInterest += remaining * monthlyRate;
      remaining -= principalPerMonth;
    }
    const firstMonthly = principalPerMonth + amount * monthlyRate;
    return { monthlyPayment: firstMonthly, totalInterest, totalPayment: amount + totalInterest };
  }

  // bullet
  const monthlyInterest = amount * monthlyRate;
  const totalInterest = monthlyInterest * months;
  return { monthlyPayment: monthlyInterest, totalInterest, totalPayment: amount + totalInterest };
}

function formatWon(num: number): string {
  if (num >= 100000000) return `${(num / 100000000).toFixed(2)}억원`;
  if (num >= 10000) return `${Math.round(num / 10000).toLocaleString()}만원`;
  return `${Math.round(num).toLocaleString()}원`;
}

export default function LoanCalcScreen() {
  const [method, setMethod] = useState<Method>('equalPrincipalInterest');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('3.5');
  const [months, setMonths] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculate> | null>(null);

  const handleCalc = () => {
    const a = Number(amount);
    const r = Number(rate);
    const m = Number(months);
    if (!a || !r || !m) return;
    setResult(calculate(a, r, m, method));
  };

  const reset = () => {
    setAmount('');
    setRate('3.5');
    setMonths('');
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="대출 계산기" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 상환방식 */}
        <FilterTabs
          tabs={METHODS.map((m) => ({ key: m.key, label: m.label }))}
          activeKey={method}
          onTabPress={(k) => { setMethod(k as Method); setResult(null); }}
        />

        {/* 대출금액 */}
        <Text style={styles.label}>대출금액</Text>
        <TextInput
          style={styles.input}
          placeholder="금액을 입력하세요"
          placeholderTextColor={COLORS.gray400}
          value={amount ? Number(amount).toLocaleString() : ''}
          onChangeText={(t) => setAmount(t.replace(/[^\d]/g, ''))}
          keyboardType="numeric"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
          {AMOUNT_QUICK.map((q) => (
            <TouchableOpacity key={q.label} style={styles.quickBtn} onPress={() => setAmount(String(q.value))}>
              <Text style={styles.quickBtnText}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 이자율 */}
        <Text style={styles.label}>연이자율 (%)</Text>
        <View style={styles.rateRow}>
          <TouchableOpacity style={styles.rateBtn} onPress={() => setRate(String(Math.max(0, Number(rate) - 0.1).toFixed(1)))}>
            <Text style={styles.rateBtnText}>-0.1</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { flex: 1, textAlign: 'center' }]}
            value={rate}
            onChangeText={setRate}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity style={styles.rateBtn} onPress={() => setRate(String((Number(rate) + 0.1).toFixed(1)))}>
            <Text style={styles.rateBtnText}>+0.1</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
          {RATE_QUICK.map((r) => (
            <TouchableOpacity key={r} style={styles.quickBtn} onPress={() => setRate(String(r))}>
              <Text style={styles.quickBtnText}>{r}%</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 대출기간 */}
        <Text style={styles.label}>대출기간 (개월)</Text>
        <TextInput
          style={styles.input}
          placeholder="개월 수 입력 (예: 360)"
          placeholderTextColor={COLORS.gray400}
          value={months}
          onChangeText={setMonths}
          keyboardType="numeric"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
          {PERIOD_QUICK.map((p) => (
            <TouchableOpacity key={p.label} style={styles.quickBtn} onPress={() => setMonths(String(p.value))}>
              <Text style={styles.quickBtnText}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 버튼 */}
        <View style={styles.actionRow}>
          <Button title="초기화" variant="outline" onPress={reset} style={{ flex: 1 }} />
          <Button title="계산하기" onPress={handleCalc} style={{ flex: 2 }} />
        </View>

        {/* 결과 */}
        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>월 상환액</Text>
              <Text style={styles.resultValue}>{formatWon(result.monthlyPayment)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>총 이자</Text>
              <Text style={[styles.resultValue, { color: COLORS.danger }]}>{formatWon(result.totalInterest)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>총 상환액</Text>
              <Text style={styles.resultValue}>{formatWon(result.totalPayment)}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.xl, paddingBottom: 60 },
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
  quickRow: { marginTop: SPACING.sm, marginBottom: SPACING.xs },
  quickBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray100,
    marginRight: SPACING.sm,
  },
  quickBtnText: { fontSize: FONT_SIZE.sm, color: COLORS.gray600 },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  rateBtn: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rateBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.gray600 },
  actionRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl },
  resultCard: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: FONT_SIZE.base, color: COLORS.textSecondary },
  resultValue: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.textPrimary },
});
