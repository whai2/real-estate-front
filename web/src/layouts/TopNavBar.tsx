import { useNavigate } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/stores/auth.store';

export function TopNavBar() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <nav className="sticky top-0 z-40 flex justify-between items-center w-full px-6 h-16 bg-surface shadow-[0px_1px_0px_0px_rgba(197,198,207,0.15)]">
      <div className="flex items-center gap-3">
        {/* Profile Circle */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
          {user?.businessCardUrl ? (
            <img
              src={user.businessCardUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon name="person" className="text-on-primary text-sm" />
          )}
        </div>
        <span className="text-xl font-extrabold tracking-tighter text-primary font-headline">
          MAID
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/notifications')}
          className="p-2 hover:bg-surface-container-low rounded-full transition-colors"
        >
          <Icon name="notifications" className="text-primary" />
        </button>
        {/* Desktop only: settings */}
        <button
          onClick={() => navigate('/settings')}
          className="p-2 hover:bg-surface-container-low rounded-full transition-colors"
        >
          <Icon name="account_circle" className="text-primary" />
        </button>
      </div>
    </nav>
  );
}
