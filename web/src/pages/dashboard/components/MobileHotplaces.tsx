import { Icon } from '@/components/ui/Icon';
import type { HotRegion } from '@/types/dashboard';

type Props = {
  regions: HotRegion[];
};

export function MobileHotplaces({ regions }: Props) {
  if (regions.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold tracking-tight font-headline">거래 핫플레이스</h2>
        <button className="text-xs font-bold text-secondary flex items-center gap-1">
          전체보기 <Icon name="chevron_right" className="text-sm" />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {regions.map((r) => (
          <div
            key={r.rank}
            className="min-w-[240px] relative overflow-hidden rounded-xl bg-primary shrink-0"
          >
            <div className="w-full h-48 flex flex-col justify-end p-4">
              <p className="text-[10px] font-bold text-tertiary-fixed-dim tracking-widest uppercase mb-1">
                TOP {r.rank}
              </p>
              <h4 className="text-lg font-bold text-white leading-tight">{r.region}</h4>
              <p className="text-xs text-white/70 mt-1">
                전체거래 {r.totalTrades.toLocaleString()}건
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
