import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { PostContent } from './components/PostContent';
import { CommentSection } from './components/CommentSection';
import type { Post } from '@/types/community';
import type { Comment } from '@/types/comment';

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?._id);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  // 데이터만 가져오기 (조회수 증가 없음) — 댓글 작성 후 새로고침용
  const refreshDetail = useCallback(async () => {
    if (!id) return;
    try {
      const res = await apiRequest<{ data: { post: Post; comments: Comment[] } }>(
        `/community/${id}`,
      );
      setPost(res.data.post);
      setComments(res.data.comments);
    } catch {
      // post not found
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 최초 1회만 조회 (StrictMode 중복 방지)
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    refreshDetail();
  }, [refreshDetail]);

  async function handleLike() {
    if (!id) return;
    const res = await apiRequest<{ data: { liked: boolean; likeCount: number } }>(
      `/community/${id}/like`,
      { method: 'POST' },
    );
    setLiked(res.data.liked);
    setPost((prev) => (prev ? { ...prev, likeCount: res.data.likeCount } : prev));
  }

  async function handleDelete() {
    if (!id || !confirm('정말 삭제하시겠습니까?')) return;
    await apiRequest(`/community/${id}`, { method: 'DELETE' });
    navigate('/community');
  }

  async function handleComment(content: string) {
    if (!id) return;
    await apiRequest(`/community/${id}/comments`, {
      method: 'POST',
      body: { content },
    });
    refreshDetail();
  }

  async function handleEditComment(commentId: string, content: string) {
    if (!id) return;
    await apiRequest(`/community/${id}/comments/${commentId}`, {
      method: 'PUT',
      body: { content },
    });
    refreshDetail();
  }

  async function handleDeleteComment(commentId: string) {
    if (!id) return;
    await apiRequest(`/community/${id}/comments/${commentId}`, {
      method: 'DELETE',
    });
    refreshDetail();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-on-surface-variant">
        로딩 중...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-on-surface-variant">게시글을 찾을 수 없습니다.</p>
        <Link to="/community" className="text-secondary font-bold text-sm">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const isOwner = userId === post.userId?._id;

  return (
    <>
      {/* Back Navigation */}
      <div className="flex items-center gap-3 mb-2">
        <Link
          to="/community"
          className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary font-semibold transition-colors"
        >
          <Icon name="arrow_back" className="text-lg" />
          게시판으로 돌아가기
        </Link>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <PostContent
          post={post}
          liked={liked}
          onLike={handleLike}
          onDelete={handleDelete}
          isOwner={isOwner}
        />
        <CommentSection
          comments={comments}
          onSubmit={handleComment}
          onEdit={handleEditComment}
          onDelete={handleDeleteComment}
        />
      </div>
    </>
  );
}
