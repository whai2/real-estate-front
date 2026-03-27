import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../src/components/ui/Header';
import Button from '../../src/components/ui/Button';
import ButtonGroup from '../../src/components/ui/ButtonGroup';
import ContactInput from '../../src/components/ui/ContactInput';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { apiRequest } from '../../src/services/api';
import AddressSearch, { AddressResult } from '../../src/components/AddressSearch';

const showAlert = (title: string, message: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
    onOk?.();
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message, onOk ? [{ text: '확인', onPress: onOk }] : undefined);
  }
};

const PROPERTY_TYPES = [
  { key: 'villa', label: '빌라/다세대' },
  { key: 'urban', label: '도시형' },
  { key: 'officetel', label: '오피스텔' },
  { key: 'apartment', label: '아파트' },
  { key: 'single', label: '단독/타운' },
  { key: 'multi', label: '다가구' },
  { key: 'commercial', label: '상가' },
];

const PARKING_OPTIONS = [
  { key: 'parallel', label: '병렬' },
  { key: 'double', label: '이중' },
  { key: 'mechanical', label: '기계식' },
  { key: 'impossible', label: '불가' },
];

export default function OpenSiteRegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const [propertyType, setPropertyType] = useState('villa');
  const [parking, setParking] = useState<string[]>([]);
  const [management, setManagement] = useState('solo');
  const [contacts, setContacts] = useState([{ name: '', phone: '' }]);

  // 단지정보
  const [buildings, setBuildings] = useState('');
  const [units, setUnits] = useState('');
  const [complexRooms, setComplexRooms] = useState('');

  // 일정
  const [scheduledDate, setScheduledDate] = useState('');

  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) {
      showAlert('알림', '현장명을 입력해주세요.');
      return;
    }
    if (!address.trim()) {
      showAlert('알림', '주소를 입력해주세요.');
      return;
    }
    if (!scheduledDate.trim()) {
      showAlert('알림', '일정을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/open-sites', {
        method: 'POST',
        body: {
          title: title.trim(),
          address: address.trim(),
          addressDetail: addressDetail.trim() || undefined,
          lat: lat ?? undefined,
          lng: lng ?? undefined,
          propertyType,
          parking,
          management,
          contacts: contacts.filter((c) => c.name && c.phone),
          complex: {
            buildings: buildings ? Number(buildings) : undefined,
            units: units ? Number(units) : undefined,
            rooms: complexRooms ? Number(complexRooms) : undefined,
          },
          scheduledDate: new Date(scheduledDate).toISOString(),
          description: description.trim() || undefined,
        },
      });

      showAlert('완료', '오픈현장이 등록되었습니다.', () => router.back());
    } catch (err: any) {
      showAlert('오류', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="오픈현장 등록" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 현장명 */}
        <Text style={styles.label}>현장명 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.textInput}
          placeholder="현장명을 입력하세요"
          placeholderTextColor={COLORS.gray400}
          value={title}
          onChangeText={setTitle}
        />

        {/* 주소 */}
        <Text style={styles.label}>주소 <Text style={styles.required}>*</Text></Text>
        <View style={styles.addressRow}>
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="주소를 검색하세요"
            placeholderTextColor={COLORS.gray400}
            value={address}
            editable={false}
          />
          <TouchableOpacity style={styles.addressBtn} onPress={() => setAddressModalVisible(true)}>
            <Text style={styles.addressBtnText}>주소검색</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.textInput, { marginTop: SPACING.sm }]}
          placeholder="상세주소"
          placeholderTextColor={COLORS.gray400}
          value={addressDetail}
          onChangeText={setAddressDetail}
        />

        {/* 일정 */}
        <Text style={styles.label}>일정 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.textInput}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.gray400}
          value={scheduledDate}
          onChangeText={setScheduledDate}
        />

        {/* 담당자 */}
        <Text style={styles.label}>담당자 <Text style={styles.required}>*</Text></Text>
        <ContactInput contacts={contacts} onChange={setContacts} />

        {/* 매물유형 */}
        <Text style={styles.label}>매물유형 <Text style={styles.required}>*</Text></Text>
        <ButtonGroup options={PROPERTY_TYPES} selected={propertyType} onSelect={setPropertyType} />

        {/* 단지정보 */}
        <Text style={styles.label}>단지정보</Text>
        <View style={styles.complexRow}>
          <View style={styles.complexItem}>
            <Text style={styles.subLabel}>동 수</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0"
              placeholderTextColor={COLORS.gray400}
              value={buildings}
              onChangeText={setBuildings}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.complexItem}>
            <Text style={styles.subLabel}>세대 수</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0"
              placeholderTextColor={COLORS.gray400}
              value={units}
              onChangeText={setUnits}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.complexItem}>
            <Text style={styles.subLabel}>방 수</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0"
              placeholderTextColor={COLORS.gray400}
              value={complexRooms}
              onChangeText={setComplexRooms}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* 주차방식 */}
        <Text style={styles.label}>주차방식</Text>
        <ButtonGroup
          options={PARKING_OPTIONS}
          selected={parking}
          onSelect={(key) => {
            setParking((prev) =>
              prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
            );
          }}
          multiple
        />

        {/* 관리방식 */}
        <Text style={styles.label}>관리방식</Text>
        <ButtonGroup
          options={[
            { key: 'solo', label: '1인 관리' },
            { key: 'group', label: '그룹 관리' },
          ]}
          selected={management}
          onSelect={setManagement}
        />

        {/* 설명 */}
        <Text style={styles.label}>설명</Text>
        <TextInput
          style={styles.textArea}
          placeholder="현장에 대한 설명을 입력하세요"
          placeholderTextColor={COLORS.gray400}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        <Button title="오픈현장 등록" onPress={handleSubmit} loading={loading} style={styles.submitButton} />
      </ScrollView>

      <AddressSearch
        visible={addressModalVisible}
        onSelect={async (result: AddressResult) => {
          setAddress(result.address);
          setAddressModalVisible(false);
          if (result.lat && result.lng) {
            setLat(result.lat);
            setLng(result.lng);
          } else {
            try {
              const { data } = await apiRequest(`/geocode?address=${encodeURIComponent(result.address)}`);
              if (data) { setLat(data.lat); setLng(data.lng); }
            } catch {}
          }
        }}
        onClose={() => setAddressModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.xl, paddingBottom: 60 },
  label: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xl,
  },
  required: { color: COLORS.danger },
  subLabel: { fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.gray600, marginBottom: 4 },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    minHeight: 100,
  },
  addressRow: { flexDirection: 'row', gap: SPACING.sm },
  addressBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
  },
  addressBtnText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  complexRow: { flexDirection: 'row', gap: SPACING.md },
  complexItem: { flex: 1 },
  submitButton: { marginTop: SPACING['2xl'] },
});
