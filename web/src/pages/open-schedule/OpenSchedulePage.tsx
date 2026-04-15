import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';

type OpenSite = {
  _id: string;
  name: string;
  address: string;
  propertyType: string;
  scheduledDate?: string;
  surveyStatus?: string;
  createdAt: string;
};

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const surveyOptions: { key: string; label: string; color: string }[] = [
  { key: 'pending', label: '답사 예정', color: 'bg-tertiary-fixed text-on-tertiary-container' },
  { key: 'completed', label: '답사 완료', color: 'bg-secondary-container text-on-secondary-container' },
  { key: 'contracted', label: '계약 완료', color: 'bg-primary/10 text-primary' },
  { key: 'cancelled', label: '취소', color: 'bg-error-container text-error' },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function OpenSchedulePage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sites, setSites] = useState<OpenSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState<OpenSite | null>(null);
  const fetched = useRef(false);

  const fetchSites = useCallback(() => {
    setLoading(true);
    apiRequest<{ data: OpenSite[] }>('/open-sites')
      .then((res) => setSites(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchSites();
  }, [fetchSites]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) return sites;
    const q = searchQuery.toLowerCase();
    return sites.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q),
    );
  }, [sites, searchQuery]);

  const sitesByDate = useMemo(() => {
    const map: Record<string, OpenSite[]> = {};
    filteredSites.forEach((s) => {
      const d = s.scheduledDate ?? s.createdAt;
      const date = new Date(d);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const key = date.getDate().toString();
        if (!map[key]) map[key] = [];
        map[key]!.push(s);
      }
    });
    return map;
  }, [filteredSites, year, month]);

  function prevMonth() {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  }

  async function handleStatusChange(siteId: string, status: string) {
    await apiRequest(`/open-sites/${siteId}`, {
      method: 'PUT',
      body: { surveyStatus: status },
    });
    fetchSites();
    setSelectedSite((prev) => (prev ? { ...prev, surveyStatus: status } : null));
  }

  return (
    <>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-primary font-headline mb-2">
            오픈현장 캘린더
          </h1>
          <p className="text-on-surface-variant">월별 오픈현장 일정을 확인합니다.</p>
        </div>
        <button
          onClick={() => window.location.href = '/property/open-site-register'}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold"
        >
          <Icon name="add" className="text-xl" />
          현장 등록
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:ring-2 focus:ring-secondary placeholder:text-on-surface-variant/50"
            placeholder="현장명 또는 지역명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-surface-container-high"
            >
              <Icon name="close" className="text-sm text-on-surface-variant" />
            </button>
          )}
        </div>
      </div>

      {/* Month Nav */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <button onClick={prevMonth} className="p-2 hover:bg-surface-container-high rounded-lg">
          <Icon name="chevron_left" />
        </button>
        <h2 className="text-2xl font-bold text-primary font-headline">
          {year}년 {month + 1}월
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-surface-container-high rounded-lg">
          <Icon name="chevron_right" />
        </button>
      </div>

      {loading ? (
        <p className="text-center py-12 text-on-surface-variant">로딩 중...</p>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-7 bg-surface-container-high">
            {DAYS.map((d) => (
              <div key={d} className="py-3 text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-28 border-b border-r border-outline-variant/5" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const daySites = sitesByDate[day.toString()] ?? [];
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();

              return (
                <div
                  key={day}
                  className="h-28 border-b border-r border-outline-variant/5 p-2 hover:bg-surface-bright transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold ${isToday ? 'w-7 h-7 bg-secondary text-white rounded-full flex items-center justify-center' : 'text-primary'}`}>
                      {day}
                    </span>
                    {daySites.length > 0 && (
                      <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {daySites.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {daySites.slice(0, 2).map((s) => (
                      <button
                        key={s._id}
                        onClick={() => setSelectedSite(s)}
                        className="w-full text-[10px] text-primary font-medium truncate bg-surface-container-low rounded px-1 py-0.5 text-left hover:bg-surface-container-high transition-colors"
                      >
                        {s.name}
                      </button>
                    ))}
                    {daySites.length > 2 && (
                      <span className="text-[9px] text-on-surface-variant">+{daySites.length - 2}건</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Site Detail Modal */}
      {selectedSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
              <h2 className="text-lg font-bold text-on-surface">{selectedSite.name}</h2>
              <button onClick={() => setSelectedSite(null)} className="p-1 rounded-lg hover:bg-surface-container-high">
                <Icon name="close" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">주소</p>
                <p className="text-sm text-on-surface">{selectedSite.address}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">매물 유형</p>
                <p className="text-sm text-on-surface">{selectedSite.propertyType}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">답사 상태</p>
                <div className="flex flex-wrap gap-2">
                  {surveyOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleStatusChange(selectedSite._id, opt.key)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        (selectedSite.surveyStatus ?? 'pending') === opt.key
                          ? `${opt.color} ring-2 ring-offset-1 ring-current`
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-outline-variant/10 flex justify-end">
              <button
                onClick={() => setSelectedSite(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
