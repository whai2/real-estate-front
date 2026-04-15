import { Icon } from '@/components/ui/Icon';
import { GlassPanel } from '@/components/GlassPanel';

export function InteractiveMap() {
  return (
    <div className="lg:col-span-8 h-[600px] rounded-3xl overflow-hidden relative border border-outline-variant/10 bg-slate-200">
      {/* Map placeholder — Kakao Map 연동 시 교체 */}
      <div className="w-full h-full bg-gradient-to-br from-[#0a1628] to-[#1a2b4c] flex items-center justify-center">
        <div className="text-center text-white/40">
          <Icon name="map" className="text-6xl mb-2" />
          <p className="text-sm font-label">카카오맵 연동 예정</p>
        </div>
      </div>

      {/* Overlay: Data Layer Label */}
      <div className="absolute top-6 left-6 flex flex-col gap-2">
        <GlassPanel className="px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Icon name="layers" className="text-sm" />
          <span className="text-xs font-bold">실거래 데이터 오버레이</span>
        </GlassPanel>
      </div>

      {/* Overlay: Marker Example */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2">
        <div className="relative group">
          <div className="w-8 h-8 bg-error text-white rounded-full flex items-center justify-center shadow-xl cursor-pointer group-hover:scale-110 transition-transform">
            <Icon name="location_on" className="text-sm" filled />
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-white p-2 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-[10px] font-black leading-tight">고위험 필지 분석</p>
            <p className="text-[8px] text-on-surface-variant">가압류 감지: #4920</p>
          </div>
        </div>
      </div>

      {/* Overlay: Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button className="w-10 h-10 glass-panel rounded-full flex items-center justify-center shadow-lg border border-white/40 text-primary">
          <Icon name="add" />
        </button>
        <button className="w-10 h-10 glass-panel rounded-full flex items-center justify-center shadow-lg border border-white/40 text-primary">
          <Icon name="remove" />
        </button>
        <button className="w-10 h-10 glass-panel rounded-full flex items-center justify-center shadow-lg border border-white/40 text-primary">
          <Icon name="my_location" />
        </button>
      </div>
    </div>
  );
}
