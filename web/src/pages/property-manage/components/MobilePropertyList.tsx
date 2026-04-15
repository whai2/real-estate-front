import { useNavigate } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import type { Property, StatusCount } from '@/types/property';

type Props = {
  properties: Property[];
  statusCounts: StatusCount[];
  total: number;
  activeFilter: string;
  onFilterChange: (status: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
};

const FILTER_CHIPS = [
  { label: '전체', status: '' },
  { label: '공개 중', status: 'active' },
  { label: '거래 완료', status: 'completed' },
  { label: '검토 중', status: 'hidden' },
];

const statusBadgeMap: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-secondary-container', text: 'text-white', label: '공개 중' },
  hidden: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-container', label: '검토 중' },
  completed: { bg: 'bg-primary-container/80 backdrop-blur-md', text: 'text-white', label: '거래 완료' },
  autoHide: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-container', label: '업데이트 필요' },
  deleted: { bg: 'bg-error-container', text: 'text-error', label: '삭제됨' },
};

function formatPrice(trades: Property['trades']): string {
  if (!trades?.[0]) return '-';
  const trade = trades[0];
  if (trade.price) {
    const billions = trade.price / 100000000;
    const remainder = (trade.price % 100000000) / 10000;
    if (billions >= 1) {
      return remainder > 0
        ? `${Math.floor(billions)}억 ${remainder.toLocaleString()}`
        : `${Math.floor(billions)}억`;
    }
    return `${(trade.price / 10000).toLocaleString()}만`;
  }
  if (trade.deposit && trade.monthlyRent) {
    return `${(trade.deposit / 10000).toLocaleString()}/${trade.monthlyRent.toLocaleString()}`;
  }
  return '-';
}

function formatTradeType(trades: Property['trades']): string {
  if (!trades?.[0]) return '';
  const map: Record<string, string> = { sale: '매매', jeonse: '전세', monthly: '월세', investment: '투자' };
  return map[trades[0].type] || '';
}

function getTypeLabel(propertyType: string): string {
  const map: Record<string, string> = {
    apartment: '아파트',
    villa: '빌라',
    officetel: '오피스텔',
    house: '단독주택',
    building: '빌딩',
  };
  return map[propertyType] || propertyType;
}

export function MobilePropertyList({
  properties,
  statusCounts,
  total,
  activeFilter,
  onFilterChange,
}: Props) {
  const navigate = useNavigate();

  function getCount(status: string): number {
    if (status === '') return total;
    return statusCounts.find((c) => c._id === status)?.count ?? 0;
  }
  void getCount;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title (non-sticky) */}
      <h1 className="text-2xl font-extrabold tracking-tighter text-primary">매물 관리</h1>

      {/* Action Buttons */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => navigate('/property/register')}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap shadow-lg shadow-primary/10 active:scale-95 transition-transform"
        >
          <Icon name="add" className="text-lg" />
          신규 매물
        </button>
        <button
          onClick={() => navigate('/property/open-site-register')}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap shadow-lg shadow-primary/10 active:scale-95 transition-transform"
        >
          <Icon name="domain_add" className="text-lg" />
          현장 등록
        </button>
        <button
          onClick={() => navigate('/open-schedule')}
          className="flex items-center gap-1.5 bg-surface-container-low text-on-surface px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap active:scale-95 transition-transform"
        >
          <Icon name="calendar_month" className="text-lg" />
          캘린더
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.status}
              onClick={() => onFilterChange(chip.status)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                activeFilter === chip.status
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {chip.label}
            </button>
          ))}
      </div>

      {/* Property Cards */}
      {properties.length === 0 ? (
        <div className="text-center py-16">
          <Icon name="domain" className="text-5xl text-outline mb-3" />
          <p className="text-on-surface-variant text-sm">등록된 매물이 없습니다.</p>
        </div>
      ) : (
        properties.map((prop) => {
          const badge = statusBadgeMap[prop.status] || statusBadgeMap.active || { bg: '', text: '', label: '' };
          const isCompleted = prop.status === 'completed';
          const tradeType = formatTradeType(prop.trades);
          const typeLabel = getTypeLabel(prop.propertyType);

          return (
            <div
              key={prop._id}
              className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(7,27,59,0.04)] active:scale-[0.98] transition-transform"
            >
              {/* Image */}
              <div className={`relative h-56 w-full ${isCompleted ? 'grayscale-[30%]' : ''}`}>
                {prop.photos?.[0] ? (
                  <img
                    src={prop.photos[0]}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container flex items-center justify-center">
                    <Icon name="image" className="text-5xl text-outline/40" />
                  </div>
                )}

                {/* Completed overlay */}
                {isCompleted && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="px-4 py-2 rounded-full bg-primary-container/80 backdrop-blur-md text-white text-sm font-bold border border-white/20">
                      거래 완료
                    </span>
                  </div>
                )}

                {/* Status badge (non-completed) */}
                {!isCompleted && (
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full ${badge.bg} ${badge.text} text-[11px] font-bold uppercase tracking-wider`}>
                      {badge.label}
                    </span>
                  </div>
                )}

                {/* More button */}
                <button className="absolute top-4 right-4 w-10 h-10 rounded-full glass-effect flex items-center justify-center">
                  <Icon name="more_vert" className="text-primary text-xl" />
                </button>
              </div>

              {/* Info */}
              <div className={`p-5 ${isCompleted ? 'opacity-80' : ''}`}>
                <div className="flex flex-col gap-1 mb-4">
                  <p className="text-xs font-bold text-on-primary-container tracking-wider uppercase">
                    {typeLabel}{tradeType ? ` · ${tradeType}` : ''}
                  </p>
                  <h2 className="text-xl font-bold text-primary tracking-tight">{prop.title}</h2>
                  <p className="text-sm text-on-surface-variant flex items-center gap-1">
                    <Icon name="location_on" className="text-sm" />
                    {prop.address}
                  </p>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs text-outline font-medium">
                      {isCompleted ? '거래가' : '희망 가격'}
                    </span>
                    <span className="text-2xl font-extrabold text-primary tracking-tighter">
                      {formatPrice(prop.trades)}
                    </span>
                  </div>
                  {prop.riskLevel && (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      prop.riskLevel === 'danger'
                        ? 'text-error bg-error-container'
                        : prop.riskLevel === 'caution'
                          ? 'text-on-tertiary-container bg-tertiary-fixed'
                          : 'text-secondary bg-secondary-fixed'
                    }`}>
                      {prop.riskLevel === 'danger' ? '서류 보완 필요' : prop.riskLevel === 'caution' ? '주의' : '안전'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
