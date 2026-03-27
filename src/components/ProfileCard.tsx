import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, BORDER_RADIUS, SPACING } from '../constants/theme';

type Props = {
  name: string;
  agencyName?: string;
  userType?: string;
  phone?: string;
  address?: string;
  email?: string;
  remainingDays?: number;
  points?: number;
};

const USER_TYPE_LABELS: Record<string, string> = {
  broker: '공인중개사',
  assistant: '중개보조원',
  fieldManager: '현장담당자',
  consultant: '분양컨설턴트',
  owner: '건축주(시행·소유)',
};

export default function ProfileCard({
  name,
  agencyName,
  userType,
  phone,
  address,
  remainingDays,
  points,
}: Props) {
  return (
    <View style={styles.card}>
      {/* 상단 로고/회사명 */}
      <View style={styles.header}>
        <View style={styles.logoPlaceholder}>
          <Ionicons name="business-outline" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.headerInfo}>
          {agencyName && <Text style={styles.agencyName}>{agencyName}</Text>}
          <Text style={styles.nameRow}>
            {userType && <Text style={styles.userType}>{USER_TYPE_LABELS[userType] || userType} | </Text>}
            <Text style={styles.name}>{name}</Text>
          </Text>
        </View>
      </View>

      {/* 연락처 */}
      <View style={styles.details}>
        {phone && (
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={14} color={COLORS.gray400} />
            <Text style={styles.detailText}>{phone}</Text>
          </View>
        )}
        {address && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.gray400} />
            <Text style={styles.detailText}>{address}</Text>
          </View>
        )}
      </View>

      {/* 구독 정보 */}
      {(remainingDays !== undefined || points !== undefined) && (
        <View style={styles.subscription}>
          {remainingDays !== undefined && (
            <View style={styles.subItem}>
              <Text style={styles.subLabel}>잔여일수</Text>
              <Text style={styles.subValue}>{remainingDays}일</Text>
            </View>
          )}
          {points !== undefined && (
            <View style={styles.subItem}>
              <Text style={styles.subLabel}>포인트</Text>
              <Text style={styles.subValue}>{points.toLocaleString()}P</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  agencyName: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  nameRow: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userType: {
    color: COLORS.gray500,
  },
  name: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  details: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  subscription: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    gap: SPACING.xl,
  },
  subItem: {
    alignItems: 'center',
  },
  subLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
  },
  subValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
