import { useState, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import { AddressSearchModal, type DaumPostcodeResult } from '@/components/AddressSearchModal';

type BasicInfoSectionProps = {
  form: {
    title: string;
    address: string;
    propertyType: string;
  };
  onChange: (field: string, value: string | number) => void;
};

export function BasicInfoSection({ form, onChange }: BasicInfoSectionProps) {
  const [showAddressModal, setShowAddressModal] = useState(false);

  const handleAddressSelect = useCallback(
    (data: DaumPostcodeResult) => {
      const address = data.roadAddress || data.jibunAddress;
      onChange('address', address);

      // 카카오 Geocoder로 좌표 추출
      if (typeof kakao !== 'undefined' && kakao.maps) {
        kakao.maps.load(() => {
          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.addressSearch(address, (result: any[], status: string) => {
            if (status === kakao.maps.services.Status.OK && result[0]) {
              onChange('lat', parseFloat(result[0].y));
              onChange('lng', parseFloat(result[0].x));
            }
          });
        });
      }
    },
    [onChange],
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
          01
        </span>
        <h2 className="text-2xl font-bold tracking-tight font-headline">
          매물 기본 정보
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">
            매물 명칭 <span className="text-error">*</span>
          </label>
          <input
            className="w-full bg-surface-container-low border-none rounded-md px-4 py-3.5 focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
            placeholder="예: 스카이라인 레지던스 펜트하우스"
            type="text"
            value={form.title}
            onChange={(e) => onChange('title', e.target.value)}
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">
            주소 검색 <span className="text-error">*</span>
          </label>
          <div
            className="relative cursor-pointer"
            onClick={() => setShowAddressModal(true)}
          >
            <Icon
              name="location_on"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
            />
            <input
              className="w-full bg-surface-container-low border-none rounded-md pl-12 pr-24 py-3.5 focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all cursor-pointer"
              placeholder="클릭하여 주소를 검색하세요"
              type="text"
              value={form.address}
              readOnly
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddressModal(true);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-md hover:opacity-90 transition-opacity"
            >
              주소 찾기
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">
            부동산 유형 <span className="text-error">*</span>
          </label>
          <select
            className="w-full bg-surface-container-low border-none rounded-md px-4 py-3.5 focus:ring-2 focus:ring-secondary transition-all"
            value={form.propertyType}
            onChange={(e) => onChange('propertyType', e.target.value)}
          >
            <option value="villa">빌라/연립/다세대</option>
            <option value="urban">도시형 생활주택</option>
            <option value="officetel">오피스텔</option>
            <option value="apartment">아파트</option>
            <option value="single">단독주택/타운하우스</option>
            <option value="multi">다가구주택</option>
            <option value="commercial">근린생활시설</option>
          </select>
        </div>
      </div>

      <AddressSearchModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelect={handleAddressSelect}
      />
    </section>
  );
}
