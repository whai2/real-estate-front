import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../src/components/ui/Header';
import Button from '../../src/components/ui/Button';
import ButtonGroup from '../../src/components/ui/ButtonGroup';
import PriceInput from '../../src/components/ui/PriceInput';
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

const TRADE_TYPES = [
  { key: 'sale', label: '매매' },
  { key: 'investment', label: '투자' },
  { key: 'charter', label: '전세' },
  { key: 'monthly', label: '월세' },
];

const ROOM_OPTIONS = [
  { key: '0', label: '원룸' },
  { key: '1.5', label: '1.5' },
  { key: '2', label: '2' },
  { key: '3', label: '3' },
  { key: '4', label: '4' },
  { key: '5', label: '5+' },
];

const BATH_OPTIONS = [
  { key: '1', label: '1' },
  { key: '2', label: '2' },
  { key: '3', label: '3' },
  { key: '4', label: '4+' },
];

const OCCUPANCY_OPTIONS = [
  { key: 'none', label: '미선택' },
  { key: 'occupied', label: '입주중' },
  { key: 'vacant', label: '공실' },
  { key: 'moving', label: '이사예정' },
];

const SPECIAL_OPTIONS = [
  { key: 'none', label: '없음' },
  { key: 'duplex', label: '복층' },
  { key: 'terrace', label: '테라스' },
];

type TradeData = {
  tradeType: string;
  price: string;
  deposit: string;
  monthlyRent: string;
  commissionType: 'none' | 'single' | 'double';
  commissionAmount: string;
  fieldInquiry: boolean;
};

const emptyTrade = (type: string): TradeData => ({
  tradeType: type,
  price: '',
  deposit: '',
  monthlyRent: '',
  commissionType: 'none',
  commissionAmount: '',
  fieldInquiry: false,
});

