import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONT_SIZE, BORDER_RADIUS, SPACING } from '../../constants/theme';

type Tab = {
  key: string;
  label: string;
  count?: number;
  dotColor?: string;
};

type Props = {
  tabs: Tab[];
  activeKey: string;
  onTabPress: (key: string) => void;
  scrollable?: boolean;
};

export default function FilterTabs({ tabs, activeKey, onTabPress, scrollable = false }: Props) {
  const content = tabs.map((tab) => {
    const isActive = tab.key === activeKey;
    return (
      <TouchableOpacity
        key={tab.key}
        style={[styles.tab, isActive && styles.tabActive]}
        onPress={() => onTabPress(tab.key)}
        activeOpacity={0.7}
      >
        {tab.dotColor && <View style={[styles.dot, { backgroundColor: tab.dotColor }]} />}
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
        {tab.count !== undefined && (
          <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
            <Text style={[styles.countText, isActive && styles.countTextActive]}>{tab.count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  });

  if (scrollable) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
        {content}
      </ScrollView>
    );
  }

  return <View style={[styles.container, styles.row]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray100,
    marginRight: SPACING.xs,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  countBadge: {
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  countText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  countTextActive: {
    color: COLORS.white,
  },
});
