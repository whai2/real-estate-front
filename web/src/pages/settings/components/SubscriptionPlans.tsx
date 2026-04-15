import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';
import type { User } from '@/types/auth';

const plans = [
  { days: 30, price: 12000, discount: 0, label: '30일 이용권' },
  { days: 90, price: 30000, discount: 17, label: '90일 이용권' },
  { days: 180, price: 50000, discount: 31, label: '180일 이용권' },
  { days: 400, price: 100000, discount: 38, label: '400일 이용권' },
];

type SubscriptionPlansProps = {
  user: User | null;
  onPurchased: () => void;
};

export function SubscriptionPlans({ user, onPurchased }: SubscriptionPlansProps) {
  const currentPlan = user?.subscription?.plan ?? '';
  const points = user?.subscription?.points ?? 0;

  async function handlePurchase(days: number, price: number) {
    if (points < price) {
      alert(`포인트가 부족합니다. (필요: ${price.toLocaleString()}P / 보유: ${points.toLocaleString()}P)`);
      return;
    }
    if (!confirm(`${days}일 이용권을 ${price.toLocaleString()}P로 구매하시겠습니까?`)) return;

    try {
      await apiRequest('/purchase/subscription', {
        method: 'POST',
        body: { days },
      });
      onPurchased();
    } catch {
      // error handled by api-client
    }
  }

  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-xl font-bold text-primary font-headline">이용권 구매</h3>
        <div className="h-px flex-1 bg-outline-variant/20" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrent = currentPlan === `${plan.days}day`;

          return (
            <div
              key={plan.days}
              className={`rounded-2xl p-6 flex flex-col ${
                isCurrent
                  ? 'bg-gradient-to-br from-primary to-primary-container text-white relative overflow-hidden'
                  : 'bg-surface-container-low'
              }`}
            >
              {isCurrent && (
                <div className="absolute -right-8 -top-8 h-28 w-28 bg-white/5 rounded-full blur-2xl" />
              )}
              <div className="relative z-10 flex-1">
                {isCurrent && (
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-black px-2 py-0.5 rounded-full inline-block mb-2">
                    현재 이용 중
                  </span>
                )}
                <h4 className={`text-lg font-bold mb-1 ${isCurrent ? 'text-white' : 'text-primary'}`}>
                  {plan.label}
                </h4>
                <p className={`text-2xl font-extrabold mb-1 ${isCurrent ? 'text-white' : 'text-primary'}`}>
                  {plan.price.toLocaleString()}P
                </p>
                {plan.discount > 0 && (
                  <p className={`text-xs font-bold ${isCurrent ? 'text-blue-300' : 'text-secondary'}`}>
                    {plan.discount}% 할인
                  </p>
                )}
                <ul className={`mt-4 space-y-2 ${isCurrent ? '' : ''}`}>
                  <li className={`flex items-center gap-2 text-xs ${isCurrent ? 'text-blue-200' : 'text-on-surface-variant'}`}>
                    <Icon name="check_circle" className={`text-sm ${isCurrent ? 'text-blue-400' : 'text-secondary'}`} filled />
                    매물 등록 및 관리
                  </li>
                  <li className={`flex items-center gap-2 text-xs ${isCurrent ? 'text-blue-200' : 'text-on-surface-variant'}`}>
                    <Icon name="check_circle" className={`text-sm ${isCurrent ? 'text-blue-400' : 'text-secondary'}`} filled />
                    지도 탐색 / 커뮤니티
                  </li>
                </ul>
              </div>
              <button
                onClick={() => !isCurrent && handlePurchase(plan.days, plan.price)}
                disabled={isCurrent}
                className={`w-full py-3 rounded-xl font-bold text-sm mt-6 transition-all relative z-10 ${
                  isCurrent
                    ? 'bg-white/20 text-white/60 cursor-default'
                    : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {isCurrent ? '이용 중' : '구매하기'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
