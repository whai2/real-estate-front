import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/stores/auth.store';
import type { Comment } from '@/types/comment';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const d = Math.floor(hr / 24);
  if (d < 7) return d === 1 ? '어제' : `${d}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

type CommentSectionProps = {
  comments: Comment[];
  onSubmit: (content: string) => Promise<void>;
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
};

export function CommentSection({ comments, onSubmit, onEdit, onDelete }: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const userId = useAuthStore((s) => s.user?._id);

  async function handleSubmit() {
    if (!content.trim()) return;
    setSubmitting(true);
    await onSubmit(content);
    setContent('');
    setSubmitting(false);
  }

  async function handleEdit(commentId: string) {
    if (!editContent.trim() || !onEdit) return;
    await onEdit(commentId, editContent);
    setEditingId(null);
  }

  async function handleDelete(commentId: string) {
    if (!onDelete || !confirm('댓글을 삭제하시겠습니까?')) return;
    await onDelete(commentId);
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold font-headline text-primary">
        댓글 {comments.length}개
      </h3>

      {/* Write Comment */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-5">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요..."
          rows={3}
          className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary resize-none"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg disabled:opacity-40 transition-opacity"
          >
            {submitting ? '등록 중...' : '댓글 등록'}
          </button>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-1">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant text-sm">
            첫 번째 댓글을 작성해보세요.
          </div>
        ) : (
          comments.map((c) => {
            const isOwner = userId === c.userId?._id;
            const isEditing = editingId === c._id;

            return (
              <div
                key={c._id}
                className="bg-surface-container-lowest rounded-xl px-6 py-5 border border-outline-variant/5 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                    <Icon name="person" className="text-sm text-on-surface-variant" />
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-bold text-primary">
                      {c.userId?.name ?? '익명'}
                    </span>
                    <span className="text-[10px] text-outline">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  {isOwner && !isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingId(c._id);
                          setEditContent(c.content);
                        }}
                        className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant"
                        title="수정"
                      >
                        <Icon name="edit" className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-1.5 rounded-lg hover:bg-error-container/20 text-error"
                        title="삭제"
                      >
                        <Icon name="delete" className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="pl-11 space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleEdit(c._id)}
                        className="px-4 py-1.5 text-xs font-bold bg-primary text-white rounded-lg"
                      >
                        수정
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-on-surface leading-relaxed pl-11">
                    {c.content}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
