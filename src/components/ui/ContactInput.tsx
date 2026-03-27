import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, BORDER_RADIUS, SPACING } from '../../constants/theme';

type Contact = {
  name: string;
  phone: string;
};

type Props = {
  contacts: Contact[];
  onChange: (contacts: Contact[]) => void;
};

export default function ContactInput({ contacts, onChange }: Props) {
  const addContact = () => {
    onChange([...contacts, { name: '', phone: '' }]);
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeContact = (index: number) => {
    onChange(contacts.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      {contacts.map((contact, index) => (
        <View key={index} style={styles.row}>
          <TextInput
            style={[styles.input, styles.nameInput]}
            placeholder="이름"
            placeholderTextColor={COLORS.gray400}
            value={contact.name}
            onChangeText={(v) => updateContact(index, 'name', v)}
          />
          <TextInput
            style={[styles.input, styles.phoneInput]}
            placeholder="전화번호"
            placeholderTextColor={COLORS.gray400}
            value={contact.phone}
            onChangeText={(v) => updateContact(index, 'phone', v)}
            keyboardType="phone-pad"
          />
          {contacts.length > 1 && (
            <TouchableOpacity style={styles.removeButton} onPress={() => removeContact(index)}>
              <Ionicons name="close-circle" size={22} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={addContact}>
        <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
        <Text style={styles.addText}>담당자 추가</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  nameInput: {
    flex: 1,
  },
  phoneInput: {
    flex: 2,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
  },
  addText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
