export function MapLegend() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-lowest/90 backdrop-blur-md px-6 py-2 rounded-full shadow-2xl border border-outline-variant/10 flex items-center gap-8 z-20">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-secondary" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          매매
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          거래 완료
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-error" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          급매물/인기
        </span>
      </div>
    </div>
  );
}
