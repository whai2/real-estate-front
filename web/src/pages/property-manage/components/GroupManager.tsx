import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';

export type PropertyGroup = {
  _id: string;
  name: string;
  propertyCount: number;
};

type GroupManagerProps = {
  open: boolean;
  onClose: () => void;
  onGroupsChange: () => void;
};

export function GroupManager({ open, onClose, onGroupsChange }: GroupManagerProps) {
  const [groups, setGroups] = useState<PropertyGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (open) fetchGroups();
  }, [open]);

  function fetchGroups() {
    setLoading(true);
    apiRequest<{ data: PropertyGroup[] }>('/property-groups')
      .then((res) => setGroups(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function handleCreate() {
    if (!newName.trim()) return;
    apiRequest('/property-groups', { method: 'POST', body: { name: newName.trim() } })
      .then(() => {
        setNewName('');
        fetchGroups();
        onGroupsChange();
      })
      .catch(() => {});
  }

  function handleUpdate(id: string) {
    if (!editName.trim()) return;
    apiRequest(`/property-groups/${id}`, { method: 'PUT', body: { name: editName.trim() } })
      .then(() => {
        setEditingId(null);
        fetchGroups();
        onGroupsChange();
      })
      .catch(() => {});
  }

  function handleDelete(id: string) {
    if (!confirm('그룹을 삭제하면 소속 매물은 미지정으로 변경됩니다.')) return;
    apiRequest(`/property-groups/${id}`, { method: 'DELETE' })
      .then(() => {
        fetchGroups();
        onGroupsChange();
      })
      .catch(() => {});
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
          <h2 className="text-lg font-bold text-on-surface">그룹 관리</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container-high">
            <Icon name="close" />
          </button>
        </div>

        {/* Create new group */}
        <div className="px-6 py-4 border-b border-outline-variant/10">
          <div className="flex gap-2">
            <input
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              placeholder="새 그룹 이름"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:brightness-125 disabled:opacity-50 transition-all"
            >
              추가
            </button>
          </div>
        </div>

        {/* Group list */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-on-surface-variant text-sm">로딩 중...</div>
          ) : groups.length === 0 ? (
            <div className="py-8 text-center text-on-surface-variant text-sm">등록된 그룹이 없습니다.</div>
          ) : (
            <div className="divide-y divide-outline-variant/10">
              {groups.map((group) => (
                <div key={group._id} className="px-6 py-3 flex items-center gap-3">
                  {editingId === group._id ? (
                    <>
                      <input
                        className="flex-1 px-3 py-2 rounded-lg bg-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(group._id)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdate(group._id)}
                        className="p-1.5 rounded-lg hover:bg-surface-container-high text-primary"
                      >
                        <Icon name="check" className="text-lg" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant"
                      >
                        <Icon name="close" className="text-lg" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-on-surface">{group.name}</span>
                        <span className="text-xs text-on-surface-variant ml-2">
                          {group.propertyCount}건
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setEditingId(group._id);
                          setEditName(group.name);
                        }}
                        className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant"
                      >
                        <Icon name="edit" className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDelete(group._id)}
                        className="p-1.5 rounded-lg hover:bg-error-container/20 text-error"
                      >
                        <Icon name="delete" className="text-lg" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-outline-variant/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
