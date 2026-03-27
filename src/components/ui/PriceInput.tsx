import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, BORDER_RADIUS, SPACING } from '../../constants/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit?: string;
  fieldInquiry?: boolean;
  onFieldInquiryChange?: (checked: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
};

function formatPrice(value: string): string {
  const num = parseInt(value.replace(/[^\d]/g, ''), 10);
  if (isNaN(num)) return '';
  return num.toLocaleString();
}

export default function PriceInput({
  label,
  value,
  onChangeText,
  unit = '만원',
  fieldInquiry,
  onFieldInquiryChange,
  placeholder = '금액을 입력하세요',
  disabled = false,
}: Props) {
  const handleChange = (text: string) => {
    const numeric = text.replace(/[^\d]/g, '');
    onChangeText(numeric);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {onFieldInquiryChange !== undefined && (
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => onFieldInquiryChange(!fieldInquiry)}
          >
            <View style={[styles.checkbox, fieldInquiry && styles.checkboxChecked]}>
              {fieldInquiry && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>현장문의</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.inputRow, disabled && styles.inputDisabled]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          value={value ? formatPrice(value) : ''}
          onChangeText={handleChange}
          keyboardType="numeric"
          editable={!disabled && !fieldInquiry}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray600,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.white,
  },
  inputDisabled: {
    backgroundColor: COLORS.gray100,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
  },
  unit: {
    paddingRight: SPACING.md,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
  },
});
