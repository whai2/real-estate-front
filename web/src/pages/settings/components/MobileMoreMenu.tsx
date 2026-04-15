import { useNavigate } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@/types/auth';

type Props = {
  user: User | null;
  onOpenPurchase?: () => void;
  onOpenPlans?: () => void;
};

type MenuItem = {
  icon: string;
  label: string;
  route?: string;
  action?: string;
};

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: '탐색',
    items: [
      { icon: 'favorite', label: '관심 매물', route: '/favorites' },
      { icon: 'event', label: '현장 캘린더', route: '/open-schedule' },
    ],
  },
  {
    title: '업무 도구',
    items: [
      { icon: 'account_balance', label: '대출 계산기', route: '/tools/loan-calc' },
      { icon: 'calculate', label: '수수료 계산기', route: '/tools/fee-calc' },
    ],
  },
  {
    title: '결제 · 설정',
    items: [
      { icon: 'credit_card', label: '충전 / 구매', action: 'purchase' },
      { icon: 'auto_awesome', label: '이용권 · 요금제', action: 'plans' },
      { icon: 'notifications', label: '알림 설정', route: '/push-settings' },
      { icon: 'history', label: '포인트 내역', route: '/point-history' },
    ],
  },
];

export function MobileMoreMenu({ user, onOpenPurchase, onOpenPlans }: Props) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const subscription = user?.subscription;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="lg:hidden space-y-6">
      {/* Profile Summary */}
      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center overflow-hidden shrink-0">
            {user?.businessCardUrl ? (
              <img src={user.businessCardUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Icon name="person" className="text-on-primary text-2xl" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-on-surface truncate">{user?.name || '로그인 필요'}</h2>
            <p className="text-sm text-on-surface-variant truncate">{user?.agencyName || ''}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase shrink-0">
            {subscription?.plan || '무료'}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/point-history')}
          className="bg-surface-container-lowest rounded-xl p-3 shadow-sm text-center active:scale-95 transition-transform"
        >
          <Icon name="toll" className="text-secondary text-lg mb-1" />
          <p className="text-sm font-extrabold text-on-surface truncate">{subscription?.points?.toLocaleString() || 0}P</p>
          <p className="text-[10px] text-on-surface-variant font-medium">포인트</p>
        </button>
        <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm text-center">
          <Icon name="push_pin" className="text-on-tertiary-container text-lg mb-1" />
          <p className="text-sm font-extrabold text-on-surface">{subscription?.pinCount || 0}회</p>
          <p className="text-[10px] text-on-surface-variant font-medium">상단고정</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm text-center">
          <Icon name="campaign" className="text-secondary text-lg mb-1" />
          <p className="text-sm font-extrabold text-on-surface">{subscription?.pushCount || 0}회</p>
          <p className="text-[10px] text-on-surface-variant font-medium">PUSH</p>
        </div>
      </div>

      {/* Menu Sections */}
      {MENU_SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-outline mb-2 px-1">
            {section.title}
          </p>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden divide-y divide-outline-variant/10">
            {section.items.map((item) => (
              <button
                key={item.route || item.action}
                onClick={() => {
                  if (item.action === 'purchase') onOpenPurchase?.();
                  else if (item.action === 'plans') onOpenPlans?.();
                  else if (item.route) navigate(item.route);
                }}
                className="w-full flex items-center gap-4 px-4 py-3.5 active:bg-surface-container-low transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center">
                  <Icon name={item.icon} className="text-on-surface-variant" />
                </div>
                <span className="flex-1 text-left text-sm font-semibold text-on-surface">{item.label}</span>
                <Icon name="chevron_right" className="text-outline text-sm" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Support & Logout */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden divide-y divide-outline-variant/10">
        <button className="w-full flex items-center gap-4 px-4 py-3.5 active:bg-surface-container-low transition-colors">
          <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center">
            <Icon name="support_agent" className="text-on-surface-variant" />
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-on-surface-variant">고객 센터</span>
          <Icon name="chevron_right" className="text-outline text-sm" />
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 active:bg-surface-container-low transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-error-container/30 flex items-center justify-center">
            <Icon name="logout" className="text-error" />
          </div>
          <span className="flex-1 text-left text-sm font-semibold text-error">로그아웃</span>
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-outline py-2">MAID v1.0</p>
    </div>
  );
}
