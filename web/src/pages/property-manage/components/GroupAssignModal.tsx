import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';
import type { PropertyGroup } from './GroupManager';

type GroupAssignModalProps = {
  open: boolean;
  propertyIds: string[];
  onClose: () => void;
  onAssigned: () => void;
};

export function GroupAssignModal({ open, propertyIds, onClose, onAssigned }: GroupAssignModalProps) {
  const [groups, setGroups] = useState<PropertyGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | ''>('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      apiRequest<{ data: PropertyGroup[] }>('/property-groups')
        .then((res) => setGroups(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open]);

  function handleAssign() {
    setAssigning(true);
    Promise.all(
      propertyIds.map((id) =>
        apiRequest(`/properties/${id}`, {
          method: 'PUT',
          body: { groupId: selectedGroupId || null },
        }),
      ),
    )
      .then(() => {
        onAssigned();
        onClose();
      })
      .catch(() => {})
      .finally(() => setAssigning(false));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
          <h2 className="text-lg font-bold text-on-surface">그룹 지정</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container-high">
            <Icon name="close" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-on-surface-variant mb-4">
            {propertyIds.length}개 매물의 그룹을 변경합니다.
          </p>

          {loading ? (
            <div className="py-4 text-center text-on-surface-variant text-sm">로딩 중...</div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setSelectedGroupId('')}
                className={`w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${
                  selectedGroupId === ''
                    ? 'bg-primary/10 text-primary ring-2 ring-primary/30'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                미지정
              </button>
              {groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => setSelectedGroupId(group._id)}
                  className={`w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${
                    selectedGroupId === group._id
                      ? 'bg-primary/10 text-primary ring-2 ring-primary/30'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  {group.name}
                  <span className="text-xs text-on-surface-variant ml-2">{group.propertyCount}건</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-outline-variant/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleAssign}
            disabled={assigning}
            className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:brightness-125 disabled:opacity-50 transition-all"
          >
            {assigning ? '적용 중...' : '적용'}
          </button>
        </div>
      </div>
    </div>
  );
}
