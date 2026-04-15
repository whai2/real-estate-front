import type { DashboardSummary } from '@/types/dashboard';

type Props = {
  summary: DashboardSummary | null;
};

export function MobileBentoStats({ summary }: Props) {
  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-on-surface font-headline">
          매물 분석 현황
        </h2>
        <span className="text-xs font-medium text-on-surface-variant">오늘 기준</span>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total */}
        <div className="bg-primary p-4 rounded-xl shadow-sm">
          <p className="font-label text-[10px] font-bold tracking-wider text-on-primary/70 uppercase mb-1">
            TOTAL
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-extrabold text-on-primary">{summary?.total ?? 0}</h3>
            <span className="text-xs text-on-primary/70">건</span>
          </div>
        </div>

        {/* Safe */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 shadow-sm">
          <p className="font-label text-[10px] font-bold tracking-wider text-secondary uppercase mb-1">
            SAFE
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-extrabold text-on-surface">{summary?.safe ?? 0}</h3>
            <span className="text-xs text-on-surface-variant">건</span>
          </div>
        </div>

        {/* Caution */}
        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/5">
          <p className="font-label text-[10px] font-bold tracking-wider text-on-tertiary-container uppercase mb-1">
            CAUTION
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-extrabold text-on-surface">{summary?.caution ?? 0}</h3>
            <span className="text-xs text-on-surface-variant">건</span>
          </div>
          <div className="mt-2 w-full h-1 bg-tertiary-fixed rounded-full overflow-hidden">
            <div className="bg-on-tertiary-container h-full w-[40%]" />
          </div>
        </div>

        {/* Danger */}
        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/5">
          <p className="font-label text-[10px] font-bold tracking-wider text-error uppercase mb-1">
            DANGER
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-extrabold text-on-surface">{summary?.danger ?? 0}</h3>
            <span className="text-xs text-on-surface-variant">건</span>
          </div>
          <div className="mt-2 w-full h-1 bg-error-container rounded-full overflow-hidden">
            <div className="bg-error h-full w-[15%]" />
          </div>
        </div>
      </div>
    </section>
  );
}
