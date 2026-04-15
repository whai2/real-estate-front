import { Icon } from '@/components/ui/Icon';
import type { Property } from '@/types/property';

type Props = {
  properties: Property[];
  total: number;
  onPropertyClick?: (property: Property) => void;
};

function formatPrice(p: Property): string {
  const trade = p.trades?.[0];
  if (!trade) return '-';
  if (trade.price) {
    const billions = trade.price / 100000000;
    if (billions >= 1) return `${billions.toFixed(billions % 1 === 0 ? 0 : 1)}억`;
    return `${(trade.price / 10000).toLocaleString()}만`;
  }
  return '-';
}

function formatTradeType(p: Property): string {
  const trade = p.trades?.[0];
  if (!trade) return '';
  const map: Record<string, string> = { sale: '매매', jeonse: '전세', monthly: '월세', investment: '투자' };
  return map[trade.type] || '';
}

export function MobilePropertySlider({ properties, total, onPropertyClick }: Props) {
  if (properties.length === 0) return null;

  const count = total || properties.length;

  return (
    <section className="w-full px-4 pb-24 pointer-events-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-2 pointer-events-auto">
        <h2 className="text-on-surface font-bold text-lg tracking-tight">
          이 지역 추천 매물 <span className="text-secondary ml-1">{count}</span>
        </h2>
        <button className="text-on-surface-variant text-xs font-semibold flex items-center gap-1">
          전체보기 <Icon name="chevron_right" className="text-sm" />
        </button>
      </div>

      {/* Horizontal Slider */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x pb-4 pointer-events-auto">
        {properties.map((p) => (
          <div
            key={p._id}
            onClick={() => onPropertyClick?.(p)}
            className="snap-center flex-none w-[85%] bg-surface-container-lowest rounded-2xl shadow-[0_12px_40px_rgba(7,27,59,0.12)] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="flex h-32">
              {/* Thumbnail */}
              <div className="w-1/3 h-full relative">
                {p.photos?.[0] ? (
                  <img
                    className="w-full h-full object-cover"
                    src={p.photos[0]}
                    alt={p.title}
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container flex items-center justify-center">
                    <Icon name="image" className="text-2xl text-outline" />
                  </div>
                )}
                {p.score && p.score >= 90 && (
                  <div className="absolute top-2 left-2 bg-on-tertiary-container text-on-tertiary text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                    HOT
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="w-2/3 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-on-secondary-fixed-variant bg-secondary-fixed px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {p.propertyType === 'apartment' ? 'Apartment' : p.propertyType}
                    </span>
                    <Icon name="favorite" className="text-outline text-lg" />
                  </div>
                  <h3 className="text-on-surface font-bold text-base mt-1 line-clamp-1">{p.title}</h3>
                  <p className="text-on-surface-variant text-xs mt-0.5 line-clamp-1">{p.address}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-secondary font-extrabold text-xl">{formatPrice(p)}</span>
                  <span className="text-outline text-xs">{formatTradeType(p)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
