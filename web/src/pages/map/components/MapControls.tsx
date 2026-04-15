import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useMapStore } from '@/stores/map.store';

export function MapControls() {
  const { drawingMode, showTransactionLayer, toggleDrawingMode, toggleTransactionLayer } = useMapStore();
  const [showAlertModal, setShowAlertModal] = useState(false);

  return (
    <>
      <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
        {/* Drawing & Layers */}
        <div className="bg-surface-container-lowest rounded-xl shadow-2xl p-1 flex flex-col gap-1 border border-outline-variant/10">
          <button
            onClick={toggleDrawingMode}
            className={`p-3 rounded-lg transition-colors ${
              drawingMode
                ? 'bg-primary text-white'
                : 'hover:bg-surface-container-low text-on-surface'
            }`}
            title={drawingMode ? '영역 선택 취소' : '영역 선택'}
          >
            <Icon name="polyline" />
          </button>
          <button
            className="p-3 hover:bg-surface-container-low text-on-surface rounded-lg transition-colors"
            title="거리 측정"
          >
            <Icon name="straighten" />
          </button>
          <div className="h-px bg-outline-variant/10 mx-2" />
          <button
            onClick={toggleTransactionLayer}
            className={`p-3 rounded-lg transition-colors ${
              showTransactionLayer
                ? 'bg-secondary text-white'
                : 'bg-secondary-container text-on-secondary-container'
            }`}
            title={showTransactionLayer ? '실거래가 숨기기' : '실거래가 보기'}
          >
            <Icon name="receipt_long" />
          </button>
          <button
            onClick={() => setShowAlertModal(true)}
            className="p-3 hover:bg-surface-container-low text-on-surface rounded-lg transition-colors"
            title="주변 거래 알림 설정"
          >
            <Icon name="notifications_active" />
          </button>
        </div>

        {/* Navigation */}
        <div className="bg-surface-container-lowest rounded-xl shadow-2xl p-1 flex flex-col gap-1 border border-outline-variant/10">
          <button className="p-3 hover:bg-surface-container-low text-on-surface rounded-lg transition-colors">
            <Icon name="add" />
          </button>
          <button className="p-3 hover:bg-surface-container-low text-on-surface rounded-lg transition-colors">
            <Icon name="remove" />
          </button>
          <div className="h-px bg-outline-variant/10 mx-2" />
          <button className="p-3 hover:bg-surface-container-low text-secondary rounded-lg transition-colors">
            <Icon name="my_location" filled />
          </button>
        </div>

        {/* Layer Toggle */}
        <div className="bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden border border-outline-variant/10">
          <button className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low text-xs font-bold text-on-surface transition-colors">
            <Icon name="layers" className="text-sm" />
            <span>지도 레이어</span>
          </button>
        </div>

        {/* Drawing Mode Indicator */}
        {drawingMode && (
          <div className="bg-primary text-white rounded-xl shadow-2xl px-4 py-3 text-xs font-bold flex items-center gap-2">
            <Icon name="touch_app" className="text-sm" />
            지도를 클릭하여 영역을 선택하세요
          </div>
        )}
      </div>

      {/* Transaction Alert Modal */}
      {showAlertModal && (
        <TransactionAlertModal onClose={() => setShowAlertModal(false)} />
      )}
    </>
  );
}

function TransactionAlertModal({ onClose }: { onClose: () => void }) {
  const [radius, setRadius] = useState('500');
  const [propertyTypes, setPropertyTypes] = useState<string[]>(['apartment', 'villa']);
  const [tradeType, setTradeType] = useState('all');

  function toggleType(type: string) {
    setPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
          <h2 className="text-lg font-bold text-on-surface">주변 거래 알림 설정</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container-high">
            <Icon name="close" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {/* Radius */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
              알림 반경
            </label>
            <div className="flex gap-2">
              {['300', '500', '1000', '2000'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                    radius === r
                      ? 'bg-primary text-white'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {Number(r) >= 1000 ? `${Number(r) / 1000}km` : `${r}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Property Types */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
              매물 유형
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'apartment', label: '아파트' },
                { key: 'villa', label: '빌라' },
                { key: 'officetel', label: '오피스텔' },
                { key: 'house', label: '단독주택' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => toggleType(opt.key)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                    propertyTypes.includes(opt.key)
                      ? 'bg-secondary text-white'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trade Type */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
              거래 유형
            </label>
            <div className="flex gap-2">
              {[
                { key: 'all', label: '전체' },
                { key: 'sale', label: '매매' },
                { key: 'lease', label: '임대' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setTradeType(opt.key)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                    tradeType === opt.key
                      ? 'bg-primary text-white'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-outline-variant/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            취소
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:brightness-125 transition-all"
          >
            알림 설정 저장
          </button>
        </div>
      </div>
    </div>
  );
}
