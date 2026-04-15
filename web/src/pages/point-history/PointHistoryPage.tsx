import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';

type PointRecord = {
  _id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export default function PointHistoryPage() {
  const [records, setRecords] = useState<PointRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  function fetchPage(p: number) {
    setLoading(true);
    apiRequest<{ data: { records: PointRecord[]; total: number } }>(
      `/auth/point-history?page=${p}&limit=20`,
    )
      .then((res) => {
        setRecords(res.data.records);
        setTotal(res.data.total);
        setPage(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchPage(1);
  }, []);

  return (
    <>
      <Link
        to="/settings"
        className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary font-semibold transition-colors mb-4"
      >
        <Icon name="arrow_back" className="text-lg" />
        내 정보로 돌아가기
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tighter text-primary font-headline mb-2">
          포인트 내역
        </h1>
        <p className="text-on-surface-variant text-sm">포인트 충전 및 사용 이력입니다.</p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
        {/* ── Desktop Table ── */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 px-6 py-4 bg-surface-container-high">
            <div className="col-span-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">내용</div>
            <div className="col-span-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">유형</div>
            <div className="col-span-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">금액</div>
            <div className="col-span-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">날짜</div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-on-surface-variant">로딩 중...</div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant">내역이 없습니다.</div>
          ) : (
            <div className="divide-y divide-outline-variant/10">
              {records.map((r) => (
                <div key={r._id} className="grid grid-cols-12 px-6 py-4 hover:bg-surface-bright transition-colors">
                  <div className="col-span-5">
                    <p className="text-sm font-bold text-primary">{r.description}</p>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <span className="text-xs font-bold text-on-surface-variant uppercase">{r.type}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <span className={`text-sm font-bold ${r.amount > 0 ? 'text-secondary' : 'text-error'}`}>
                      {r.amount > 0 ? '+' : ''}{r.amount.toLocaleString()}P
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center justify-end">
                    <span className="text-xs text-on-surface-variant">{formatDate(r.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Mobile Card List ── */}
        <div className="lg:hidden">
          {loading ? (
            <div className="py-12 text-center text-on-surface-variant text-sm">로딩 중...</div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant text-sm">내역이 없습니다.</div>
          ) : (
            <div className="divide-y divide-outline-variant/10">
              {records.map((r) => (
                <div key={r._id} className="px-4 py-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    r.amount > 0 ? 'bg-secondary-fixed' : 'bg-error-container'
                  }`}>
                    <Icon
                      name={r.amount > 0 ? 'add_circle' : 'remove_circle'}
                      className={r.amount > 0 ? 'text-secondary' : 'text-error'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{r.description}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {r.type} · {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <span className={`text-sm font-extrabold shrink-0 ${r.amount > 0 ? 'text-secondary' : 'text-error'}`}>
                    {r.amount > 0 ? '+' : ''}{r.amount.toLocaleString()}P
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="px-6 py-4 border-t border-outline-variant/10 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => fetchPage(page - 1)}
              className="p-2 rounded-lg hover:bg-surface-container-high disabled:opacity-30"
            >
              <Icon name="chevron_left" />
            </button>
            <span className="text-sm font-bold text-primary px-2">{page}</span>
            <button
              disabled={page * 20 >= total}
              onClick={() => fetchPage(page + 1)}
              className="p-2 rounded-lg hover:bg-surface-container-high disabled:opacity-30"
            >
              <Icon name="chevron_right" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
