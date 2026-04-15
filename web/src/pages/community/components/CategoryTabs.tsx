import { Icon } from '@/components/ui/Icon';

const tabs = [
  { label: '전체', value: '' },
  { label: '공지사항', value: 'notice' },
  { label: '구인구직', value: 'jobs' },
  { label: '정보 공유', value: 'info' },
  { label: '자유 토론', value: 'free' },
];

type CategoryTabsProps = {
  active: string;
  onChange: (category: string) => void;
  mineOnly?: boolean;
  onToggleMine?: () => void;
};

export function CategoryTabs({ active, onChange, mineOnly, onToggleMine }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-8 py-3 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
            active === tab.value && !mineOnly
              ? 'bg-primary text-white font-bold'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          {tab.label}
        </button>
      ))}
      <div className="w-px h-6 bg-outline-variant/30 mx-1" />
      <button
        onClick={onToggleMine}
        className={`px-6 py-3 rounded-full font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
          mineOnly
            ? 'bg-secondary text-white font-bold'
            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
        }`}
      >
        <Icon name="person" className="text-sm" />
        내 글
      </button>
    </div>
  );
}
