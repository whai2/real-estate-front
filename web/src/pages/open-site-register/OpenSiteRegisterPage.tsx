import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';

const propertyTypes = [
  { value: 'villa', label: '빌라/연립/다세대' },
  { value: 'urban', label: '도시형 생활주택' },
  { value: 'officetel', label: '오피스텔' },
  { value: 'apartment', label: '아파트' },
  { value: 'single', label: '단독주택/타운하우스' },
  { value: 'multi', label: '다가구주택' },
  { value: 'commercial', label: '근린생활시설' },
];

export default function OpenSiteRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    address: '',
    addressDetail: '',
    propertyType: 'villa',
    contactName: '',
    contactPhone: '',
    buildings: '',
    units: '',
    rooms: '',
    management: 'solo',
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.address) return;
    setSubmitting(true);
    try {
      await apiRequest('/open-sites', {
        method: 'POST',
        body: {
          name: form.name,
          address: form.address,
          addressDetail: form.addressDetail,
          propertyType: form.propertyType,
          contacts: [{ name: form.contactName, phone: form.contactPhone }],
          complex: {
            buildings: Number(form.buildings) || undefined,
            units: Number(form.units) || undefined,
            rooms: Number(form.rooms) || undefined,
          },
          management: form.management,
        },
      });
      navigate('/open-schedule');
    } catch {
      // error
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tighter text-primary font-headline mb-2">
          오픈현장 등록
        </h1>
        <p className="text-on-surface-variant">새로운 오픈현장을 등록합니다.</p>
      </div>

      <div className="max-w-3xl space-y-8">
        {/* Section 1: Basic */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">01</span>
            <h2 className="text-xl font-bold font-headline">현장 기본 정보</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">현장명 *</label>
              <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="예: 역삼 푸르지오 분양현장" className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3.5 text-sm focus:ring-2 focus:ring-secondary" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">주소 *</label>
              <div className="relative">
                <Icon name="location_on" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
                <input value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="도로명 주소를 입력하세요" className="w-full bg-surface-container-low border-none rounded-lg pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-secondary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">매물 유형</label>
                <select value={form.propertyType} onChange={(e) => handleChange('propertyType', e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3.5 text-sm focus:ring-2 focus:ring-secondary">
                  {propertyTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">관리 방식</label>
                <select value={form.management} onChange={(e) => handleChange('management', e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3.5 text-sm focus:ring-2 focus:ring-secondary">
                  <option value="solo">1인 관리</option>
                  <option value="group">그룹 관리</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Contact */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">02</span>
            <h2 className="text-xl font-bold font-headline">담당자 및 단지 정보</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">담당자 이름</label>
              <input value={form.contactName} onChange={(e) => handleChange('contactName', e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3.5 text-sm focus:ring-2 focus:ring-secondary" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">연락처</label>
              <input value={form.contactPhone} onChange={(e) => handleChange('contactPhone', e.target.value)} placeholder="010-0000-0000" className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3.5 text-sm focus:ring-2 focus:ring-secondary" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">동 수</label>
              <input value={form.buildings} onChange={(e) => handleChange('buildings', e.target.value)} type="number" className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3.5 text-sm focus:ring-2 focus:ring-secondary" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">세대 수</label>
              <input value={form.units} onChange={(e) => handleChange('units', e.target.value)} type="number" className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3.5 text-sm focus:ring-2 focus:ring-secondary" />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button onClick={handleSubmit} disabled={submitting || !form.name || !form.address} className="px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-lg shadow-xl disabled:opacity-40">
            {submitting ? '등록 중...' : '오픈현장 등록 완료'}
          </button>
        </div>
      </div>
    </>
  );
}
