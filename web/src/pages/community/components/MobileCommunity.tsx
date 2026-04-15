import { useNavigate } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import type { Post } from '@/types/community';

type Props = {
  posts: Post[];
  category: string;
  isLoading: boolean;
  onCategoryChange: (category: string) => void;
  onWrite: () => void;
};

const FILTER_CHIPS = [
  { label: '전체', value: '' },
  { label: '공지사항', value: 'notice' },
  { label: '구인구직', value: 'jobs' },
  { label: '자유게시판', value: 'free' },
  { label: '매물문의', value: 'info' },
];

const categoryBadge: Record<string, { bg: string; text: string; label: string }> = {
  notice: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-container', label: '공지' },
  jobs: { bg: 'bg-secondary-container', text: 'text-white', label: '구인구직' },
  info: { bg: 'bg-error-container', text: 'text-error', label: '문의' },
  free: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', label: '자유' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day === 1) return '어제';
  return `${day}일 전`;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function MobileCommunity({ posts, category, isLoading, onCategoryChange, onWrite }: Props) {
  const navigate = useNavigate();

  return (
    <div>
      {/* Header */}
      <section className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">커뮤니티</h1>
        <p className="text-on-surface-variant text-sm font-medium">최신 부동산 소식과 업계 정보를 공유하세요.</p>
      </section>

      {/* Filter Chips */}
      <nav className="flex overflow-x-auto gap-2 mb-6 scrollbar-hide pb-2">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.value}
            onClick={() => onCategoryChange(chip.value)}
            className={`flex-none px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
              category === chip.value
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </nav>

      {/* Post List */}
      {isLoading ? (
        <div className="text-center py-12 text-on-surface-variant text-sm">로딩 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <Icon name="forum" className="text-5xl text-outline mb-3" />
          <p className="text-on-surface-variant text-sm">게시글이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const badge = categoryBadge[post.category] || categoryBadge.free;
            return (
              <div
                key={post._id}
                onClick={() => navigate(`/community/${post._id}`)}
                className="p-4 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(7,27,59,0.02)] border border-outline-variant/10 active:scale-[0.98] transition-all cursor-pointer"
              >
                {/* Top: badge + time */}
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded ${badge.bg} ${badge.text} text-[10px] font-bold uppercase tracking-wider`}>
                    {badge.label}
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    {timeAgo(post.createdAt)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-on-surface leading-snug mb-3 line-clamp-2">
                  {post.title}
                </h3>

                {/* Bottom: author + stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {post.category === 'notice' && (
                      <div className="w-5 h-5 rounded-full bg-primary-fixed flex items-center justify-center">
                        <Icon name="admin_panel_settings" className="text-[12px] text-primary" />
                      </div>
                    )}
                    <span className="text-xs font-semibold text-on-surface-variant">
                      {post.userId?.name || '익명'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant/60">
                    <div className="flex items-center gap-1">
                      <Icon name="visibility" className="text-sm" />
                      <span className="text-xs font-medium">{formatCount(post.viewCount ?? 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="chat_bubble_outline" className="text-sm" />
                      <span className="text-xs font-medium">{post.commentCount ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
