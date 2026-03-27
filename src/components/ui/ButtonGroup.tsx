import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, BORDER_RADIUS, SPACING } from '../../constants/theme';

type Option = {
  key: string;
  label: string;
};

type Props = {
  options: Option[];
  selected: string | string[];
  onSelect: (key: string) => void;
  multiple?: boolean;
  size?: 'sm' | 'md';
};

export default function ButtonGroup({ options, selected, onSelect, multiple = false, size = 'md' }: Props) {
  const selectedKeys = Array.isArray(selected) ? selected : [selected];
  const isSmall = size === 'sm';

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = selectedKeys.includes(option.key);
        return (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.button,
              isSmall && styles.buttonSm,
              isActive && styles.buttonActive,
            ]}
            onPress={() => onSelect(option.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, isSmall && styles.buttonTextSm, isActive && styles.buttonTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  buttonSm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
  },
  buttonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  buttonTextSm: {
    fontSize: FONT_SIZE.xs,
  },
  buttonTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
