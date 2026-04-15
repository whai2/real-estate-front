import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';

export function SendNotification() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sentCount: number; failedCount: number } | null>(null);

  async function handleSend() {
    if (!title || !content) return;
    setSending(true);
    setResult(null);
    try {
      const res = await apiRequest<{ data: { sentCount: number; failedCount: number } }>(
        '/notifications',
        { method: 'POST', body: { title, content } },
      );
      setResult({ sentCount: res.data.sentCount, failedCount: res.data.failedCount });
      setTitle('');
      setContent('');
    } catch {
      // error
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">
            알림 제목
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 강남역 신규 매물 안내"
            className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3.5 text-sm focus:ring-2 focus:ring-secondary"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface/60">
            알림 내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="알림 내용을 입력하세요..."
            rows={5}
            className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary resize-none"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={sending || !title || !content}
          className="px-8 py-3 bg-primary text-white font-bold rounded-lg disabled:opacity-40 flex items-center gap-2"
        >
          <Icon name="send" className="text-sm" />
          {sending ? '발송 중...' : 'PUSH 알림 발송'}
        </button>
      </div>

      {result && (
        <div className="bg-secondary-fixed p-4 rounded-xl flex items-center gap-3">
          <Icon name="check_circle" className="text-secondary" filled />
          <span className="text-sm font-bold text-on-secondary-fixed">
            발송 완료: 성공 {result.sentCount}건 / 실패 {result.failedCount}건
          </span>
        </div>
      )}
    </div>
  );
}
