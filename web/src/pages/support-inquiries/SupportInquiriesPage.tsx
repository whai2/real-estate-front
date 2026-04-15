import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';

type Inquiry = {
  _id: string;
  title: string;
  content: string;
  status: 'pending' | 'answered' | 'closed';
  answer?: string;
  createdAt: string;
  updatedAt: string;
};

const statusMap: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-container', label: '대기중' },
  answered: { bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: '답변완료' },
  closed: { bg: 'bg-surface-container-highest', text: 'text-on-surface', label: '종료' },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function SupportInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const fetched = useRef(false);

  const fetchPage = useCallback((p: number) => {
    setLoading(true);
    apiRequest<{ data: { inquiries: Inquiry[]; total: number } }>(
      `/inquiries/my?page=${p}&limit=20`,
    )
      .then((res) => {
        setInquiries(res.data.inquiries);
        setTotal(res.data.total);
        setPage(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchPage(1);
  }, [fetchPage]);

  function handleSubmit() {
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    apiRequest('/inquiries', { method: 'POST', body: form })
      .then(() => {
        setShowCreate(false);
        setForm({ title: '', content: '' });
        fetchPage(1);
      })
      .catch(() => {})
      .finally(() => setSubmitting(false));
  }

  return (
    <>
      <Link
        to="/settings"
        className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary font-semibold transition-colors mb-4"
      >
        <Icon name="arrow_back" className="text-lg" />
        내 정보로 돌아가기
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tighter text-primary font-headline mb-2">
            문의 게시판
          </h1>
          <p className="text-on-surface-variant text-sm">궁금한 점이나 불편사항을 남겨주세요.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:brightness-125 shadow-lg shadow-primary/10 self-start"
        >
          <Icon name="edit" className="text-xl" />
          문의 작성
        </button>
      </div>

      {/* ── Inquiry List ── */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 px-6 py-4 bg-surface-container-high">
            <div className="col-span-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">상태</div>
            <div className="col-span-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">제목</div>
            <div className="col-span-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">내용</div>
            <div className="col-span-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">등록일</div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-on-surface-variant">로딩 중...</div>
          ) : inquiries.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant">등록된 문의가 없습니다.</div>
          ) : (
            <div className="divide-y divide-outline-variant/10">
              {inquiries.map((inq) => {
                const badge = statusMap[inq.status] ?? statusMap.pending;
                return (
                  <button
                    key={inq._id}
                    onClick={() => setSelectedInquiry(inq)}
                    className="grid grid-cols-12 px-6 py-4 hover:bg-surface-bright transition-colors w-full text-left"
                  >
                    <div className="col-span-1 flex items-center justify-center">
                      <span className={`${badge.bg} ${badge.text} px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="col-span-5 flex items-center">
                      <p className="text-sm font-bold text-on-surface truncate">{inq.title}</p>
                    </div>
                    <div className="col-span-4 flex items-center">
                      <p className="text-sm text-on-surface-variant truncate">{inq.content}</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-xs text-on-surface-variant">{formatDate(inq.createdAt)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Card List */}
        <div className="lg:hidden">
          {loading ? (
            <div className="py-12 text-center text-on-surface-variant text-sm">로딩 중...</div>
          ) : inquiries.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant text-sm">등록된 문의가 없습니다.</div>
          ) : (
            <div className="divide-y divide-outline-variant/10">
              {inquiries.map((inq) => {
                const badge = statusMap[inq.status] ?? statusMap.pending;
                return (
                  <button
                    key={inq._id}
                    onClick={() => setSelectedInquiry(inq)}
                    className="px-4 py-4 flex items-start gap-3 w-full text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      inq.status === 'answered' ? 'bg-secondary-fixed' : 'bg-surface-container-high'
                    }`}>
                      <Icon
                        name={inq.status === 'answered' ? 'mark_email_read' : 'mail'}
                        className={inq.status === 'answered' ? 'text-secondary' : 'text-on-surface-variant'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-on-surface truncate">{inq.title}</p>
                        <span className={`${badge.bg} ${badge.text} px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">{inq.content}</p>
                      <p className="text-[11px] text-on-surface-variant mt-1">{formatDate(inq.createdAt)}</p>
                    </div>
                  </button>
                );
              })}
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

      {/* ── Create Inquiry Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
              <h2 className="text-lg font-bold text-on-surface">문의 작성</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-surface-container-high">
                <Icon name="close" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                  제목
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="문의 제목을 입력하세요"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                  내용
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[160px] resize-none"
                  placeholder="문의 내용을 상세히 작성해주세요"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-outline-variant/10 flex justify-end gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.title.trim() || !form.content.trim()}
                className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:brightness-125 disabled:opacity-50 transition-all"
              >
                {submitting ? '접수 중...' : '문의 접수'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Inquiry Detail Modal ── */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-on-surface">문의 상세</h2>
                {(() => {
                  const badge = statusMap[selectedInquiry.status] ?? statusMap.pending;
                  return (
                    <span className={`${badge.bg} ${badge.text} px-2.5 py-0.5 rounded-full text-[10px] font-bold`}>
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="p-1 rounded-lg hover:bg-surface-container-high">
                <Icon name="close" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">제목</p>
                <p className="text-on-surface font-bold">{selectedInquiry.title}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">내용</p>
                <p className="text-on-surface text-sm whitespace-pre-wrap">{selectedInquiry.content}</p>
              </div>
              <div className="text-xs text-on-surface-variant">
                작성일: {formatDate(selectedInquiry.createdAt)}
              </div>

              {selectedInquiry.answer && (
                <div className="bg-secondary-container/30 rounded-xl p-4 mt-4">
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Icon name="support_agent" className="text-sm" />
                    관리자 답변
                  </p>
                  <p className="text-on-surface text-sm whitespace-pre-wrap">{selectedInquiry.answer}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
