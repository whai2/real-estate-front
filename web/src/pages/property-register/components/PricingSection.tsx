import { Icon } from '@/components/ui/Icon';
import type { TradeInput } from '../PropertyRegisterPage';

type PricingSectionProps = {
  trades: TradeInput[];
  rooms: number;
  bathrooms: number;
  balcony: number;
  utilityRoom: number;
  onToggleTradeType: (type: TradeInput['type']) => void;
  onUpdateTrade: (index: number, updates: Partial<TradeInput>) => void;
  onChange: (field: string, value: string | number) => void;
};

const tradeTypeOptions: { key: TradeInput['type']; label: string; icon: string }[] = [
  { key: 'sale', label: '매매', icon: 'sell' },
  { key: 'investment', label: '투자', icon: 'trending_up' },
  { key: 'jeonse', label: '전세', icon: 'home' },
  { key: 'monthly', label: '월세', icon: 'calendar_month' },
];

const commissionTypes: { key: TradeInput['commissionType']; label: string }[] = [
  { key: 'none', label: '없음' },
  { key: 'single', label: '단타' },
  { key: 'double', label: '양타' },
];

function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">
        {label}
      </label>
      <div className="flex items-center bg-surface-container-low rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="p-3.5 hover:bg-surface-container transition-colors"
        >
          <Icon name="remove" className="text-sm" />
        </button>
        <input
          className="w-full bg-transparent border-none text-center font-bold focus:ring-0"
          type="text"
          readOnly
          value={value}
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="p-3.5 hover:bg-surface-container transition-colors"
        >
          <Icon name="add" className="text-sm" />
        </button>
      </div>
    </div>
  );
}

function TradeDetailForm({
  trade,
  onUpdate,
}: {
  trade: TradeInput;
  onUpdate: (updates: Partial<TradeInput>) => void;
}) {
  const label = tradeTypeOptions.find((o) => o.key === trade.type)?.label ?? '';

  return (
    <div className="bg-surface-container-low rounded-xl p-5 space-y-4">
      <h4 className="text-sm font-bold text-primary flex items-center gap-2">
        <Icon name={tradeTypeOptions.find((o) => o.key === trade.type)?.icon ?? 'sell'} className="text-lg" />
        {label} 조건
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Price fields vary by type */}
        {(trade.type === 'sale' || trade.type === 'investment') && (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface/60">
                {trade.type === 'sale' ? '매매가' : '투자가'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">₩</span>
                <input
                  className="w-full bg-surface-container-lowest border-none rounded-md pl-8 pr-3 py-3 text-sm focus:ring-2 focus:ring-secondary"
                  type="number"
                  placeholder="0"
                  value={trade.price}
                  onChange={(e) => onUpdate({ price: e.target.value })}
                />
              </div>
            </div>
            {trade.type === 'sale' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface/60">
                  담보실입 (선택)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">₩</span>
                  <input
                    className="w-full bg-surface-container-lowest border-none rounded-md pl-8 pr-3 py-3 text-sm focus:ring-2 focus:ring-secondary"
                    type="number"
                    placeholder="0"
                    value={trade.mortgageDeposit}
                    onChange={(e) => onUpdate({ mortgageDeposit: e.target.value })}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {trade.type === 'jeonse' && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface/60">
              전세가
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">₩</span>
              <input
                className="w-full bg-surface-container-lowest border-none rounded-md pl-8 pr-3 py-3 text-sm focus:ring-2 focus:ring-secondary"
                type="number"
                placeholder="0"
                value={trade.price}
                onChange={(e) => onUpdate({ price: e.target.value })}
              />
            </div>
          </div>
        )}

        {trade.type === 'monthly' && (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface/60">
                보증금
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">₩</span>
                <input
                  className="w-full bg-surface-container-lowest border-none rounded-md pl-8 pr-3 py-3 text-sm focus:ring-2 focus:ring-secondary"
                  type="number"
                  placeholder="0"
                  value={trade.deposit}
                  onChange={(e) => onUpdate({ deposit: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface/60">
                월세
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">₩</span>
                <input
                  className="w-full bg-surface-container-lowest border-none rounded-md pl-8 pr-3 py-3 text-sm focus:ring-2 focus:ring-secondary"
                  type="number"
                  placeholder="0"
                  value={trade.monthlyRent}
                  onChange={(e) => onUpdate({ monthlyRent: e.target.value })}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Commission */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface/60">수수료</label>
        <div className="flex gap-2">
          {commissionTypes.map((ct) => (
            <button
              key={ct.key}
              type="button"
              onClick={() => onUpdate({ commissionType: ct.key })}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                trade.commissionType === ct.key
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary'
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>
        {trade.commissionType !== 'none' && (
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">₩</span>
            <input
              className="w-full bg-surface-container-lowest border-none rounded-md pl-8 pr-3 py-3 text-sm focus:ring-2 focus:ring-secondary"
              type="number"
              placeholder="수수료 금액"
              value={trade.commissionAmount}
              onChange={(e) => onUpdate({ commissionAmount: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Field Inquiry (sale only) */}
      {trade.type === 'sale' && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={trade.fieldInquiry}
            onChange={(e) => onUpdate({ fieldInquiry: e.target.checked })}
            className="rounded border-outline-variant text-secondary focus:ring-secondary"
          />
          <span className="text-sm text-on-surface-variant">현장 문의</span>
        </label>
      )}
    </div>
  );
}

export function PricingSection({
  trades,
  rooms,
  bathrooms,
  balcony,
  utilityRoom,
  onToggleTradeType,
  onUpdateTrade,
  onChange,
}: PricingSectionProps) {
  const activeTypes = new Set(trades.map((t) => t.type));

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
          02
        </span>
        <h2 className="text-2xl font-bold tracking-tight font-headline">
          거래 조건 및 구조 정보
        </h2>
      </div>

      {/* Trade type multi-select */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">
          거래 형태 <span className="text-error">*</span> (복수 선택 가능)
        </label>
        <div className="flex flex-wrap gap-2">
          {tradeTypeOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => onToggleTradeType(opt.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTypes.has(opt.key)
                  ? 'bg-primary text-white shadow-lg shadow-primary/10'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
              }`}
            >
              <Icon name={opt.icon} className="text-lg" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Per-type pricing forms */}
      <div className="space-y-4">
        {trades.map((trade, index) => (
          <TradeDetailForm
            key={trade.type}
            trade={trade}
            onUpdate={(updates) => onUpdateTrade(index, updates)}
          />
        ))}
      </div>

      {/* Room structure */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Counter label="방 개수" value={rooms} onChange={(v) => onChange('rooms', v)} />
        <Counter label="욕실 개수" value={bathrooms} onChange={(v) => onChange('bathrooms', v)} />
        <Counter label="발코니/테라스" value={balcony} onChange={(v) => onChange('balcony', v)} />
        <Counter label="다용도실" value={utilityRoom} onChange={(v) => onChange('utilityRoom', v)} />
      </div>
    </section>
  );
}
