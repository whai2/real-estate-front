import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';

type NavItem = {
  icon: string;
  label: string;
  to?: string;
  children?: { label: string; to: string }[];
};

const navItems: NavItem[] = [
  { icon: 'home', label: '홈', to: '/' },
  {
    icon: 'explore',
    label: '탐색',
    children: [
      { label: '지도 분석', to: '/map' },
      { label: '관심 매물', to: '/favorites' },
    ],
  },
  { icon: 'domain', label: '매물 관리', to: '/property/manage' },
  { icon: 'notifications', label: '알림 센터', to: '/notifications' },
  { icon: 'groups', label: '커뮤니티', to: '/community' },
  {
    icon: 'construction',
    label: '업무 도구',
    children: [
      { label: '대출 계산기', to: '/tools/loan-calc' },
      { label: '수수료 계산기', to: '/tools/fee-calc' },
      { label: '고객 관리', to: '/tools/customer-manage' },
    ],
  },
  {
    icon: 'support',
    label: '고객센터',
    children: [
      { label: '문의 게시판', to: '/support/inquiries' },
      { label: '실시간 문의', to: '/support/chat' },
    ],
  },
];

export function DesktopSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const [openDropdown, setOpenDropdown] = useState<string | null>(
    navItems.find(
      (item) => item.children?.some((c) => pathname.startsWith(c.to)),
    )?.label ?? null,
  );

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full py-6 w-64 bg-[#031636] border-r border-white/10 z-50">
      <div className="px-6 mb-8">
        <span className="text-xl font-bold text-white tracking-tighter font-headline">
          MAID
        </span>
      </div>

      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          if (item.children) {
            const isOpen = openDropdown === item.label;
            const isChildActive = item.children.some((c) =>
              pathname.startsWith(c.to),
            );

            return (
              <div key={item.label}>
                <button
                  onClick={() =>
                    setOpenDropdown(isOpen ? null : item.label)
                  }
                  className={`w-full mx-2 my-1 px-4 py-3 flex items-center gap-3 rounded-lg transition-all ${
                    isChildActive
                      ? 'bg-[#1A2B4C] text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  style={{ width: 'calc(100% - 16px)' }}
                >
                  <Icon name={item.icon} />
                  <span className="font-label text-sm font-semibold tracking-wider uppercase flex-1 text-left">
                    {item.label}
                  </span>
                  <Icon
                    name="expand_more"
                    className={`text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className="ml-6 overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: isOpen ? `${item.children.length * 44}px` : '0px',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="space-y-0.5 pt-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `mx-2 px-4 py-2.5 flex items-center gap-3 rounded-lg text-sm transition-all ${
                            isActive
                              ? 'bg-white/10 text-white font-bold'
                              : 'text-white/50 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to!}
              className={({ isActive }) =>
                `mx-2 my-1 px-4 py-3 flex items-center gap-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#1A2B4C] text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon name={item.icon} />
              <span className="font-label text-sm font-semibold tracking-wider uppercase">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-auto px-4 py-6 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
            <Icon name="person" className="text-sm text-on-surface-variant" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{user?.name ?? '로그인 필요'}</p>
            <p className="text-white/50 text-xs">{user?.subscription?.points?.toLocaleString() ?? 0} 포인트</p>
          </div>
        </div>

        {/* Subscription & Points Summary */}
        {user && (
          <div className="px-2 mb-4 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/40">잔여일</span>
              <span className="text-white/70 font-bold">
                {user.subscription?.expiresAt
                  ? `${Math.max(0, Math.ceil((new Date(user.subscription.expiresAt).getTime() - Date.now()) / 86400000))}일`
                  : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/40">상단고정</span>
              <span className="text-white/70 font-bold">{user.subscription?.pinCount ?? 0}회</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/40">PUSH</span>
              <span className="text-white/70 font-bold">{user.subscription?.pushCount ?? 0}회</span>
            </div>
          </div>
        )}

        <Button
          className="w-full border border-white/20"
          onClick={() => navigate('/settings')}
        >
          요금제 업그레이드
        </Button>
        <div className="mt-4 space-y-1">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-white/40 hover:text-white flex items-center gap-3 px-2 py-2 text-xs w-full"
          >
            <Icon name="logout" className="text-sm" /> 로그아웃
          </button>
        </div>
      </div>
    </aside>
  );
}
