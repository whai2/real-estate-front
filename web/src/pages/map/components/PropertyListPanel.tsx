import { Icon } from '@/components/ui/Icon';
import type { Property } from '@/types/property';

type PropertyListPanelProps = {
  properties: Property[];
  total: number;
  onPropertyClick?: (property: Property) => void;
};

function formatPrice(p: Property): string {
  const trade = p.trades?.[0];
  if (!trade) return '-';
  if (trade.price) return `₩ ${trade.price.toLocaleString()}`;
  if (trade.deposit && trade.monthlyRent)
    return `₩ ${trade.deposit.toLocaleString()} / ${trade.monthlyRent.toLocaleString()}`;
  return '-';
}

export function PropertyListPanel({
  properties,
  total,
  onPropertyClick,
}: PropertyListPanelProps) {
  return (
    <div className="w-96 bg-surface-container-lowest h-full z-30 shadow-xl flex flex-col relative border-r border-outline-variant/10">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-headline font-bold tracking-tight">
            검색된 매물
          </h2>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 text-xs font-bold bg-surface-container-high text-on-surface rounded-full">
              가격순
            </button>
            <button className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low rounded-full">
              최신순
            </button>
          </div>
        </div>
        <div className="text-xs text-on-surface-variant flex gap-4">
          <span>총 {total}건의 결과</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-primary">
            <Icon name="tune" className="text-[14px]" /> 필터
          </span>
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {properties.length === 0 ? (
          <div className="text-center text-on-surface-variant text-sm py-12">
            지도를 이동하여 매물을 검색하세요.
          </div>
        ) : (
          properties.map((p) => (
            <div
              key={p._id}
              onClick={() => onPropertyClick?.(p)}
              className="group bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl overflow-hidden cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="h-40 bg-slate-200 relative">
                {p.photos?.[0] ? (
                  <img
                    className="w-full h-full object-cover"
                    src={p.photos[0]}
                    alt={p.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                    <Icon name="image" className="text-4xl" />
                  </div>
                )}
                {p.score && p.score >= 90 && (
                  <div className="absolute top-2 right-2 bg-on-tertiary-container text-surface-container-lowest px-2 py-1 rounded-md text-[10px] font-bold">
                    프리미엄
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-on-surface truncate">
                    {p.title}
                  </h3>
                  {p.score != null && (
                    <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {(p.score / 10).toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mb-2 truncate">
                  {p.address}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-secondary font-bold text-sm">
                    {formatPrice(p)}
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    침실 {p.rooms ?? '-'} &bull; 욕실 {p.bathrooms ?? '-'}
                    {p.area ? ` • ${p.area}m²` : ''}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
