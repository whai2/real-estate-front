import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import type { User } from '@/types/auth';

type PointsSectionProps = {
  user: User | null;
};

export function PointsSection({ user }: PointsSectionProps) {
  const points = user?.subscription?.points ?? 0;
  const pin = user?.subscription?.pinCount ?? 0;
  const push = user?.subscription?.pushCount ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Balance */}
      <div className="bg-surface-container-low rounded-xl p-8 border-l-4 border-secondary flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            보유 포인트
          </p>
          <h4 className="text-4xl font-extrabold text-primary tracking-tighter">
            {points.toLocaleString()}
            <span className="text-lg font-bold text-secondary ml-1">P</span>
          </h4>
        </div>
        <Link
          to="/point-history"
          className="text-[10px] font-bold text-secondary hover:underline mt-3"
        >
          내역 보기 →
        </Link>
      </div>

      {/* Pin Count */}
      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="push_pin" className="text-on-tertiary-container text-lg" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            상단고정 잔여
          </p>
        </div>
        <h4 className="text-4xl font-extrabold text-primary tracking-tighter">
          {pin}<span className="text-lg font-bold text-on-surface-variant ml-1">회</span>
        </h4>
      </div>

      {/* Push Count */}
      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="notifications" className="text-secondary text-lg" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            PUSH 알림 잔여
          </p>
        </div>
        <h4 className="text-4xl font-extrabold text-primary tracking-tighter">
          {push}<span className="text-lg font-bold text-on-surface-variant ml-1">회</span>
        </h4>
      </div>
    </div>
  );
}
