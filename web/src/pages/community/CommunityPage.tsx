import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';
import { useCommunityStore } from '@/stores/community.store';
import { CategoryTabs } from './components/CategoryTabs';
import { PostsTable } from './components/PostsTable';
import { SidePanel } from './components/SidePanel';
import { MobileCommunity } from './components/MobileCommunity';

export default function CommunityPage() {
  const { posts, category, mineOnly, isLoading, fetchPosts, setCategory, toggleMineOnly, showWrite, setShowWrite } =
    useCommunityStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [writeCategory, setWriteCategory] = useState('free');

  useEffect(() => {
    fetchPosts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit() {
    if (!title || !content) return;
    await apiRequest('/community', {
      method: 'POST',
      body: { category: writeCategory, title, content },
    });
    setTitle('');
    setContent('');
    setShowWrite(false);
    fetchPosts();
  }

  return (
    <>
      {/* ── Mobile Layout ── */}
      <div className="lg:hidden">
        {/* Mobile Write Form (Bottom Sheet style) */}
        {showWrite && (
          <div className="fixed inset-0 z-[60] flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowWrite(false)} />
            <div className="relative bg-surface-container-lowest rounded-t-3xl p-6 pb-24 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-on-surface font-headline">새 게시글 작성</h2>
                <button onClick={() => setShowWrite(false)} className="p-1">
                  <Icon name="close" className="text-on-surface-variant" />
                </button>
              </div>
              <select
                value={writeCategory}
                onChange={(e) => setWriteCategory(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm font-bold"
              >
                <option value="free">자유 토론</option>
                <option value="info">정보 공유</option>
                <option value="jobs">구인구직</option>
              </select>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={5}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary resize-none"
              />
              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm active:scale-[0.98] transition-transform"
              >
                게시하기
              </button>
            </div>
          </div>
        )}

        <MobileCommunity
          posts={posts}
          category={category}
          isLoading={isLoading}
          onCategoryChange={setCategory}
          onWrite={() => setShowWrite(true)}
        />
      </div>

      {/* ── Desktop Layout ── */}
      <div className="hidden lg:block space-y-8">
        {/* Hero Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary font-headline">
              커뮤니티 게시판
            </h1>
            <p className="text-on-surface-variant max-w-xl">
              인증된 중개사들만을 위한 독점 지식 공유 허브입니다. 시장 정보 공유,
              인재 발굴 및 최신 동향을 확인하세요.
            </p>
          </div>
          <button
            onClick={() => setShowWrite(!showWrite)}
            className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-primary/10 hover:translate-y-[-2px] active:translate-y-0 transition-all"
          >
            <Icon name="edit_square" />
            새 게시글 작성
          </button>
        </section>

        {/* Write Form */}
        {showWrite && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 space-y-4">
            <div className="flex gap-4">
              <select
                value={writeCategory}
                onChange={(e) => setWriteCategory(e.target.value)}
                className="bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm font-bold"
              >
                <option value="free">자유 토론</option>
                <option value="info">정보 공유</option>
                <option value="jobs">구인구직</option>
              </select>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="flex-1 bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-secondary"
              />
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={4}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary resize-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWrite(false)}
                className="px-6 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 text-sm font-bold bg-primary text-white rounded-lg"
              >
                게시
              </button>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <CategoryTabs active={category} onChange={setCategory} mineOnly={mineOnly} onToggleMine={toggleMineOnly} />

        {/* Grid: Posts + Sidebar */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-9">
            {isLoading ? (
              <div className="text-center py-12 text-on-surface-variant">
                로딩 중...
              </div>
            ) : (
              <PostsTable posts={posts} />
            )}
          </div>
          <SidePanel />
        </div>
      </div>
    </>
  );
}
