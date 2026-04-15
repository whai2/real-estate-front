import { useNavigate } from 'react-router';
import { Icon } from '@/components/ui/Icon';

type PageHeaderProps = {
  onBatchRefresh: () => void;
  onOpenGroupManager?: () => void;
  selectedIds?: string[];
  onOpenGroupAssign?: (ids: string[]) => void;
};

export function PageHeader({ onBatchRefresh, onOpenGroupManager, selectedIds = [], onOpenGroupAssign }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface mb-2">
          부동산 매물 관리
        </h1>
        <p className="text-on-surface-variant font-body">
          고정밀 관리 도구를 통해 실시간으로 부동산 포트폴리오를 운영하고 모니터링하십시오.
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {selectedIds.length > 0 && (
          <button
            onClick={() => onOpenGroupAssign?.(selectedIds)}
            className="flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:brightness-125"
          >
            <Icon name="folder" className="text-xl" />
            그룹 지정 ({selectedIds.length})
          </button>
        )}
        <button
          onClick={onOpenGroupManager}
          className="flex items-center gap-2 bg-surface-container-low text-on-surface px-5 py-2.5 rounded-xl font-bold transition-all hover:bg-surface-container-high"
        >
          <Icon name="folder_managed" className="text-xl" />
          그룹 관리
        </button>
        <button
          onClick={onBatchRefresh}
          className="flex items-center gap-2 bg-surface-container-low text-on-surface px-5 py-2.5 rounded-xl font-bold transition-all hover:bg-surface-container-high"
        >
          <Icon name="refresh" className="text-xl" />
          일괄 업데이트
        </button>
        <button
          onClick={() => navigate('/property/register')}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:brightness-125 shadow-lg shadow-primary/10"
        >
          <Icon name="add" className="text-xl" />
          신규 매물 등록
        </button>
        <button
          onClick={() => navigate('/property/open-site-register')}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:brightness-125 shadow-lg shadow-primary/10"
        >
          <Icon name="domain_add" className="text-xl" />
          현장 매물 등록
        </button>
        <button
          onClick={() => navigate('/open-schedule')}
          className="flex items-center gap-2 bg-surface-container-low text-on-surface px-5 py-2.5 rounded-xl font-bold transition-all hover:bg-surface-container-high"
        >
          <Icon name="calendar_month" className="text-xl" />
          현장 캘린더
        </button>
      </div>
    </div>
  );
}
