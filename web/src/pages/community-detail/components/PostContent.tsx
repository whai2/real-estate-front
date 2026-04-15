import { Icon } from '@/components/ui/Icon';
import type { Post } from '@/types/community';

const categoryLabel: Record<string, string> = {
  notice: '공지',
  jobs: '구인구직',
  info: '정보공유',
  free: '자유',
};

const categoryStyle: Record<string, string> = {
  notice: 'bg-secondary text-white',
  jobs: 'bg-tertiary-fixed text-on-tertiary-container',
  info: 'bg-outline-variant/30 text-on-surface-variant',
  free: 'bg-secondary-fixed text-on-secondary-fixed-variant',
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

type PostContentProps = {
  post: Post;
  liked: boolean;
  onLike: () => void;
  onDelete?: () => void;
  isOwner: boolean;
};

export function PostContent({ post, liked, onLike, onDelete, isOwner }: PostContentProps) {
  return (
    <article className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-outline-variant/10">
        <div className="flex items-center gap-3 mb-4">
          <span
            className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase ${categoryStyle[post.category] ?? categoryStyle.free}`}
          >
            {categoryLabel[post.category] ?? post.category}
          </span>
          <span className="text-xs text-outline">{timeAgo(post.createdAt)}</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-primary font-headline mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
            <Icon name="person" className="text-on-surface-variant" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">
              {post.userId?.name ?? '익명'}
            </p>
            {post.userId?.agencyName && (
              <p className="text-[10px] text-outline uppercase tracking-wider">
                {post.userId.agencyName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-8">
        <div className="text-on-surface leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-8 py-4 border-t border-outline-variant/10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={onLike}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
              liked ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'
            }`}
          >
            <Icon name={liked ? 'favorite' : 'favorite_border'} className="text-lg" filled={liked} />
            {post.likeCount > 0 && post.likeCount}
          </button>
          <span className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Icon name="visibility" className="text-lg" />
            {post.viewCount}
          </span>
          <span className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Icon name="chat_bubble_outline" className="text-lg" />
            {post.commentCount}
          </span>
        </div>
        {isOwner && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-xs text-error hover:text-error/80 font-semibold"
          >
            <Icon name="delete" className="text-sm" />
            삭제
          </button>
        )}
      </div>
    </article>
  );
}
