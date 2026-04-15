import { Icon } from '@/components/ui/Icon';
import type { DashboardSummary } from '@/types/dashboard';

type RiskLevel = 'all' | 'danger' | 'caution' | 'safe';

type RiskFilterTabsProps = {
  summary: DashboardSummary | null;
  activeFilter: RiskLevel;
  onFilterChange: (level: RiskLevel) => void;
};

const tabs: { key: RiskLevel; label: string; icon: string; color: string; countKey?: keyof DashboardSummary }[] = [
  { key: 'all', label: '전체', icon: 'dashboard', color: 'text-primary' },
  { key: 'danger', label: '위험', icon: 'warning', color: 'text-error', countKey: 'danger' },
  { key: 'caution', label: '주의', icon: 'report_problem', color: 'text-on-tertiary-container', countKey: 'caution' },
  { key: 'safe', label: '안전', icon: 'verified_user', color: 'text-secondary', countKey: 'safe' },
];

export function RiskFilterTabs({ summary, activeFilter, onFilterChange }: RiskFilterTabsProps) {
  return (
    <div className="flex p-1.5 bg-surface-container-low rounded-2xl gap-1">
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.key;
        const count = tab.countKey ? summary?.[tab.countKey] ?? 0 : summary?.total ?? 0;

        return (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              isActive
                ? 'bg-surface-container-lowest shadow-sm text-on-surface'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50'
            }`}
          >
            <Icon name={tab.icon} className={`text-lg ${isActive ? tab.color : ''}`} />
            <span>{tab.label}</span>
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isActive
                  ? `${tab.key === 'danger' ? 'bg-error-container text-error' : tab.key === 'caution' ? 'bg-tertiary-fixed text-on-tertiary-container' : tab.key === 'safe' ? 'bg-secondary-container text-secondary' : 'bg-primary/10 text-primary'}`
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
