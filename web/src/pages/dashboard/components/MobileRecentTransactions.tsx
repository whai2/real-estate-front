import { Icon } from '@/components/ui/Icon';
import type { Transaction } from '@/types/dashboard';

type Props = {
  transactions: Transaction[];
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

const riskIcons: Record<string, string> = {
  danger: 'warning',
  caution: 'info',
  safe: 'apartment',
};

export function MobileRecentTransactions({ transactions }: Props) {
  if (transactions.length === 0) return null;

  return (
    <section className="pb-8">
      <h2 className="text-xl font-extrabold tracking-tight mb-4 font-headline">최근 실거래 내역</h2>

      <div className="space-y-1">
        {transactions.map((tx) => (
          <div
            key={tx._id}
            className="bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 hover:bg-surface-bright transition-colors cursor-pointer"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0">
              <Icon name={riskIcons[tx.riskLevel] || 'home_work'} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h5 className="font-bold text-on-surface text-sm truncate">{tx.title}</h5>
                <span className="text-xs font-bold text-secondary shrink-0 ml-2">{tx.price}</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5 truncate">{tx.address}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-1.5 py-0.5 bg-surface-container-high rounded text-on-surface-variant">
                  {timeAgo(tx.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
