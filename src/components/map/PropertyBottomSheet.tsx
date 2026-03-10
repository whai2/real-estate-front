import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { MapProperty } from './KakaoMap';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MIN_HEIGHT = 0;
const SHEET_PEEK_HEIGHT = 280;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.7;

type Props = {
  property: MapProperty | null;
  onClose: () => void;
  onDetail: (id: string) => void;
};

export default function PropertyBottomSheet({ property, onClose, onDetail }: Props) {
  const translateY = React.useRef(new Animated.Value(SHEET_PEEK_HEIGHT)).current;

  React.useEffect(() => {
    if (property) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_PEEK_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [property]);

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          translateY.setValue(g.dy);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!property) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
      ]}
      {...panResponder.panHandlers}
    >
      {/* 드래그 핸들 */}
      <View style={styles.handleBar}>
        <View style={styles.handle} />
      </View>

      {/* 매물 정보 */}
      <View style={styles.content}>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>
            {property.type === 'open' ? '오픈현장' : '일반매물'}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {property.title}
        </Text>

        <Text style={styles.address} numberOfLines={1}>
          {property.address}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>가격</Text>
          <Text style={styles.priceValue}>{property.price}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => onDetail(property._id)}
          >
            <Text style={styles.detailButtonText}>상세보기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton}>
            <Text style={styles.favoriteButtonText}>♡ 관심</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    paddingBottom: 30,
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray300,
  },
  content: {
    paddingHorizontal: SPACING.xl,
  },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: SPACING.sm,
  },
  typeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  address: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  priceLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginRight: SPACING.sm,
  },
  priceValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  detailButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
  },
  favoriteButton: {
    height: 48,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonText: {
    color: COLORS.gray700,
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
  },
});
