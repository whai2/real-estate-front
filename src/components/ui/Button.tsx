import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: Props) {
  const buttonStyles = getVariantStyle(variant);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        buttonStyles.container,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={buttonStyles.textColor} />
      ) : (
        <Text style={[styles.text, { color: buttonStyles.textColor }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function getVariantStyle(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return {
        container: { backgroundColor: COLORS.primary } as ViewStyle,
        textColor: COLORS.white,
      };
    case 'secondary':
      return {
        container: { backgroundColor: COLORS.primarySoft } as ViewStyle,
        textColor: COLORS.primary,
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: COLORS.primary,
        } as ViewStyle,
        textColor: COLORS.primary,
      };
    case 'ghost':
      return {
        container: { backgroundColor: 'transparent' } as ViewStyle,
        textColor: COLORS.gray600,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
