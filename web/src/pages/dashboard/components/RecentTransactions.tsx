import { Icon } from '@/components/ui/Icon';
import type { Transaction } from '@/types/dashboard';

type Props = {
  transactions: Transaction[];
  onSelectProperty?: (tx: Transaction) => void;
};

const riskStyles: Record<string, { border: string; icon: string; iconColor: string }> = {
  danger: { border: 'border-error', icon: 'priority_high', iconColor: 'text-error' },
  caution: {
    border: 'border-on-tertiary-container',
    icon: 'info',
    iconColor: 'text-on-tertiary-container',
  },
  safe: { border: 'border-secondary', icon: 'check_circle', iconColor: 'text-secondary' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  return `${Math.floor(hour / 24)}일 전`;
}

export function RecentTransactions({ transactions, onSelectProperty }: Props) {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-bold text-sm tracking-tight">최근 실거래 내역</h3>
        <button className="text-secondary text-xs font-semibold">전체 보기</button>
      </div>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center text-on-surface-variant text-sm py-8">
            실거래 내역이 없습니다.
          </div>
        ) : (
          transactions.map((tx) => {
            const style = riskStyles[tx.riskLevel] || riskStyles.safe;
            return (
              <button
                key={tx._id}
                onClick={() => onSelectProperty?.(tx)}
                className={`bg-surface-container-lowest p-4 rounded-xl border-l-4 ${style.border} flex items-center gap-4 w-full text-left hover:bg-surface-bright transition-colors`}
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center">
                  <Icon name="home_work" className="text-on-surface-variant" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{tx.title}</p>
                  <p className="text-[10px] text-on-surface-variant">
                    {timeAgo(tx.updatedAt)} &bull; {tx.price}
                  </p>
                </div>
                <Icon name={style.icon} className={style.iconColor} />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
