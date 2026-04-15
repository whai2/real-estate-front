import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';

type Customer = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  propertyInterests: string[];
  createdAt: string;
  updatedAt: string;
};

export default function CustomerManagePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const fetched = useRef(false);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await apiRequest<{ data: Customer[] }>('/customers');
      setCustomers(res.data);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchCustomers();
  }, [fetchCustomers]);

  const filtered = searchQuery.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          c.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : customers;

  async function handleCreate() {
    if (!form.name.trim() || !form.phone.trim()) return;
    setSaving(true);
    try {
      await apiRequest('/customers', {
        method: 'POST',
        body: form,
      });
      setShowCreate(false);
      setForm({ name: '', phone: '', email: '', notes: '' });
      fetchCustomers();
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('고객 정보를 삭제하시겠습니까?')) return;
    await apiRequest(`/customers/${id}`, { method: 'DELETE' });
    setSelectedCustomer(null);
    fetchCustomers();
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ko-KR');
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-primary font-headline mb-2">
            고객 관리
          </h1>
          <p className="text-on-surface-variant">고객 연락처와 상담 이력을 관리합니다.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:brightness-125 shadow-lg shadow-primary/10 self-start"
        >
          <Icon name="person_add" className="text-xl" />
          고객 추가
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:ring-2 focus:ring-secondary placeholder:text-on-surface-variant/50"
            placeholder="이름, 연락처, 이메일로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Customer List */}
        <div className="lg:col-span-5">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
            <div className="px-6 py-4 bg-surface-container-high">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                고객 목록 ({filtered.length})
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-on-surface-variant">로딩 중...</div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant">
                <Icon name="people" className="text-3xl text-on-surface-variant/30 mb-2" />
                <p className="text-sm">등록된 고객이 없습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/10 max-h-[600px] overflow-y-auto">
                {filtered.map((customer) => (
                  <button
                    key={customer._id}
                    onClick={() => setSelectedCustomer(customer)}
                    className={`w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-surface-bright transition-colors ${
                      selectedCustomer?._id === customer._id ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                      <Icon name="person" className="text-on-surface-variant" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface">{customer.name}</p>
                      <p className="text-xs text-on-surface-variant">{customer.phone}</p>
                    </div>
                    <span className="text-[10px] text-on-surface-variant shrink-0">
                      {formatDate(customer.updatedAt)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customer Detail */}
        <div className="lg:col-span-7">
          {selectedCustomer ? (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
              <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center">
                    <Icon name="person" className="text-2xl text-on-surface-variant" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-on-surface">{selectedCustomer.name}</h2>
                    <p className="text-sm text-on-surface-variant">{selectedCustomer.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(selectedCustomer._id)}
                  className="p-2 hover:bg-error-container/20 rounded-lg text-error"
                >
                  <Icon name="delete" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">연락처</p>
                    <p className="text-sm font-bold text-on-surface">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">이메일</p>
                    <p className="text-sm text-on-surface">{selectedCustomer.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">등록일</p>
                    <p className="text-sm text-on-surface">{formatDate(selectedCustomer.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">관심 매물</p>
                    <p className="text-sm text-on-surface">{selectedCustomer.propertyInterests?.length ?? 0}건</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">메모</p>
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <p className="text-sm text-on-surface whitespace-pre-wrap">
                      {selectedCustomer.notes || '메모가 없습니다.'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">상담 이력</p>
                  <div className="bg-surface-container-low rounded-xl p-6 text-center">
                    <Icon name="history" className="text-2xl text-on-surface-variant/30 mb-2" />
                    <p className="text-xs text-on-surface-variant">상담 이력 기능 준비 중</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 flex items-center justify-center" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <Icon name="contact_page" className="text-4xl text-on-surface-variant/20 mb-3" />
                <p className="text-on-surface-variant text-sm">고객을 선택하면 상세 정보가 표시됩니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Customer Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
              <h2 className="text-lg font-bold text-on-surface">고객 추가</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-surface-container-high">
                <Icon name="close" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                  이름 <span className="text-error">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="고객 이름"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                  연락처 <span className="text-error">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="010-0000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                  이메일
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                  메모
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-none"
                  placeholder="고객 관련 메모"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                onClick={handleCreate}
                disabled={saving || !form.name.trim() || !form.phone.trim()}
                className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:brightness-125 disabled:opacity-50 transition-all"
              >
                {saving ? '저장 중...' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
