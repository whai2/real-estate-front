import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';
import { BasicInfoSection } from './components/BasicInfoSection';
import { PricingSection } from './components/PricingSection';
import { PhotoUploadSection } from './components/PhotoUploadSection';
import { PreviewPanel } from './components/PreviewPanel';

export type TradeInput = {
  type: 'sale' | 'investment' | 'jeonse' | 'monthly';
  price: string;
  deposit: string;
  monthlyRent: string;
  mortgageDeposit: string;
  commissionType: 'none' | 'single' | 'double';
  commissionAmount: string;
  fieldInquiry: boolean;
};

export type ContactInput = {
  name: string;
  phone: string;
};

export type FormState = {
  title: string;
  address: string;
  propertyType: string;
  trades: TradeInput[];
  rooms: number;
  bathrooms: number;
  balcony: number;
  utilityRoom: number;
  special: '' | 'duplex' | 'terrace';
  occupancy: '' | 'occupied' | 'vacant' | 'movingSoon';
  description: string;
  contacts: ContactInput[];
  management: 'solo' | 'group';
};

function emptyTrade(type: TradeInput['type']): TradeInput {
  return {
    type,
    price: '',
    deposit: '',
    monthlyRent: '',
    mortgageDeposit: '',
    commissionType: 'none',
    commissionAmount: '',
    fieldInquiry: false,
  };
}

const initialForm: FormState = {
  title: '',
  address: '',
  propertyType: 'villa',
  trades: [emptyTrade('sale')],
  rooms: 3,
  bathrooms: 2,
  balcony: 1,
  utilityRoom: 0,
  special: '',
  occupancy: '',
  description: '',
  contacts: [{ name: '', phone: '' }],
  management: 'solo',
};

type SavedFormat = {
  _id: string;
  name: string;
  tradeTypes: string[];
  contacts: { name: string; phone: string }[];
  description?: string;
  management: string;
};

