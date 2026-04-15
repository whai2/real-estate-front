import { useEffect, useState, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';

type AutoRule = {
  _id: string;
  title: string;
  content: string;
  propertyIds: { _id: string; title: string }[];
  isActive: boolean;
  createdAt: string;
};

export function AutoNotifications() {
  const [rules, setRules] = useState<AutoRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<AutoRule | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const fetched = useRef(false);

  function fetchRules() {
    apiRequest<{ data: AutoRule[] }>('/auto-notifications')
      .then((res) => setRules(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchRules();
  }, []);

  async function handleToggle(id: string, isActive: boolean) {
    await apiRequest(`/auto-notifications/${id}`, {
      method: 'PUT',
      body: { isActive: !isActive },
    });
    setRules((prev) =>
      prev.map((r) => (r._id === id ? { ...r, isActive: !isActive } : r)),
    );
  }

  async function handleDelete(id: string) {
    if (!confirm('자동 알림을 삭제하시겠습니까?')) return;
    await apiRequest(`/auto-notifications/${id}`, { method: 'DELETE' });
    setRules((prev) => prev.filter((r) => r._id !== id));
  }

  function openEdit(rule: AutoRule) {
    setEditingRule(rule);
    setEditTitle(rule.title);
    setEditContent(rule.content);
  }

  async function handleSaveEdit() {
    if (!editingRule || !editTitle.trim() || !editContent.trim()) return;
    setSaving(true);
    try {
      await apiRequest(`/auto-notifications/${editingRule._id}`, {
        method: 'PUT',
        body: { title: editTitle, content: editContent },
      });
      setRules((prev) =>
        prev.map((r) =>
          r._id === editingRule._id ? { ...r, title: editTitle, content: editContent } : r,
        ),
      );
      setEditingRule(null);
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-on-surface-variant py-8 text-center">로딩 중...</p>;

  return (
    <>
      {rules.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">
          <Icon name="auto_awesome" className="text-4xl text-on-surface-variant/30 mb-3" />
          <p>설정된 자동 알림이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule._id}
              className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10 flex items-center justify-between group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-secondary' : 'bg-outline-variant'}`}
                  />
                  <h4 className="font-bold text-primary text-sm">{rule.title}</h4>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-1 mb-1">{rule.content}</p>
                <p className="text-[10px] text-on-surface-variant">
                  매물 {rule.propertyIds?.length ?? 0}개 연결
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => openEdit(rule)}
                  className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity"
                  title="수정"
                >
                  <Icon name="edit" className="text-sm" />
                </button>
                <button
                  onClick={() => handleToggle(rule._id, rule.isActive)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    rule.isActive ? 'bg-secondary' : 'bg-outline-variant/30'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-all ${
                      rule.isActive ? 'left-5' : 'left-1'
                    }`}
                  />
                </button>
                <button
                  onClick={() => handleDelete(rule._id)}
                  className="p-2 hover:bg-error-container/20 rounded-lg text-error"
                >
                  <Icon name="delete" className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
              <h2 className="text-lg font-bold text-on-surface">자동 알림 수정</h2>
              <button onClick={() => setEditingRule(null)} className="p-1 rounded-lg hover:bg-surface-container-high">
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
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                  알림 내용
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[120px] resize-none"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">연결된 매물</p>
                <p className="text-xs text-on-surface-variant">
                  {editingRule.propertyIds?.map((p) => p.title).join(', ') || '없음'}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-outline-variant/10 flex justify-end gap-3">
              <button
                onClick={() => setEditingRule(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editTitle.trim() || !editContent.trim()}
                className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:brightness-125 disabled:opacity-50 transition-all"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
