import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';
import type { User } from '@/types/auth';

const options = [
  { type: 'pin', icon: 'push_pin', label: '상단고정', counts: [5, 15, 30], prices: [15000, 30000, 50000] },
  { type: 'push', icon: 'notifications', label: 'PUSH 알림', counts: [5, 15, 30], prices: [15000, 30000, 50000] },
  { type: 'package', icon: 'inventory_2', label: '패키지 (고정+PUSH)', counts: [5, 15, 30], prices: [25000, 50000, 100000] },
] as const;

type NotificationOptionsProps = {
  user: User | null;
  onPurchased: () => void;
};

export function NotificationOptions({ user, onPurchased }: NotificationOptionsProps) {
  const points = user?.subscription?.points ?? 0;

  async function handlePurchase(type: string, count: number, price: number) {
    if (points < price) {
      alert(`포인트가 부족합니다. (필요: ${price.toLocaleString()}P / 보유: ${points.toLocaleString()}P)`);
      return;
    }
    if (!confirm(`${type === 'package' ? '패키지' : type === 'pin' ? '상단고정' : 'PUSH'} ${count}회를 ${price.toLocaleString()}P로 구매하시겠습니까?`)) return;

    try {
      await apiRequest('/purchase/notification-option', {
        method: 'POST',
        body: { type, count },
      });
      onPurchased();
    } catch {
      // error
    }
  }

  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-xl font-bold text-primary font-headline">알림 옵션 구매</h3>
        <div className="h-px flex-1 bg-outline-variant/20" />
      </div>
      <div className="space-y-6">
        {options.map((opt) => (
          <div key={opt.type} className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-6">
            <div className="flex items-center gap-3 mb-5">
              <Icon name={opt.icon} className="text-secondary text-xl" />
              <h4 className="font-bold text-primary">{opt.label}</h4>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {opt.counts.map((count, i) => {
                const price = opt.prices[i]!;
                return (
                  <div
                    key={count}
                    className="bg-surface-container-low rounded-lg p-4 text-center hover:bg-surface-container-high transition-colors"
                  >
                    <p className="text-2xl font-extrabold text-primary mb-1">{count}회</p>
                    <p className="text-sm font-bold text-secondary mb-3">
                      {price.toLocaleString()}P
                    </p>
                    <button
                      onClick={() => handlePurchase(opt.type, count, price)}
                      className="w-full py-2 bg-surface-container-high hover:bg-secondary hover:text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      구매하기
                    </button>
                  </div>
                );
              })}
            </div>
            {opt.type === 'package' && (
              <p className="text-[10px] text-on-surface-variant mt-3">
                * 패키지 30회 구매 시 60일 이용권 보너스 포함
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
