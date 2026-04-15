import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Select } from '@/components/ui/Select';

type FilterState = {
  propertyType: string;
  distance: string;
  period: string;
  range: string;
  region: string;
};

export function TransactionFilters() {
  const [filters, setFilters] = useState<FilterState>({
    propertyType: 'all',
    distance: 'dong',
    period: '6month',
    range: 'normal',
    region: 'all',
  });

  function updateFilter(key: keyof FilterState, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="bg-surface-container-low p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-extrabold font-headline">실거래 비교 분석</h2>
        <button className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
          <Icon name="save" className="text-sm" />
          설정 저장
        </button>
      </div>
      <div className="space-y-4">
        <Select
          label="지역 선택"
          value={filters.region}
          onChange={(e) => updateFilter('region', e.target.value)}
        >
          <option value="all">전체</option>
          <option value="seoul">서울</option>
          <option value="gyeonggi">경기</option>
          <option value="incheon">인천</option>
        </Select>

        <Select
          label="매물 유형"
          value={filters.propertyType}
          onChange={(e) => updateFilter('propertyType', e.target.value)}
        >
          <option value="all">전체</option>
          <option value="villa">빌라/연립/다세대</option>
          <option value="officetel">오피스텔</option>
          <option value="apartment">아파트</option>
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="거리 기준"
            value={filters.distance}
            onChange={(e) => updateFilter('distance', e.target.value)}
          >
            <option value="dong">동 기준</option>
            <option value="300m">300m</option>
            <option value="500m">500m</option>
            <option value="1km">1km</option>
          </Select>
          <Select
            label="조회 기간"
            value={filters.period}
            onChange={(e) => updateFilter('period', e.target.value)}
          >
            <option value="6month">6개월</option>
            <option value="1year">1년</option>
            <option value="2year">2년</option>
            <option value="3year">3년</option>
          </Select>
        </div>

        {/* Range (strictness) */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">
            비교 범위
          </label>
          <div className="flex p-1 bg-surface-container-lowest rounded-xl gap-0.5">
            {[
              { key: 'strict', label: '엄격', desc: '±10%, ±5년' },
              { key: 'normal', label: '보통', desc: '±15%, ±7년' },
              { key: 'wide', label: '넓음', desc: '±20%, ±10년' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => updateFilter('range', opt.key)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                  filters.range === opt.key
                    ? 'bg-primary text-white'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
                title={opt.desc}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
