import { useEffect, useState, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { apiRequest } from '@/lib/api-client';
import type { Property } from '@/types/property';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<(Property & { favoriteId: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    apiRequest<{ data: { favorites: { _id: string; propertyId: Property }[] } }>('/favorites')
      .then((res) =>
        setFavorites(
          res.data.favorites.map((f) => ({ ...f.propertyId, favoriteId: f._id })),
        ),
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(favoriteId: string) {
    await apiRequest(`/favorites/${favoriteId}`, { method: 'DELETE' });
    setFavorites((prev) => prev.filter((f) => f.favoriteId !== favoriteId));
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tighter text-primary font-headline mb-2">
          관심 매물
        </h1>
        <p className="text-on-surface-variant">북마크한 매물 목록입니다.</p>
      </div>

      {loading ? (
        <p className="text-on-surface-variant py-12 text-center">로딩 중...</p>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20">
          <Icon name="bookmark_border" className="text-5xl text-on-surface-variant/30 mb-4" />
          <p className="text-on-surface-variant">관심 매물이 없습니다.</p>
          <p className="text-xs text-on-surface-variant/60 mt-1">
            지도나 매물 목록에서 하트를 눌러 관심 매물을 추가하세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((p) => (
            <div
              key={p._id}
              className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 hover:shadow-lg transition-shadow"
            >
              <div className="h-40 bg-surface-container-high flex items-center justify-center relative">
                {p.photos?.[0] ? (
                  <img src={typeof p.photos[0] === 'string' ? p.photos[0] : (p.photos[0] as unknown as { url: string }).url} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <Icon name="image" className="text-4xl text-on-surface-variant/30" />
                )}
                <button
                  onClick={() => handleRemove(p.favoriteId)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Icon name="favorite" className="text-error text-sm" filled />
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-primary mb-1 truncate">{p.title}</h3>
                <p className="text-xs text-on-surface-variant truncate mb-3">{p.address}</p>
                <div className="flex justify-between items-center">
                  <span className="text-secondary font-bold text-sm">
                    {p.trades?.[0]?.price
                      ? `${(p.trades[0].price / 10000).toLocaleString()}만원`
                      : '-'}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    방 {p.rooms ?? '-'} · 욕실 {p.bathrooms ?? '-'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
