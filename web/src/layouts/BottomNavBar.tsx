import { NavLink } from 'react-router';
import { Icon } from '@/components/ui/Icon';

const items = [
  { icon: 'home', iconFilled: 'home', label: '홈', to: '/' },
  { icon: 'map', iconFilled: 'map', label: '지도', to: '/map' },
  { icon: 'domain', iconFilled: 'domain', label: '매물관리', to: '/property/manage' },
  { icon: 'groups', iconFilled: 'groups', label: '커뮤니티', to: '/community' },
  { icon: 'menu', iconFilled: 'menu', label: '더보기', to: '/settings' },
];

export function BottomNavBar() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 h-20 bg-white border-t border-outline-variant/10 shadow-[0_-4px_20px_rgba(7,27,59,0.04)] z-[70] pb-safe">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-4 py-1.5 transition-all active:scale-90 ${
              isActive
                ? 'text-secondary bg-[#E0E2EC] rounded-2xl'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                name={isActive ? item.iconFilled : item.icon}
                className={isActive ? 'fill' : ''}
              />
              <span className="font-label text-[11px] font-semibold tracking-wide uppercase mt-1">
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
