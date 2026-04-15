import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';

type MemoModalProps = {
  open: boolean;
  propertyId: string;
  propertyTitle: string;
  initialMemo: string;
  onClose: () => void;
  onSaved: () => void;
};

export function MemoModal({ open, propertyId, propertyTitle, initialMemo, onClose, onSaved }: MemoModalProps) {
  const [memo, setMemo] = useState(initialMemo);
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    apiRequest(`/properties/${propertyId}`, {
      method: 'PUT',
      body: { memo },
    })
      .then(() => {
        onSaved();
        onClose();
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
          <div>
            <h2 className="text-lg font-bold text-on-surface">관리 메모</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">{propertyTitle}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container-high">
            <Icon name="close" />
          </button>
        </div>

        <div className="px-6 py-5">
          <textarea
            className="w-full px-4 py-3 rounded-xl bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[180px] resize-none text-sm"
            placeholder="매물 관리 메모를 입력하세요 (내부 참고용)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        <div className="px-6 py-4 border-t border-outline-variant/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:brightness-125 disabled:opacity-50 transition-all"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
