import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, BORDER_RADIUS, SPACING } from '../constants/theme';
import ScoreBadge from './ui/ScoreBadge';

type Trade = {
  tradeType: string;
  price?: number;
  deposit?: number;
  monthlyRent?: number;
};

type Props = {
  id: string;
  title: string;
  address: string;
  propertyType?: string;
  trades?: Trade[];
  rooms?: number;
  bathrooms?: number;
  area?: number;
  score?: number;
  riskLevel?: 'danger' | 'caution' | 'safe';
  thumbnail?: string;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoriteToggle?: () => void;
  onCopy?: () => void;
  compact?: boolean;
};

const TRADE_LABELS: Record<string, string> = {
  sale: '매',
  investment: '투자',
  charter: '전',
  monthly: '월',
};

function formatTradePrice(trade: Trade): string {
  const label = TRADE_LABELS[trade.tradeType] || '';
  if (trade.tradeType === 'monthly') {
    const dep = trade.deposit ? `${(trade.deposit / 10000).toFixed(0)}` : '0';
    const rent = trade.monthlyRent ? `/${trade.monthlyRent}` : '';
    return `${label} ${dep}${rent}만`;
  }
  const price = trade.price || trade.deposit || 0;
  if (price >= 10000) {
    return `${label} ${(price / 10000).toFixed(2)}억`;
  }
  return `${label} ${price.toLocaleString()}만`;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  villa: '빌라',
  urban: '도시형',
  officetel: '오피스텔',
  apartment: '아파트',
  single: '단독/타운',
  multi: '다가구',
  commercial: '상가',
};

export default function PropertyCard({
  title,
  address,
  propertyType,
  trades = [],
  rooms = 0,
  bathrooms = 0,
  area,
  score = 80,
  riskLevel,
  thumbnail,
  isFavorite = false,
  onPress,
  onFavoriteToggle,
  onCopy,
  compact = false,
}: Props) {
  return (
    <TouchableOpacity style={[styles.card, compact && styles.cardCompact]} onPress={onPress} activeOpacity={0.7}>
      {/* 썸네일 */}
      <View style={[styles.thumbnailContainer, compact && styles.thumbnailCompact]}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderBg]}>
            <Ionicons name="home-outline" size={24} color={COLORS.gray400} />
          </View>
        )}
      </View>

      {/* 정보 */}
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {score !== undefined && <ScoreBadge score={score} riskLevel={riskLevel} size="sm" />}
        </View>

        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.gray400} />
          <Text style={styles.address} numberOfLines={1}>{address}</Text>
        </View>

        {/* 가격 */}
        {trades.length > 0 && (
          <View style={styles.priceRow}>
            {trades.map((trade, i) => (
              <Text key={i} style={styles.price}>{formatTradePrice(trade)}</Text>
            ))}
          </View>
        )}

        {/* 구조 정보 */}
        <View style={styles.detailRow}>
          {propertyType && (
            <Text style={styles.detailText}>{PROPERTY_TYPE_LABELS[propertyType] || propertyType}</Text>
          )}
          {rooms > 0 && <Text style={styles.detailText}>방{rooms}개</Text>}
          {bathrooms > 0 && <Text style={styles.detailText}>화{bathrooms}개</Text>}
          {area && <Text style={styles.detailText}>{area}평</Text>}
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          {onCopy && (
            <TouchableOpacity onPress={onCopy} style={styles.actionBtn}>
              <Ionicons name="copy-outline" size={16} color={COLORS.gray500} />
            </TouchableOpacity>
          )}
          {onFavoriteToggle && (
            <TouchableOpacity onPress={onFavoriteToggle} style={styles.actionBtn}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? COLORS.danger : COLORS.gray400}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  cardCompact: {
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  thumbnailCompact: {
    width: 60,
    height: 60,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderBg: {
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  address: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.danger,
  },
  detailRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray500,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  actionBtn: {
    padding: 4,
  },
});
