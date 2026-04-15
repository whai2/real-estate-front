import { useEffect, useState, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';

type Notification = {
  _id: string;
  title: string;
  content: string;
  sentCount: number;
  failedCount: number;
  sentAt?: string;
  createdAt: string;
  senderId?: { name: string };
};

export function NotificationHistory() {
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    apiRequest<{ data: { notifications: Notification[] } }>('/notifications?limit=50')
      .then((res) => setList(res.data.notifications))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await apiRequest(`/notifications/${id}`, { method: 'DELETE' });
    setList((prev) => prev.filter((n) => n._id !== id));
  }

  if (loading) return <p className="text-on-surface-variant py-8 text-center">로딩 중...</p>;

  return list.length === 0 ? (
    <div className="text-center py-16 text-on-surface-variant">
      <Icon name="notifications_off" className="text-4xl text-on-surface-variant/30 mb-3" />
      <p>발송 내역이 없습니다.</p>
    </div>
  ) : (
    <div className="space-y-3">
      {list.map((n) => (
        <div
          key={n._id}
          className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10 flex items-start justify-between"
        >
          <div className="flex-1">
            <h4 className="font-bold text-primary text-sm mb-1">{n.title}</h4>
            <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">{n.content}</p>
            <div className="flex items-center gap-4 text-[10px] text-on-surface-variant">
              <span>발송 {n.sentCount ?? 0}건</span>
              <span>실패 {n.failedCount ?? 0}건</span>
              <span>{new Date(n.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
          <button
            onClick={() => handleDelete(n._id)}
            className="p-2 hover:bg-error-container/20 rounded-lg text-error ml-4"
          >
            <Icon name="delete" className="text-sm" />
          </button>
        </div>
      ))}
    </div>
  );
}
