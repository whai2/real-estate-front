import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Header from '../../src/components/ui/Header';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { apiRequest } from '../../src/services/api';
import AddressSearch, { AddressResult } from '../../src/components/AddressSearch';

async function geocodeViaServer(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const { data } = await apiRequest<{ data: { lat: number; lng: number } | null }>(
      `/geocode?address=${encodeURIComponent(address)}`
    );
    return data;
  } catch (e) {
    console.log('[geocode] 서버 지오코딩 실패:', e);
    return null;
  }
}

const alert = (title: string, message: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
    onOk?.();
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message, onOk ? [{ text: '확인', onPress: onOk }] : undefined);
  }
};

type PropertyType = 'open' | 'general';
type DealType = 'sale' | 'jeonse' | 'monthly';

type UnitInfo = {
  floor: string;
  unitNumber: string;
  area: string;
  rooms: string;
  price: string;
  deposit: string;
  monthlyRent: string;
};

const emptyUnit = (): UnitInfo => ({
  floor: '',
  unitNumber: '',
  area: '',
  rooms: '',
  price: '',
  deposit: '',
  monthlyRent: '',
});

export default function PropertyRegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 기본 정보
  const [propertyType, setPropertyType] = useState<PropertyType>('general');
  const [dealType, setDealType] = useState<DealType>('monthly');
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // 가격 (대표)
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');

  // 상세 (대표 - 단일 호실일 때)
  const [area, setArea] = useState('');
  const [floor, setFloor] = useState('');
  const [rooms, setRooms] = useState('');
  const [description, setDescription] = useState('');

  // 호실별 정보
  const [useUnits, setUseUnits] = useState(false);
  const [units, setUnits] = useState<UnitInfo[]>([emptyUnit()]);

  const updateUnit = (index: number, field: keyof UnitInfo, value: string) => {
    setUnits((prev) => prev.map((u, i) => (i === index ? { ...u, [field]: value } : u)));
  };
  const addUnit = () => setUnits((prev) => [...prev, emptyUnit()]);
  const removeUnit = (index: number) => setUnits((prev) => prev.filter((_, i) => i !== index));

  // 주소 검색
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  // 사진
  const [images, setImages] = useState<{ uri: string }[]>([]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 10 - images.length,
      quality: 0.6,
      exif: false,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => ({ uri: asset.uri }));
      setImages((prev) => [...prev, ...newImages].slice(0, 10));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const filename = uri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const { data } = await apiRequest<{ data: { uploadUrl: string; fileUrl: string } }>(
      `/upload/presigned-url?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(type)}`
    );

    const response = await fetch(uri);
    const blob = await response.blob();

    await fetch(data.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': type },
      body: blob,
    });

    return data.fileUrl;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !address.trim()) {
      alert('알림', '제목과 주소는 필수입니다.');
      return;
    }

    if (dealType === 'monthly') {
      if (!deposit.trim() || !monthlyRent.trim()) {
        alert('알림', '보증금과 월세를 입력해주세요.');
        return;
      }
    } else if (!price.trim()) {
      alert('알림', '가격을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 이미지 업로드
      const uploadedImages: { url: string; order: number }[] = [];
      for (let i = 0; i < images.length; i++) {
        const url = await uploadImage(images[i].uri);
        uploadedImages.push({ url, order: i });
      }

      let priceText = '';
      if (dealType === 'sale') priceText = `매매 ${price}`;
      else if (dealType === 'jeonse') priceText = `전세 ${price}`;
      else priceText = `월세 ${deposit}/${monthlyRent}`;

      const unitsData = useUnits
        ? units
            .filter((u) => u.floor && u.unitNumber)
            .map((u) => ({
              floor: u.floor,
              unitNumber: u.unitNumber,
              area: u.area ? Number(u.area) : undefined,
              rooms: u.rooms ? Number(u.rooms) : undefined,
              price: u.price || undefined,
              deposit: u.deposit || undefined,
              monthlyRent: u.monthlyRent || undefined,
            }))
        : undefined;

      await apiRequest('/properties', {
        method: 'POST',
        body: {
          type: propertyType,
          title: title.trim(),
          address: address.trim(),
          lat: lat ?? undefined,
          lng: lng ?? undefined,
          price: priceText,
          deposit: dealType === 'monthly' ? deposit : undefined,
          monthlyRent: dealType === 'monthly' ? monthlyRent : undefined,
          area: !useUnits && area ? Number(area) : undefined,
          floor: !useUnits ? floor || undefined : undefined,
          rooms: !useUnits && rooms ? Number(rooms) : undefined,
          units: unitsData,
          description: description.trim() || undefined,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
        },
      });
      alert('완료', '매물이 등록되었습니다.', () => router.replace('/(tabs)/map'));
    } catch (err: any) {
      alert('오류', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="매물 등록" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 매물 유형 */}
        <Text style={styles.sectionTitle}>매물 유형</Text>
        <View style={styles.chipRow}>
          {([['open', '오픈현장'], ['general', '일반매물']] as const).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.chip, propertyType === key && styles.chipActive]}
              onPress={() => setPropertyType(key)}
            >
              <Text style={[styles.chipText, propertyType === key && styles.chipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 거래 유형 */}
        <Text style={styles.sectionTitle}>거래 유형</Text>
        <View style={styles.chipRow}>
          {([['sale', '매매'], ['jeonse', '전세'], ['monthly', '월세']] as const).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.chip, dealType === key && styles.chipActive]}
              onPress={() => setDealType(key)}
            >
              <Text style={[styles.chipText, dealType === key && styles.chipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 기본 정보 */}
        <Text style={styles.sectionTitle}>기본 정보</Text>
        <Input label="제목" placeholder="매물 제목을 입력하세요" value={title} onChangeText={setTitle} />
        <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
          <View pointerEvents="none">
            <Input label="주소" placeholder="주소를 검색하세요" value={address} editable={false} />
          </View>
        </TouchableOpacity>

        {/* 가격 */}
        <Text style={styles.sectionTitle}>가격 (만원)</Text>
        {dealType === 'monthly' ? (
          <View style={styles.priceRow}>
            <View style={styles.priceHalf}>
              <Input label="보증금" placeholder="보증금" value={deposit} onChangeText={setDeposit} keyboardType="numeric" />
            </View>
            <View style={styles.priceHalf}>
              <Input label="월세" placeholder="월세" value={monthlyRent} onChangeText={setMonthlyRent} keyboardType="numeric" />
            </View>
          </View>
        ) : (
          <Input
            label={dealType === 'sale' ? '매매가' : '전세가'}
            placeholder="금액을 입력하세요"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        )}

        {/* 상세 정보 */}
        <Text style={styles.sectionTitle}>상세 정보</Text>
        <TouchableOpacity
          style={[styles.chip, useUnits && styles.chipActive]}
          onPress={() => setUseUnits(!useUnits)}
        >
          <Text style={[styles.chipText, useUnits && styles.chipTextActive]}>
            호실별 입력
          </Text>
        </TouchableOpacity>

        {!useUnits ? (
          <View style={[styles.detailRow, { marginTop: SPACING.md }]}>
            <View style={styles.detailThird}>
              <Input label="면적(평)" placeholder="면적" value={area} onChangeText={setArea} keyboardType="numeric" />
            </View>
            <View style={styles.detailThird}>
              <Input label="층수" placeholder="층수" value={floor} onChangeText={setFloor} />
            </View>
            <View style={styles.detailThird}>
              <Input label="방 수" placeholder="방" value={rooms} onChangeText={setRooms} keyboardType="numeric" />
            </View>
          </View>
        ) : (
          <View style={{ marginTop: SPACING.md }}>
            {units.map((unit, idx) => (
              <View key={idx} style={styles.unitCard}>
                <View style={styles.unitHeader}>
                  <Text style={styles.unitTitle}>호실 {idx + 1}</Text>
                  {units.length > 1 && (
                    <TouchableOpacity onPress={() => removeUnit(idx)}>
                      <Text style={styles.unitRemove}>삭제</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailHalf}>
                    <Input label="층" placeholder="예: 3" value={unit.floor} onChangeText={(v) => updateUnit(idx, 'floor', v)} />
                  </View>
                  <View style={styles.detailHalf}>
                    <Input label="호수" placeholder="예: 301" value={unit.unitNumber} onChangeText={(v) => updateUnit(idx, 'unitNumber', v)} />
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailHalf}>
                    <Input label="면적(평)" placeholder="면적" value={unit.area} onChangeText={(v) => updateUnit(idx, 'area', v)} keyboardType="numeric" />
                  </View>
                  <View style={styles.detailHalf}>
                    <Input label="방 수" placeholder="방" value={unit.rooms} onChangeText={(v) => updateUnit(idx, 'rooms', v)} keyboardType="numeric" />
                  </View>
                </View>
                {dealType === 'monthly' ? (
                  <View style={styles.detailRow}>
                    <View style={styles.detailHalf}>
                      <Input label="보증금(만원)" placeholder="보증금" value={unit.deposit} onChangeText={(v) => updateUnit(idx, 'deposit', v)} keyboardType="numeric" />
                    </View>
                    <View style={styles.detailHalf}>
                      <Input label="월세(만원)" placeholder="월세" value={unit.monthlyRent} onChangeText={(v) => updateUnit(idx, 'monthlyRent', v)} keyboardType="numeric" />
                    </View>
                  </View>
                ) : (
                  <Input label="가격(만원)" placeholder="금액" value={unit.price} onChangeText={(v) => updateUnit(idx, 'price', v)} keyboardType="numeric" />
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addUnitBtn} onPress={addUnit}>
              <Text style={styles.addUnitText}>+ 호실 추가</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>상세 설명</Text>
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

        {/* 사진 업로드 */}
        <Text style={styles.sectionTitle}>사진</Text>
        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.imageWrapper}>
                <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.imageRemove} onPress={() => removeImage(idx)}>
                  <Text style={styles.imageRemoveText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        {images.length < 10 && (
          <TouchableOpacity style={styles.photoUpload} onPress={pickImages}>
            <Text style={styles.photoIcon}>📷</Text>
            <Text style={styles.photoText}>사진 추가 ({images.length}/10)</Text>
          </TouchableOpacity>
        )}

        <Button title="매물 등록하기" onPress={handleSubmit} loading={loading} style={styles.submitButton} />
      </ScrollView>

      <AddressSearch
        visible={addressModalVisible}
        onSelect={async (result: AddressResult) => {
          console.log('[AddressSearch] result:', JSON.stringify(result));
          const fullAddress = result.addressDetail
            ? `${result.address} (${result.addressDetail})`
            : result.address;
          setAddress(fullAddress);
          setAddressModalVisible(false);

          if (result.lat && result.lng) {
            setLat(result.lat);
            setLng(result.lng);
          } else {
            const coords = await geocodeViaServer(result.address);
            if (coords) {
              setLat(coords.lat);
              setLng(coords.lng);
            }
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
  scrollContent: { padding: SPACING.xl, paddingBottom: 40 },
  sectionTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  chipRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: { fontSize: FONT_SIZE.sm, color: COLORS.gray600, fontWeight: '500' },
  chipTextActive: { color: COLORS.white },
  priceRow: { flexDirection: 'row', gap: SPACING.md },
  priceHalf: { flex: 1 },
  detailRow: { flexDirection: 'row', gap: SPACING.sm },
  detailThird: { flex: 1 },
  detailHalf: { flex: 1 },
  unitCard: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.gray50,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  unitTitle: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.gray900 },
  unitRemove: { fontSize: FONT_SIZE.sm, color: COLORS.error, fontWeight: '600' },
  addUnitBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addUnitText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '600' },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: FONT_SIZE.base,
    color: COLORS.gray900,
    minHeight: 120,
    marginBottom: SPACING.lg,
  },
  imageScroll: { marginBottom: SPACING.md },
  imageWrapper: { marginRight: SPACING.sm, position: 'relative' },
  imagePreview: { width: 80, height: 80, borderRadius: BORDER_RADIUS.md },
  imageRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageRemoveText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  photoUpload: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING['2xl'],
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  photoIcon: { fontSize: 32 },
  photoText: { fontSize: FONT_SIZE.sm, color: COLORS.gray400 },
  submitButton: { marginTop: SPACING.md },
});
