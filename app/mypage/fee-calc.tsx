import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../src/components/ui/Header';
import Button from '../../src/components/ui/Button';
import ButtonGroup from '../../src/components/ui/ButtonGroup';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';

type TradeType = 'sale' | 'lease';

// 법정 요율표 (주거용)
const SALE_RATES = [
  { max: 50000000, rate: 0.006, limit: 250000 },
  { max: 200000000, rate: 0.005, limit: 800000 },
  { max: 900000000, rate: 0.004, limit: null },
  { max: 1200000000, rate: 0.005, limit: null },
  { max: 1500000000, rate: 0.006, limit: null },
  { max: Infinity, rate: 0.007, limit: null },
];

const LEASE_RATES = [
  { max: 50000000, rate: 0.005, limit: 200000 },
  { max: 100000000, rate: 0.004, limit: 300000 },
  { max: 600000000, rate: 0.003, limit: null },
  { max: 1200000000, rate: 0.004, limit: null },
  { max: 1500000000, rate: 0.005, limit: null },
  { max: Infinity, rate: 0.006, limit: null },
];

function calculateFee(amount: number, tradeType: TradeType) {
  const rates = tradeType === 'sale' ? SALE_RATES : LEASE_RATES;
  const tier = rates.find((r) => amount < r.max)!;
  const fee = amount * tier.rate;
  const finalFee = tier.limit ? Math.min(fee, tier.limit) : fee;
  return {
    fee: Math.round(finalFee),
    rate: tier.rate,
    limit: tier.limit,
    ratePercent: (tier.rate * 100).toFixed(1),
  };
}

function formatWon(num: number): string {
  if (num >= 100000000) return `${(num / 100000000).toFixed(2)}억원`;
  if (num >= 10000) return `${Math.round(num / 10000).toLocaleString()}만원`;
  return `${Math.round(num).toLocaleString()}원`;
}

export default function FeeCalcScreen() {
  const [tradeType, setTradeType] = useState<TradeType>('sale');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateFee> | null>(null);

  const handleCalc = () => {
    const a = Number(amount);
    if (!a) return;
    setResult(calculateFee(a, tradeType));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="수수료 계산기" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>거래 유형</Text>
        <ButtonGroup
          options={[
            { key: 'sale', label: '매매/교환' },
            { key: 'lease', label: '임대/전세' },
          ]}
          selected={tradeType}
          onSelect={(k) => { setTradeType(k as TradeType); setResult(null); }}
        />

        <Text style={styles.label}>거래 금액</Text>
        <TextInput
          style={styles.input}
          placeholder="금액을 입력하세요 (원)"
          placeholderTextColor={COLORS.gray400}
          value={amount ? Number(amount).toLocaleString() : ''}
          onChangeText={(t) => setAmount(t.replace(/[^\d]/g, ''))}
          keyboardType="numeric"
        />

        <View style={styles.actionRow}>
          <Button title="초기화" variant="outline" onPress={() => { setAmount(''); setResult(null); }} style={{ flex: 1 }} />
          <Button title="계산하기" onPress={handleCalc} style={{ flex: 2 }} />
        </View>

        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>수수료</Text>
              <Text style={styles.resultValue}>{formatWon(result.fee)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>적용 요율</Text>
              <Text style={styles.resultSubValue}>{result.ratePercent}%</Text>
            </View>
            {result.limit && (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>한도</Text>
                <Text style={styles.resultSubValue}>{formatWon(result.limit)}</Text>
              </View>
            )}
          </View>
        )}

        {/* 요율표 */}
        <Text style={styles.tableTitle}>
          {tradeType === 'sale' ? '매매/교환 법정 요율표' : '임대/전세 법정 요율표'}
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>거래금액</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>요율</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>한도</Text>
          </View>
          {(tradeType === 'sale' ? SALE_RATES : LEASE_RATES).map((r, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {r.max === Infinity ? `${formatWon((tradeType === 'sale' ? SALE_RATES : LEASE_RATES)[i - 1]?.max || 0)} 이상` : `${formatWon(r.max)} 미만`}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{(r.rate * 100).toFixed(1)}%</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{r.limit ? formatWon(r.limit) : '-'}</Text>
            </View>
          ))}
        </View>
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
  resultValue: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.primary },
  resultSubValue: { fontSize: FONT_SIZE.base, fontWeight: '600', color: COLORS.textPrimary },
  tableTitle: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING['2xl'], marginBottom: SPACING.md },
  table: { borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.sm, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: COLORS.gray100, padding: SPACING.sm },
  tableHeaderText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.gray600 },
  tableRow: { flexDirection: 'row', padding: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  tableCell: { fontSize: FONT_SIZE.sm, color: COLORS.textPrimary },
});
