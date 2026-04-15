import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Transaction } from '@/types/dashboard';

type PropertyDetailPanelProps = {
  property: Transaction;
  onClose: () => void;
};

type Tab = 'summary' | 'price' | 'market';

const tabConfig: { key: Tab; label: string; icon: string }[] = [
  { key: 'summary', label: '한눈 요약', icon: 'summarize' },
  { key: 'price', label: '가격 분석', icon: 'analytics' },
  { key: 'market', label: '시장 환경', icon: 'trending_up' },
];

const riskColors: Record<string, { bg: string; text: string; label: string }> = {
  danger: { bg: 'bg-error-container', text: 'text-error', label: '위험' },
  caution: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-container', label: '주의' },
  safe: { bg: 'bg-secondary-container', text: 'text-secondary', label: '양호' },
};

export function PropertyDetailPanel({ property, onClose }: PropertyDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const risk = riskColors[property.riskLevel] ?? riskColors.safe ?? { bg: '', text: '', label: '' };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-[0_12px_40px_rgba(7,27,59,0.06)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-outline-variant/10 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-on-surface truncate">{property.title}</h3>
            <span className={`${risk.bg} ${risk.text} px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase`}>
              {risk.label}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant truncate">{property.address}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container-high shrink-0 ml-3">
          <Icon name="close" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex p-1 bg-surface-container-low rounded-xl gap-0.5">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Icon name={tab.icon} className="text-sm" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-5">
        {activeTab === 'summary' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">매매가</p>
                <p className="text-lg font-bold text-primary font-headline">{property.price || '-'}</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">위험도</p>
                <p className={`text-lg font-bold font-headline ${risk.text}`}>{risk.label}</p>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">주요 지표</p>
              <div className="space-y-2">
                {[
                  { label: '주변 실거래 비교', value: '분석 필요', icon: 'compare_arrows' },
                  { label: '경쟁 매물 수', value: '데이터 수집 중', icon: 'groups' },
                  { label: '평균 거래 기간', value: '데이터 수집 중', icon: 'schedule' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5">
                    <span className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <Icon name={item.icon} className="text-sm" />
                      {item.label}
                    </span>
                    <span className="text-xs font-bold text-on-surface">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'price' && (
          <div className="space-y-5">
            <div className="bg-surface-container-low rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-3">실거래 비교</p>
              <div className="space-y-3">
                {[
                  { label: '동 기준 평균 매매가', value: '데이터 수집 중' },
                  { label: '300m 반경 평균', value: '데이터 수집 중' },
                  { label: '500m 반경 평균', value: '데이터 수집 중' },
                  { label: '1km 반경 평균', value: '데이터 수집 중' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1">
                    <span className="text-xs text-on-surface-variant">{item.label}</span>
                    <span className="text-xs font-bold text-on-surface">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 text-center">
              <Icon name="bar_chart" className="text-3xl text-on-surface-variant/30 mb-2" />
              <p className="text-xs text-on-surface-variant">가격 추이 차트는 실거래 데이터 연동 후 제공됩니다.</p>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-5">
            <div className="bg-surface-container-low rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-3">지역 시장 현황</p>
              <div className="space-y-3">
                {[
                  { label: '거래량 추이', value: '데이터 수집 중', icon: 'show_chart' },
                  { label: '신규 매물 동향', value: '데이터 수집 중', icon: 'fiber_new' },
                  { label: '가격 변동률', value: '데이터 수집 중', icon: 'percent' },
                  { label: '인구 유입/유출', value: '데이터 수집 중', icon: 'people' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5">
                    <span className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <Icon name={item.icon} className="text-sm" />
                      {item.label}
                    </span>
                    <span className="text-xs font-bold text-on-surface">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
