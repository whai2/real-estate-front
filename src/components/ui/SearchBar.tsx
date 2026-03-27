import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, BORDER_RADIUS, SPACING } from '../../constants/theme';

type SearchType = { key: string; label: string };

type Props = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: (text: string, typeKey: string) => void;
  searchTypes?: SearchType[];
  defaultTypeKey?: string;
};

export default function SearchBar({
  placeholder = '검색어를 입력하세요',
  value: controlledValue,
  onChangeText,
  onSearch,
  searchTypes,
  defaultTypeKey,
}: Props) {
  const [text, setText] = useState(controlledValue || '');
  const [selectedType, setSelectedType] = useState(defaultTypeKey || searchTypes?.[0]?.key || '');
  const [showDropdown, setShowDropdown] = useState(false);

  const displayValue = controlledValue !== undefined ? controlledValue : text;

  const handleChange = (val: string) => {
    setText(val);
    onChangeText?.(val);
  };

  const handleSearch = () => {
    onSearch?.(displayValue, selectedType);
  };

  return (
    <View style={styles.container}>
      {searchTypes && searchTypes.length > 1 && (
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(!showDropdown)}>
          <Text style={styles.dropdownText}>
            {searchTypes.find((t) => t.key === selectedType)?.label || '통합'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.gray500} />
        </TouchableOpacity>
      )}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray400}
        value={displayValue}
        onChangeText={handleChange}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Ionicons name="search" size={20} color={COLORS.white} />
      </TouchableOpacity>

      {showDropdown && searchTypes && (
        <View style={styles.dropdownMenu}>
          {searchTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedType(type.key);
                setShowDropdown(false);
              }}
            >
              <Text style={[styles.dropdownItemText, selectedType === type.key && styles.dropdownItemActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'visible',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  dropdownText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderTopRightRadius: BORDER_RADIUS.md - 1,
    borderBottomRightRadius: BORDER_RADIUS.md - 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 100,
    marginTop: 4,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  dropdownItemText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray600,
  },
  dropdownItemActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
