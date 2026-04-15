import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/stores/auth.store';
import { apiRequest } from '@/lib/api-client';

type ChatMessage = {
  _id: string;
  content: string;
  sender: 'user' | 'admin';
  createdAt: string;
};

export default function SupportChatPage() {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fetched = useRef(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await apiRequest<{ data: ChatMessage[] }>('/chat/history');
      setMessages(res.data);
    } catch {
      // no chat history endpoint yet - show empty
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    // Optimistic update
    const tempMsg: ChatMessage = {
      _id: `temp-${Date.now()}`,
      content,
      sender: 'user',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await apiRequest('/chat/send', {
        method: 'POST',
        body: { content },
      });
      // In a real app, socket.io would push the admin reply
    } catch {
      // If API doesn't exist yet, keep the optimistic message
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
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

      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tighter text-primary font-headline mb-2">
            실시간 문의
          </h1>
          <p className="text-on-surface-variant text-sm">관리자에게 실시간으로 문의하세요.</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden flex flex-col" style={{ height: '65vh' }}>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="text-center text-on-surface-variant py-12">로딩 중...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="chat" className="text-4xl text-on-surface-variant/30 mb-3" />
                <p className="text-on-surface-variant text-sm">문의 내용을 입력하세요.</p>
                <p className="text-on-surface-variant text-xs mt-1">영업시간 내 빠르게 답변드립니다.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${msg.sender === 'user' ? 'order-1' : ''}`}>
                    {msg.sender === 'admin' && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Icon name="support_agent" className="text-white text-xs" />
                        </div>
                        <span className="text-[10px] font-bold text-on-surface-variant">관리자</span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-surface-container-low text-on-surface rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <p className={`text-[10px] text-on-surface-variant mt-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-outline-variant/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <input
                className="flex-1 bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/50"
                placeholder="메시지를 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="p-3 bg-primary text-white rounded-xl disabled:opacity-40 hover:brightness-125 transition-all"
              >
                <Icon name="send" />
              </button>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-2 text-center">
              {user?.name ?? '사용자'}님 · 영업시간: 평일 09:00 - 18:00
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
