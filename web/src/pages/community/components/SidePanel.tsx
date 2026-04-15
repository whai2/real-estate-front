import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';
import type { Post } from '@/types/community';

type Stats = {
  totalPosts: number;
  todayJobs: number;
};

export function SidePanel() {
  const [trending, setTrending] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, todayJobs: 0 });
  const fetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    // 트렌드: 조회수 TOP 3
    apiRequest<{ data: { posts: Post[]; total: number } }>(
      '/community?limit=3&sort=viewCount',
    )
      .then((res) => setTrending(res.data.posts))
      .catch(() => {});

    // 전체 게시글 수
    apiRequest<{ data: { total: number } }>('/community?limit=1')
      .then((res) => setStats((prev) => ({ ...prev, totalPosts: res.data.total })))
      .catch(() => {});

    // 오늘 구인구직 수
    apiRequest<{ data: { total: number } }>('/community?category=jobs&limit=1')
      .then((res) => setStats((prev) => ({ ...prev, todayJobs: res.data.total })))
      .catch(() => {});
  }, []);

  return (
    <div className="col-span-12 xl:col-span-3 space-y-8">
      {/* Hot Topics */}
      <div className="bg-surface-container-low rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold uppercase tracking-wider text-primary">
            실시간 트렌드
          </h4>
          <Icon name="trending_up" className="text-secondary text-sm" />
        </div>
        <div className="space-y-4">
          {trending.length === 0 ? (
            <p className="text-xs text-on-surface-variant">게시글이 없습니다.</p>
          ) : (
            trending.map((post, i) => (
              <div
                key={post._id}
                onClick={() => navigate(`/community/${post._id}`)}
                className="flex gap-4 group cursor-pointer"
              >
                <span className="text-xl font-black text-outline/20 group-hover:text-secondary/40 transition-colors">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-xs font-bold text-primary line-clamp-2 leading-relaxed group-hover:text-secondary transition-colors">
                  {post.title}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Community Stats */}
      <div className="relative overflow-hidden bg-primary p-6 rounded-2xl text-white space-y-4">
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Icon name="insights" className="text-[96px]" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-widest text-secondary-container">
          커뮤니티 현황
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</p>
            <p className="text-[10px] opacity-60 uppercase">전체 게시글</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.todayJobs.toLocaleString()}</p>
            <p className="text-[10px] opacity-60 uppercase">구인구직 게시글</p>
          </div>
        </div>
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs opacity-80 leading-relaxed italic">
            "네트워킹은 부동산 업계에서 가장 강력한 자산입니다."
          </p>
        </div>
      </div>
    </div>
  );
}
