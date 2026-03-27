import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RISK_COLORS, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';

type RiskLevel = 'danger' | 'caution' | 'safe';

type Props = {
  score: number;
  riskLevel?: RiskLevel;
  size?: 'sm' | 'md';
};

function getRiskLevel(score: number): RiskLevel {
  if (score < 60) return 'danger';
  if (score < 80) return 'caution';
  return 'safe';
}

const RISK_LABELS: Record<RiskLevel, string> = {
  danger: '위험',
  caution: '주의',
  safe: '양호',
};

export default function ScoreBadge({ score, riskLevel, size = 'md' }: Props) {
  const level = riskLevel || getRiskLevel(score);
  const colors = RISK_COLORS[level];
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }, isSmall && styles.badgeSm]}>
      <Text style={[styles.score, { color: colors.text }, isSmall && styles.scoreSm]}>{score}</Text>
      <Text style={[styles.label, { color: colors.text }, isSmall && styles.labelSm]}>{RISK_LABELS[level]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  score: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
  },
  scoreSm: {
    fontSize: FONT_SIZE.xs,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  labelSm: {
    fontSize: FONT_SIZE.xs,
  },
});