export default function GeneralRegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 기본 정보
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  // 매물 유형
  const [propertyType, setPropertyType] = useState('villa');

  // 주차
  const [parking, setParking] = useState<string[]>([]);

  // 거래 유형 (다중 선택)
  const [selectedTradeTypes, setSelectedTradeTypes] = useState<string[]>(['sale']);
  const [trades, setTrades] = useState<Record<string, TradeData>>({
    sale: emptyTrade('sale'),
  });

  // 거래 유형 토글
  const handleTradeTypeToggle = (key: string) => {
    setSelectedTradeTypes((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      // trades 동기화
      const newTrades = { ...trades };
      if (!prev.includes(key)) {
        newTrades[key] = emptyTrade(key);
      }
      setTrades(newTrades);
      return next;
    });
  };

  const updateTrade = (type: string, field: keyof TradeData, value: any) => {
    setTrades((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  // 구조
  const [rooms, setRooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('1');
  const [balcony, setBalcony] = useState(0);
  const [utilityRoom, setUtilityRoom] = useState(0);
  const [special, setSpecial] = useState('none');
  const [area, setArea] = useState('');

  // 입주 상태
  const [occupancy, setOccupancy] = useState('none');

  // 담당자
  const [contacts, setContacts] = useState([{ name: '', phone: '' }]);

  // 설명
  const [description, setDescription] = useState('');

  // 관리방식
  const [management, setManagement] = useState('solo');

  // 사진
  const [photos, setPhotos] = useState<{ uri: string }[]>([]);

  // 서식
  const [formats, setFormats] = useState<any[]>([]);
  const [formatAutoApply, setFormatAutoApply] = useState(false);

  useEffect(() => {
    loadFormats();
  }, []);

  const loadFormats = async () => {
    try {
      const res = await apiRequest('/formats');
      setFormats(res.data || []);
    } catch {}
  };

  const saveFormat = async () => {
    const name = Platform.OS === 'web'
      ? window.prompt('서식 이름을 입력하세요')
      : '기본 서식';
    if (!name) return;

    try {
      await apiRequest('/formats', {
        method: 'POST',
        body: {
          name,
          tradeTypes: selectedTradeTypes,
          contacts: contacts.filter((c) => c.name && c.phone),
          description,
          management,
        },
      });
      showAlert('완료', '서식이 저장되었습니다.');
      loadFormats();
    } catch (err: any) {
      showAlert('오류', err.message);
    }
  };

  const applyFormat = (format: any) => {
    if (format.tradeTypes) {
      setSelectedTradeTypes(format.tradeTypes);
      const newTrades: Record<string, TradeData> = {};
      format.tradeTypes.forEach((t: string) => {
        newTrades[t] = trades[t] || emptyTrade(t);
      });
      setTrades(newTrades);
    }
    if (format.contacts) setContacts(format.contacts);
    if (format.description) setDescription(format.description);
    if (format.management) setManagement(format.management);
  };

  // 사진
  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 30 - photos.length,
      quality: 0.7,
    });
    if (!result.canceled) {
      const newPhotos = result.assets.map((a) => ({ uri: a.uri }));
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 30));
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showAlert('알림', '매물명을 입력해주세요.');
      return;
    }
    if (!address.trim()) {
      showAlert('알림', '주소를 입력해주세요.');
      return;
    }
    if (selectedTradeTypes.length === 0) {
      showAlert('알림', '거래유형을 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      // TODO: 사진 업로드 (S3) - 기존 uploadImage 로직 재사용
      const tradesData = selectedTradeTypes.map((type) => {
        const t = trades[type];
        return {
          tradeType: type,
          price: t.price ? Number(t.price) : undefined,
          deposit: t.deposit ? Number(t.deposit) : undefined,
          monthlyRent: t.monthlyRent ? Number(t.monthlyRent) : undefined,
          commission: {
            type: t.commissionType,
            amount: t.commissionAmount ? Number(t.commissionAmount) : undefined,
          },
          fieldInquiry: t.fieldInquiry,
        };
      });

      await apiRequest('/properties', {
        method: 'POST',
        body: {
          type: 'general',
          title: title.trim(),
          address: address.trim(),
          addressDetail: addressDetail.trim() || undefined,
          lat: lat ?? undefined,
          lng: lng ?? undefined,
          propertyType,
          trades: tradesData,
          parking,
          rooms: rooms === '0' ? 1 : rooms === '5' ? 5 : Number(rooms) || 0,
          bathrooms: Number(bathrooms) || 0,
          balcony,
          utilityRoom,
          special,
          area: area ? Number(area) : undefined,
          occupancy,
          contacts: contacts.filter((c) => c.name && c.phone),
          description: description.trim() || undefined,
          management,
        },
      });

      showAlert('완료', '매물이 등록되었습니다.', () => router.back());
    } catch (err: any) {
      showAlert('오류', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="일반매물 등록" showBack />

      {/* 상단 바 - 서식 */}
      <View style={styles.topBar}>
        {formats.length > 0 && (
          <TouchableOpacity
            style={styles.formatSelector}
            onPress={() => applyFormat(formats[0])}
          >
            <Text style={styles.formatText}>서식 불러오기</Text>
          </TouchableOpacity>
        )}
        <View style={styles.formatToggle}>
          <Text style={styles.formatToggleLabel}>자동적용</Text>
          <Switch value={formatAutoApply} onValueChange={setFormatAutoApply} />
        </View>
        <TouchableOpacity style={styles.saveFormatBtn} onPress={saveFormat}>
          <Ionicons name="save-outline" size={16} color={COLORS.primary} />
          <Text style={styles.saveFormatText}>서식 저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 매물명 */}
        <Text style={styles.label}>매물명 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.textInput}
          placeholder="매물명을 입력하세요"
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

        {/* 매물유형 */}
        <Text style={styles.label}>매물유형 <Text style={styles.required}>*</Text></Text>
        <ButtonGroup
          options={PROPERTY_TYPES}
          selected={propertyType}
          onSelect={setPropertyType}
        />

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

        {/* 거래유형 */}
        <Text style={styles.label}>거래유형 <Text style={styles.required}>*</Text></Text>
        <ButtonGroup
          options={TRADE_TYPES}
          selected={selectedTradeTypes}
          onSelect={handleTradeTypeToggle}
          multiple
        />

        {/* 거래 유형별 가격 섹션 */}
        {selectedTradeTypes.map((type) => {
          const t = trades[type] || emptyTrade(type);
          const typeLabel = TRADE_TYPES.find((o) => o.key === type)?.label || type;

          return (
            <View key={type} style={styles.tradeSection}>
              <Text style={styles.tradeSectionTitle}>{typeLabel} 정보</Text>

              {type === 'monthly' ? (
                <>
                  <PriceInput
                    label="보증금"
                    value={t.deposit}
                    onChangeText={(v) => updateTrade(type, 'deposit', v)}
                    fieldInquiry={t.fieldInquiry}
                    onFieldInquiryChange={(v) => updateTrade(type, 'fieldInquiry', v)}
                  />
                  <PriceInput
                    label="월세"
                    value={t.monthlyRent}
                    onChangeText={(v) => updateTrade(type, 'monthlyRent', v)}
                  />
                </>
              ) : type === 'charter' ? (
                <PriceInput
                  label="전세가"
                  value={t.price}
                  onChangeText={(v) => updateTrade(type, 'price', v)}
                  fieldInquiry={t.fieldInquiry}
                  onFieldInquiryChange={(v) => updateTrade(type, 'fieldInquiry', v)}
                />
              ) : (
                <PriceInput
                  label={type === 'sale' ? '매매가' : '투자가'}
                  value={t.price}
                  onChangeText={(v) => updateTrade(type, 'price', v)}
                  fieldInquiry={t.fieldInquiry}
                  onFieldInquiryChange={(v) => updateTrade(type, 'fieldInquiry', v)}
                />
              )}

              {/* 수수료 */}
              <Text style={styles.subLabel}>수수료</Text>
              <ButtonGroup
                options={[
                  { key: 'none', label: '없음' },
                  { key: 'single', label: '편' },
                  { key: 'double', label: '양' },
                ]}
                selected={t.commissionType}
                onSelect={(v) => updateTrade(type, 'commissionType', v)}
                size="sm"
              />
              {t.commissionType !== 'none' && (
                <PriceInput
                  label="수수료 금액"
                  value={t.commissionAmount}
                  onChangeText={(v) => updateTrade(type, 'commissionAmount', v)}
                />
              )}
            </View>
          );
        })}

        {/* 방 구조 */}
        <Text style={styles.label}>방 구조</Text>
        <View style={styles.structureSection}>
          <View style={styles.structureRow}>
            <Text style={styles.subLabel}>방</Text>
            <ButtonGroup options={ROOM_OPTIONS} selected={rooms} onSelect={setRooms} size="sm" />
          </View>
          <View style={styles.structureRow}>
            <Text style={styles.subLabel}>화장실</Text>
            <ButtonGroup options={BATH_OPTIONS} selected={bathrooms} onSelect={setBathrooms} size="sm" />
          </View>
          <View style={styles.counterRow}>
            <Text style={styles.subLabel}>발코니</Text>
            <View style={styles.counter}>
              <TouchableOpacity onPress={() => setBalcony(Math.max(0, balcony - 1))}>
                <Ionicons name="remove-circle-outline" size={28} color={COLORS.gray400} />
              </TouchableOpacity>
              <Text style={styles.counterText}>{balcony}</Text>
              <TouchableOpacity onPress={() => setBalcony(Math.min(3, balcony + 1))}>
                <Ionicons name="add-circle-outline" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.counterRow}>
            <Text style={styles.subLabel}>다용도실</Text>
            <View style={styles.counter}>
              <TouchableOpacity onPress={() => setUtilityRoom(Math.max(0, utilityRoom - 1))}>
                <Ionicons name="remove-circle-outline" size={28} color={COLORS.gray400} />
              </TouchableOpacity>
              <Text style={styles.counterText}>{utilityRoom}</Text>
              <TouchableOpacity onPress={() => setUtilityRoom(Math.min(3, utilityRoom + 1))}>
                <Ionicons name="add-circle-outline" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.structureRow}>
            <Text style={styles.subLabel}>특수</Text>
            <ButtonGroup options={SPECIAL_OPTIONS} selected={special} onSelect={setSpecial} size="sm" />
          </View>
        </View>

        {/* 면적 */}
        <Text style={styles.label}>전용면적</Text>
        <TextInput
          style={styles.textInput}
          placeholder="면적 (평)"
          placeholderTextColor={COLORS.gray400}
          value={area}
          onChangeText={setArea}
          keyboardType="numeric"
        />

        {/* 입주 상태 */}
        <Text style={styles.label}>입주 상태</Text>
        <ButtonGroup options={OCCUPANCY_OPTIONS} selected={occupancy} onSelect={setOccupancy} />

        {/* 담당자 */}
        <Text style={styles.label}>담당자 <Text style={styles.required}>*</Text></Text>
        <ContactInput contacts={contacts} onChange={setContacts} />

        {/* 매물 설명 */}
        <Text style={styles.label}>매물 설명</Text>
        <TextInput
          style={styles.textArea}
          placeholder="매물에 대한 상세 설명을 입력하세요"
          placeholderTextColor={COLORS.gray400}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        {/* 사진 */}
        <Text style={styles.label}>매물 사진 ({photos.length}/30)</Text>
        {photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
            {photos.map((p, i) => (
              <View key={i} style={styles.photoWrapper}>
                <Image source={{ uri: p.uri }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.photoRemove}
                  onPress={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <Ionicons name="close" size={14} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        {photos.length < 30 && (
          <TouchableOpacity style={styles.photoUpload} onPress={pickPhotos}>
            <Ionicons name="camera-outline" size={28} color={COLORS.gray400} />
            <Text style={styles.photoUploadText}>클릭 또는 드래그하여 업로드 (최대 30장, 10MB)</Text>
          </TouchableOpacity>
        )}

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

        {/* 등록 버튼 */}
        <Button
          title="매물 등록 완료"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  formatSelector: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formatText: { fontSize: FONT_SIZE.sm, color: COLORS.gray600 },
  formatToggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  formatToggleLabel: { fontSize: FONT_SIZE.sm, color: COLORS.gray600 },
  saveFormatBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  saveFormatText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '500' },
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
  subLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    minHeight: 120,
  },
  addressRow: { flexDirection: 'row', gap: SPACING.sm },
  addressBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
  },
  addressBtnText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  tradeSection: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  tradeSectionTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  structureSection: { gap: SPACING.sm },
  structureRow: { gap: SPACING.xs },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  counter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  counterText: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.textPrimary, minWidth: 24, textAlign: 'center' },
  photoScroll: { marginBottom: SPACING.md },
  photoWrapper: { marginRight: SPACING.sm, position: 'relative' },
  photoPreview: { width: 80, height: 80, borderRadius: BORDER_RADIUS.sm },
  photoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoUpload: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING['2xl'],
    alignItems: 'center',
    gap: SPACING.sm,
  },
  photoUploadText: { fontSize: FONT_SIZE.sm, color: COLORS.gray400, textAlign: 'center' },
  submitButton: { marginTop: SPACING['2xl'] },
});
