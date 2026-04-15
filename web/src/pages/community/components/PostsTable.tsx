import { useNavigate } from 'react-router';
import type { Post } from '@/types/community';

type PostsTableProps = {
  posts: Post[];
};

const defaultStyle = { bg: 'bg-secondary-fixed', text: 'text-on-secondary-fixed-variant', label: '자유' };
const categoryStyleMap: Record<string, { bg: string; text: string; label: string }> = {
  notice: { bg: 'bg-secondary', text: 'text-white', label: '공지' },
  jobs: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-container', label: '구인구직' },
  info: { bg: 'bg-outline-variant/30', text: 'text-on-surface-variant', label: '정보공유' },
  free: { bg: 'bg-secondary-fixed', text: 'text-on-secondary-fixed-variant', label: '자유' },
};

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

export function PostsTable({ posts }: PostsTableProps) {
  const navigate = useNavigate();
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-12 px-6 py-4 bg-surface-container-high rounded-t-xl">
        <div className="col-span-7">
          <span className="text-xs font-bold uppercase tracking-widest text-on-primary-fixed-variant font-label">
            주제 / 토론
          </span>
        </div>
        <div className="col-span-2 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-on-primary-fixed-variant font-label">
            작성자
          </span>
        </div>
        <div className="col-span-2 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-on-primary-fixed-variant font-label">
            날짜
          </span>
        </div>
        <div className="col-span-1 text-right">
          <span className="text-xs font-bold uppercase tracking-widest text-on-primary-fixed-variant font-label">
            조회수
          </span>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-[2px]">
        {posts.length === 0 ? (
          <div className="px-6 py-12 text-center text-on-surface-variant bg-surface-container-lowest">
            게시글이 없습니다.
          </div>
        ) : (
          posts.map((post) => {
            const isNotice = post.category === 'notice';
            const style = categoryStyleMap[post.category] ?? defaultStyle;

            return (
              <div
                key={post._id}
                onClick={() => navigate(`/community/${post._id}`)}
                className={`grid grid-cols-12 px-6 py-5 hover:bg-surface-bright transition-colors group cursor-pointer ${
                  isNotice
                    ? 'bg-surface-container-low border-l-4 border-secondary'
                    : 'bg-surface-container-lowest'
                }`}
              >
                <div className="col-span-7 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 ${style.bg} ${style.text} rounded font-bold uppercase`}
                    >
                      {style.label}
                    </span>
                    <h3 className="font-bold text-primary group-hover:text-secondary transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                  </div>
                  <span className="text-xs text-on-surface-variant/70 line-clamp-1">
                    {post.content}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {post.userId?.name ?? '익명'}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-center">
                  <span className="text-xs text-outline font-medium">
                    {timeAgo(post.createdAt)}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <span
                    className={`text-xs font-bold ${isNotice ? 'text-secondary' : 'text-primary/40'}`}
                  >
                    {post.viewCount >= 1000
                      ? `${(post.viewCount / 1000).toFixed(1)}k`
                      : post.viewCount}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
