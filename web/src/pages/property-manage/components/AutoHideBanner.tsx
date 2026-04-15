import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

type AutoHideBannerProps = {
  count: number;
};

export function AutoHideBanner({ count }: AutoHideBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || count === 0) return null;

  return (
    <div className="bg-tertiary-fixed border-l-4 border-on-tertiary-container p-4 rounded-xl flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="bg-on-tertiary-container/10 p-2 rounded-full">
          <Icon name="warning" className="text-on-tertiary-container" />
        </div>
        <div>
          <h4 className="font-bold text-on-tertiary-container text-sm">
            시스템 경고: 매물 {count}건 비활성 상태
          </h4>
          <p className="text-on-tertiary-container/80 text-xs">
            해당 매물들은 관리 부재로 인해 48시간 내에 자동 숨김 처리됩니다. 노출을
            유지하려면 업데이트하십시오.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-xs font-bold uppercase tracking-wider text-on-tertiary-container underline underline-offset-4">
          지금 확인하기
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-on-tertiary-container/5 rounded-full"
        >
          <Icon name="close" className="text-sm" />
        </button>
      </div>
    </div>
  );
}