export default function PropertyRegisterPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formats, setFormats] = useState<SavedFormat[]>([]);
  const [showFormatPicker, setShowFormatPicker] = useState(false);
  const navigate = useNavigate();

  const loadFormats = useCallback(async () => {
    try {
      const res = await apiRequest<{ data: SavedFormat[] }>('/formats');
      setFormats(res.data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadFormats();
  }, [loadFormats]);

  function applyFormat(fmt: SavedFormat) {
    const typeMap: Record<string, TradeInput['type']> = {
      sale: 'sale',
      investment: 'investment',
      charter: 'jeonse',
      monthly: 'monthly',
    };
    setForm((prev) => ({
      ...prev,
      trades: fmt.tradeTypes.map((t) => emptyTrade(typeMap[t] ?? 'sale')),
      contacts: fmt.contacts.length > 0 ? fmt.contacts : prev.contacts,
      description: fmt.description ?? prev.description,
      management: (fmt.management as 'solo' | 'group') ?? prev.management,
    }));
    setShowFormatPicker(false);
  }

  async function saveAsFormat() {
    const name = prompt('서식 이름을 입력하세요');
    if (!name) return;
    const typeMap: Record<string, string> = {
      sale: 'sale',
      investment: 'investment',
      jeonse: 'charter',
      monthly: 'monthly',
    };
    await apiRequest('/formats', {
      method: 'POST',
      body: {
        name,
        tradeTypes: form.trades.map((t) => typeMap[t.type] ?? 'sale'),
        contacts: form.contacts.filter((c) => c.name || c.phone),
        description: form.description,
        management: form.management,
      },
    });
    loadFormats();
  }

  function updateForm<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleChange(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTradeType(type: TradeInput['type']) {
    setForm((prev) => {
      const existing = prev.trades.find((t) => t.type === type);
      if (existing) {
        if (prev.trades.length <= 1) return prev;
        return { ...prev, trades: prev.trades.filter((t) => t.type !== type) };
      }
      return { ...prev, trades: [...prev.trades, emptyTrade(type)] };
    });
  }

  function updateTrade(index: number, updates: Partial<TradeInput>) {
    setForm((prev) => ({
      ...prev,
      trades: prev.trades.map((t, i) => (i === index ? { ...t, ...updates } : t)),
    }));
  }

  async function handleSubmit() {
    if (!form.title || !form.address) return;
    setIsSubmitting(true);
    try {
      const tradeTypeMap: Record<string, string> = {
        sale: 'sale',
        investment: 'investment',
        jeonse: 'charter',
        monthly: 'monthly',
      };

      await apiRequest('/properties', {
        method: 'POST',
        body: {
          title: form.title,
          address: form.address,
          propertyType: form.propertyType,
          type: 'general',
          rooms: form.rooms,
          bathrooms: form.bathrooms,
          balcony: form.balcony,
          utilityRoom: form.utilityRoom,
          special: form.special || undefined,
          occupancy: form.occupancy || undefined,
          description: form.description || undefined,
          contacts: form.contacts.filter((c) => c.name || c.phone),
          management: form.management,
          trades: form.trades.map((t) => ({
            tradeType: tradeTypeMap[t.type] ?? 'sale',
            price: Number(t.price) || 0,
            deposit: Number(t.deposit) || 0,
            monthlyRent: Number(t.monthlyRent) || 0,
            mortgageDeposit: Number(t.mortgageDeposit) || undefined,
            commission: {
              type: t.commissionType,
              amount: Number(t.commissionAmount) || 0,
            },
            fieldInquiry: t.fieldInquiry,
          })),
        },
      });
      navigate('/property/manage');
    } catch {
      // error handled by api-client
    } finally {
      setIsSubmitting(false);
    }
  }

  // Legacy onChange adapter for BasicInfoSection
  const legacyForm = {
    title: form.title,
    address: form.address,
    propertyType: form.propertyType,
    occupancy: form.occupancy,
    special: form.special,
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-primary leading-tight mb-2 font-headline">
            신규 매물 등록
          </h1>
          <p className="text-on-surface-variant">
            새로운 매물 리스팅을 위한 상세 건축 프로필을 작성해 주세요.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <button
              onClick={() => setShowFormatPicker(!showFormatPicker)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md text-primary font-semibold hover:bg-surface-container transition-colors"
            >
              <Icon name="history" />
              이전 기록 불러오기
            </button>
            {showFormatPicker && formats.length > 0 && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/10 z-50 py-2">
                {formats.map((fmt) => (
                  <button
                    key={fmt._id}
                    onClick={() => applyFormat(fmt)}
                    className="w-full text-left px-4 py-3 hover:bg-surface-container-low text-sm font-medium transition-colors"
                  >
                    {fmt.name}
                  </button>
                ))}
              </div>
            )}
            {showFormatPicker && formats.length === 0 && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/10 z-50 p-4 text-sm text-on-surface-variant">
                저장된 서식이 없습니다.
              </div>
            )}
          </div>
          <button
            onClick={saveAsFormat}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-white border border-outline-variant/30 text-primary font-semibold shadow-sm hover:shadow transition-all"
          >
            <Icon name="save" />
            서식으로 저장
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Form */}
        <div className="lg:col-span-7 space-y-10">
          <BasicInfoSection form={legacyForm} onChange={handleChange} />

          {/* Section: Trade Types & Pricing */}
          <PricingSection
            trades={form.trades}
            rooms={form.rooms}
            bathrooms={form.bathrooms}
            balcony={form.balcony}
            utilityRoom={form.utilityRoom}
            onToggleTradeType={toggleTradeType}
            onUpdateTrade={updateTrade}
            onChange={handleChange}
          />

          {/* Section: Additional Details */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                03
              </span>
              <h2 className="text-2xl font-bold tracking-tight font-headline">
                추가 정보
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Occupancy */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">
                  거주 상태
                </label>
                <select
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-3.5 focus:ring-2 focus:ring-secondary transition-all"
                  value={form.occupancy}
                  onChange={(e) => handleChange('occupancy', e.target.value)}
                >
                  <option value="">미선택</option>
                  <option value="occupied">거주중</option>
                  <option value="vacant">공실</option>
                  <option value="movingSoon">이사예정</option>
                </select>
              </div>

              {/* Special Structure */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">
                  특수 구조
                </label>
                <select
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-3.5 focus:ring-2 focus:ring-secondary transition-all"
                  value={form.special}
                  onChange={(e) => handleChange('special', e.target.value)}
                >
                  <option value="">없음</option>
                  <option value="duplex">복층</option>
                  <option value="terrace">테라스</option>
                </select>
              </div>

              {/* Management */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">
                  관리 방식
                </label>
                <div className="flex p-1 bg-surface-container-low rounded-lg">
                  {(['solo', 'group'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => updateForm('management', m)}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-colors ${
                        form.management === m
                          ? 'bg-surface-container-lowest text-primary shadow-sm'
                          : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {m === 'solo' ? '1인 관리' : '그룹 관리'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">
                매물 내용
              </label>
              <textarea
                className="w-full bg-surface-container-low border-none rounded-md px-4 py-3.5 focus:ring-2 focus:ring-secondary transition-all min-h-[120px] resize-none"
                placeholder="매물에 대한 상세 설명을 입력하세요"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            {/* Contacts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">
                  담당자 정보
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updateForm('contacts', [...form.contacts, { name: '', phone: '' }])
                  }
                  className="text-xs font-bold text-primary hover:underline"
                >
                  + 연락처 추가
                </button>
              </div>
              {form.contacts.map((contact, i) => (
                <div key={i} className="flex gap-3">
                  <input
                    className="flex-1 bg-surface-container-low border-none rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-secondary"
                    placeholder="이름"
                    value={contact.name}
                    onChange={(e) => {
                      const updated = [...form.contacts];
                      updated[i] = { ...updated[i], name: e.target.value };
                      updateForm('contacts', updated);
                    }}
                  />
                  <input
                    className="flex-1 bg-surface-container-low border-none rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-secondary"
                    placeholder="연락처"
                    value={contact.phone}
                    onChange={(e) => {
                      const updated = [...form.contacts];
                      updated[i] = { ...updated[i], phone: e.target.value };
                      updateForm('contacts', updated);
                    }}
                  />
                  {form.contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateForm(
                          'contacts',
                          form.contacts.filter((_, j) => j !== i),
                        )
                      }
                      className="p-2 text-error hover:bg-error-container/20 rounded-lg"
                    >
                      <Icon name="close" className="text-lg" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <PhotoUploadSection photos={photos} onPhotosChange={setPhotos} />

          <div className="pt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-md shadow-xl hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-50"
            >
              {isSubmitting ? '등록 중...' : '검토 및 매물 등록 완료'}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <PreviewPanel form={{ title: form.title, address: form.address, propertyType: form.propertyType, tradeType: form.trades[0]?.type ?? 'sale', price: form.trades[0]?.price ?? '', commission: form.trades[0]?.commissionAmount ?? '', rooms: form.rooms, bathrooms: form.bathrooms, balcony: form.balcony }} />
      </div>
    </>
  );
}
