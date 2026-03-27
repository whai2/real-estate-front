import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../src/components/ui/Header';
import Button from '../../src/components/ui/Button';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { apiRequest } from '../../src/services/api';

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') window.alert(`${title}\n${message}`);
  else require('react-native').Alert.alert(title, message);
};

const POINT_OPTIONS = [
  { points: 10000, price: 11000 },
  { points: 20000, price: 22000 },
  { points: 30000, price: 33000 },
  { points: 50000, price: 55000, popular: true },
  { points: 100000, price: 110000 },
  { points: 200000, price: 220000 },
];

const SUB_OPTIONS = [
  { days: 30, price: 12000, discount: 0 },
  { days: 90, price: 30000, discount: 17, original: 36000 },
  { days: 180, price: 50000, discount: 31, original: 72000, popular: true },
  { days: 400, price: 100000, discount: 38, original: 160000 },
];

export default function PurchaseScreen() {
  const [selectedPoints, setSelectedPoints] = useState(50000);
  const [loading, setLoading] = useState(false);

  const chargePoints = async (method: 'card' | 'bank') => {
    setLoading(true);
    try {
      await apiRequest('/purchase/points', {
        method: 'POST',
        body: { points: selectedPoints, method },
      });
      showAlert('완료', `${selectedPoints.toLocaleString()}P 충전 완료`);
    } catch (err: any) {
      showAlert('오류', err.message);
    }
    setLoading(false);
  };

  const purchaseSub = async (days: number) => {
    setLoading(true);
    try {
      await apiRequest('/purchase/subscription', {
        method: 'POST',
        body: { days },
      });
      showAlert('완료', `${days}일 이용권 구매 완료`);
    } catch (err: any) {
      showAlert('오류', err.message);
    }
    setLoading(false);
  };

  const selectedOption = POINT_OPTIONS.find((o) => o.points === selectedPoints)!;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="충전/구매" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 포인트 충전 */}
        <Text style={styles.sectionTitle}>포인트 충전</Text>
        <View style={styles.grid}>
          {POINT_OPTIONS.map((o) => (
            <TouchableOpacity
              key={o.points}
              style={[styles.pointCard, selectedPoints === o.points && styles.pointCardActive]}
              onPress={() => setSelectedPoints(o.points)}
            >
              {o.popular && <View style={styles.popularBadge}><Text style={styles.popularText}>인기</Text></View>}
              <Text style={[styles.pointAmount, selectedPoints === o.points && styles.pointAmountActive]}>
                {o.points.toLocaleString()}P
              </Text>
              <Text style={styles.pointPrice}>{o.price.toLocaleString()}원</Text>
              {selectedPoints === o.points && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>충전: {selectedPoints.toLocaleString()}P</Text>
          <Text style={styles.summaryPrice}>결제: {selectedOption.price.toLocaleString()}원</Text>
        </View>
        <View style={styles.paymentRow}>
          <Button title="카드결제" onPress={() => chargePoints('card')} style={[styles.payBtn, { backgroundColor: COLORS.safe }]} loading={loading} />
          <Button title="계좌이체" onPress={() => chargePoints('bank')} style={[styles.payBtn, { backgroundColor: COLORS.primary }]} loading={loading} />
        </View>
        <Text style={styles.vatNote}>결제 금액은 부가세(VAT) 10%가 포함된 금액입니다.</Text>

        {/* 이용권 구매 */}
        <Text style={styles.sectionTitle}>이용권 구매</Text>
        {SUB_OPTIONS.map((o) => (
          <TouchableOpacity key={o.days} style={styles.subCard} onPress={() => purchaseSub(o.days)}>
            <View style={styles.subInfo}>
              {o.popular && <View style={styles.popularBadge}><Text style={styles.popularText}>인기</Text></View>}
              <Text style={styles.subDays}>{o.days}일</Text>
              {o.discount > 0 && <Text style={styles.subDiscount}>-{o.discount}%</Text>}
            </View>
            <View style={styles.subPriceRow}>
              <Text style={styles.subPrice}>{o.price.toLocaleString()}P</Text>
              {o.original && <Text style={styles.subOriginal}>{o.original.toLocaleString()}P</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.xl, paddingBottom: 60 },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING.xl, marginBottom: SPACING.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  pointCard: {
    width: '48%',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  pointCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryBg },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: COLORS.safe,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  popularText: { fontSize: 10, color: COLORS.white, fontWeight: '700' },
  pointAmount: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.textPrimary },
  pointAmountActive: { color: COLORS.primary },
  pointPrice: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  checkmark: { position: 'absolute', top: 8, left: 8, fontSize: 16, color: COLORS.primary },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.md,
  },
  summaryLabel: { fontSize: FONT_SIZE.base, color: COLORS.textPrimary },
  summaryPrice: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.primary },
  paymentRow: { flexDirection: 'row', gap: SPACING.md },
  payBtn: { flex: 1 },
  vatNote: { fontSize: FONT_SIZE.xs, color: COLORS.gray400, marginTop: SPACING.sm, textAlign: 'center' },
  subCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  subInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  subDays: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.textPrimary },
  subDiscount: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.danger },
  subPriceRow: { alignItems: 'flex-end' },
  subPrice: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.primary },
  subOriginal: { fontSize: FONT_SIZE.sm, color: COLORS.gray400, textDecorationLine: 'line-through' },
});
