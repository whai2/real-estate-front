import type { StatusCount } from '@/types/property';

type FilterTabsProps = {
  statusCounts: StatusCount[];
  total: number;
  activeFilter: string;
  onFilterChange: (status: string) => void;
};

const tabs = [
  { label: '전체', status: '' },
  { label: '공개 중', status: 'active' },
  { label: '일반', status: 'general' },
  { label: '거래 완료', status: 'completed' },
  { label: '숨김', status: 'hidden' },
];

export function FilterTabs({
  statusCounts,
  total,
  activeFilter,
  onFilterChange,
}: FilterTabsProps) {
  function getCount(status: string): number {
    if (status === '') return total;
    return statusCounts.find((c) => c._id === status)?.count ?? 0;
  }

  return (
    <div className="flex items-center justify-between bg-surface-container-low p-1 rounded-2xl w-full">
      <div className="flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.status}
            onClick={() => onFilterChange(tab.status)}
            className={`px-6 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
              activeFilter === tab.status
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {tab.label} ({getCount(tab.status)})
          </button>
        ))}
      </div>
      <div className="hidden md:flex items-center gap-2 px-4">
        <span className="text-xs font-label uppercase tracking-[0.05em] text-on-surface-variant font-bold">
          정렬 기준:
        </span>
        <select className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer">
          <option>최근 업데이트순</option>
          <option>가격: 높은순</option>
          <option>진행 상태순</option>
        </select>
      </div>
    </div>
  );
}
