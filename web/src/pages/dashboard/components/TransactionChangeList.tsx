import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Transaction } from '@/types/dashboard';

type ChangeFilter = 'all' | 'added' | 'decreased';
type SortOrder = 'newest' | 'oldest';

type Props = {
  transactions: Transaction[];
};

export function TransactionChangeList({ transactions }: Props) {
  const [filter, setFilter] = useState<ChangeFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const sorted = [...transactions].sort((a, b) =>
    sortOrder === 'newest'
      ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  );

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return '방금 전';
    if (min < 60) return `${min}분 전`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour}시간 전`;
    return `${Math.floor(hour / 24)}일 전`;
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">실거래 변화 목록</h3>
        <span className="text-[10px] text-on-surface-variant">
          갱신: {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex p-0.5 bg-surface-container-low rounded-lg gap-0.5 flex-1">
          {([
            { key: 'all' as const, label: '전체' },
            { key: 'added' as const, label: '추가' },
            { key: 'decreased' as const, label: '감소' },
          ]).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`flex-1 py-2 rounded-md text-[11px] font-bold transition-colors ${
                filter === opt.key
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
          className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant"
          title={sortOrder === 'newest' ? '최신순' : '과거순'}
        >
          <Icon name={sortOrder === 'newest' ? 'arrow_downward' : 'arrow_upward'} className="text-sm" />
        </button>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="text-center text-on-surface-variant text-xs py-6">
            변화 내역이 없습니다.
          </div>
        ) : (
          sorted.map((tx) => (
            <div
              key={tx._id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                tx.riskLevel === 'danger' ? 'bg-error-container' : tx.riskLevel === 'caution' ? 'bg-tertiary-fixed' : 'bg-secondary-container'
              }`}>
                <Icon
                  name={tx.riskLevel === 'danger' ? 'trending_down' : tx.riskLevel === 'safe' ? 'trending_up' : 'trending_flat'}
                  className={`text-sm ${tx.riskLevel === 'danger' ? 'text-error' : tx.riskLevel === 'caution' ? 'text-on-tertiary-container' : 'text-secondary'}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">{tx.title}</p>
                <p className="text-[10px] text-on-surface-variant">{tx.address}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-primary">{tx.price}</p>
                <p className="text-[10px] text-on-surface-variant">{timeAgo(tx.updatedAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
