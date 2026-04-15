export function MapLegend() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-lowest/90 backdrop-blur-md px-6 py-2 rounded-full shadow-2xl border border-outline-variant/10 flex items-center gap-8 z-20">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ background: '#055db6' }} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          일반 매물
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ background: '#e53935' }} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          현장 매물
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          거래 완료
        </span>
      </div>
    </div>
  );
}
