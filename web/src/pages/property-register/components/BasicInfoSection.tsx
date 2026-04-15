import { Icon } from '@/components/ui/Icon';

type BasicInfoSectionProps = {
  form: {
    title: string;
    address: string;
    propertyType: string;
  };
  onChange: (field: string, value: string) => void;
};

export function BasicInfoSection({ form, onChange }: BasicInfoSectionProps) {
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
          <div className="relative">
            <Icon
              name="location_on"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
            />
            <input
              className="w-full bg-surface-container-low border-none rounded-md pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all"
              placeholder="도로명 주소 또는 지번을 입력하세요..."
              type="text"
              value={form.address}
              onChange={(e) => onChange('address', e.target.value)}
            />
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
    </section>
  );
}
