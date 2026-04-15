import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

const FILTER_CHIPS = ['매매/전세', '아파트/오피스텔', '가격대', '면적'];

type Props = {
  onSearch?: (keyword: string) => void;
  onFilterOpen?: () => void;
  locationLabel?: string;
};

export function MobileMapSearch({ onSearch, onFilterOpen, locationLabel }: Props) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(keyword);
  };

  return (
    <>
      {/* Floating Search Header - pointer-events pass through to map */}
      <header className="w-full bg-transparent px-4 pt-4 pointer-events-none">
        <div className="flex flex-col gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full pointer-events-auto">
            <div className="flex-1 flex items-center bg-surface-container-lowest shadow-[0_12px_40px_rgba(7,27,59,0.08)] rounded-xl px-4 py-3 border border-outline-variant/10">
              <Icon name="search" className="text-on-surface-variant mr-3" />
              <input
                className="bg-transparent border-none outline-none w-full text-on-surface placeholder:text-outline text-sm font-medium"
                placeholder="지역, 단지명, 학교명 검색"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={onFilterOpen}
              className="bg-primary text-on-primary w-12 h-12 flex items-center justify-center rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              <Icon name="tune" />
            </button>
          </form>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide pointer-events-auto">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip}
                className="flex-none bg-surface-container-lowest border border-outline-variant/20 px-4 py-2 rounded-full text-xs font-semibold text-on-surface whitespace-nowrap shadow-sm active:scale-95 transition-transform"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Location Badge */}
      {locationLabel && (
        <div className="mt-2 ml-4 pointer-events-auto inline-block">
          <div className="glass-panel rounded-full px-3 py-1.5 border border-white/40 shadow-sm flex items-center gap-1.5">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-[11px] font-bold text-on-surface">{locationLabel}</span>
          </div>
        </div>
      )}
    </>
  );
}
