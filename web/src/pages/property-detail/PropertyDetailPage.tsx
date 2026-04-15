import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api-client';
import { useFavoriteStore } from '@/stores/favorite.store';
import type { Property } from '@/types/property';

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  villa: '빌라/연립/다세대',
  urban: '도시형 생활주택',
  officetel: '오피스텔',
  apartment: '아파트',
  single: '단독주택/타운하우스',
  multi: '다가구주택',
  commercial: '근린생활시설',
};

const TRADE_TYPE_LABEL: Record<string, string> = {
  sale: '매매',
  investment: '투자',
  jeonse: '전세',
  charter: '전세',
  monthly: '월세',
};

const OCCUPANCY_LABEL: Record<string, string> = {
  none: '-',
  occupied: '거주중',
  vacant: '공실',
  moving: '이사예정',
};

const PARKING_LABEL: Record<string, string> = {
  parallel: '일렬',
  double: '겹주차',
  mechanical: '기계',
  impossible: '불가',
};

const SPECIAL_LABEL: Record<string, string> = {
  none: '-',
  duplex: '복층',
  terrace: '테라스',
};

type DetailProperty = Property & {
  lat?: number;
  lng?: number;
  description?: string;
  contacts?: { name: string; phone: string }[];
  parking?: string[];
  occupancy?: string;
  balcony?: number;
  utilityRoom?: number;
  special?: string;
  floor?: string;
};

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<DetailProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const fetched = useRef(false);

  const { isFavorite, toggleFavorite, fetchFavorites, favoriteIds } =
    useFavoriteStore();

  useEffect(() => {
    if (favoriteIds.size === 0) fetchFavorites();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!id || fetched.current) return;
    fetched.current = true;
    apiRequest<{ data: DetailProperty }>(`/properties/${id}`)
      .then((res) => setProperty(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant">로딩 중...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Icon name="error_outline" className="text-5xl text-on-surface-variant/40" />
        <p className="text-on-surface-variant">매물을 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-primary text-sm font-bold hover:underline"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  const photos =
    property.photos?.map((p) =>
      typeof p === 'string' ? p : (p as unknown as { url: string }).url,
    ) ?? [];

  const bookmarked = isFavorite(property._id);

  const riskVariant =
    property.riskLevel === 'danger'
      ? 'danger'
      : property.riskLevel === 'caution'
        ? 'warning'
        : 'safe';

  const riskLabel =
    property.riskLevel === 'danger'
      ? '위험'
      : property.riskLevel === 'caution'
        ? '주의'
        : '양호';

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <Icon name="arrow_back" className="text-xl" />
          <span className="text-sm font-bold">뒤로</span>
        </button>
        <button
          onClick={() => toggleFavorite(property._id)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/20 hover:bg-surface-container-low transition-colors"
        >
          <Icon
            name="favorite"
            className={`text-lg ${bookmarked ? 'text-error' : 'text-on-surface-variant/40'}`}
            filled={bookmarked}
          />
          <span className="text-sm font-bold">
            {bookmarked ? '관심매물 해제' : '관심매물 추가'}
          </span>
        </button>
      </div>

      {/* Photo Gallery */}
      {photos.length > 0 ? (
        <div className="relative rounded-2xl overflow-hidden mb-8 bg-surface-container-high">
          <img
            src={photos[photoIndex]}
            alt={`${property.title} 사진 ${photoIndex + 1}`}
            className="w-full h-72 lg:h-96 object-cover"
          />
          {photos.length > 1 && (
            <>
              <button
                onClick={() =>
                  setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Icon name="chevron_left" className="text-xl" />
              </button>
              <button
                onClick={() =>
                  setPhotoIndex((i) => (i + 1) % photos.length)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Icon name="chevron_right" className="text-xl" />
              </button>
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full font-bold">
                {photoIndex + 1} / {photos.length}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-container-high flex items-center justify-center h-48 mb-8">
          <Icon name="image" className="text-5xl text-on-surface-variant/30" />
        </div>
      )}

      {/* Title + Badges */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
              property.type === 'open'
                ? 'bg-error-container text-error'
                : 'bg-primary-container text-on-primary-container'
            }`}
          >
            {property.type === 'open' ? '오픈현장' : '일반매물'}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface-variant">
            {PROPERTY_TYPE_LABEL[property.propertyType] ?? property.propertyType}
          </span>
          {property.riskLevel && (
            <Badge variant={riskVariant}>{riskLabel}</Badge>
          )}
          {property.score != null && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-container text-on-secondary-container">
              {property.score}점
            </span>
          )}
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface font-headline">
          {property.title}
        </h1>
        <p className="text-on-surface-variant mt-1">
          {property.address}
          {property.detailAddress ? ` ${property.detailAddress}` : ''}
        </p>
      </div>

      {/* Price Section */}
      {property.trades?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="payments" className="text-xl text-primary" />
            가격 정보
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {property.trades.map((trade, idx) => (
              <div
                key={idx}
                className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10"
              >
                <span className="text-xs font-bold text-on-surface-variant uppercase mb-2 block">
                  {TRADE_TYPE_LABEL[trade.type] ?? trade.type}
                </span>
                {trade.price != null && (
                  <p className="text-xl font-extrabold text-secondary">
                    {trade.price >= 100000000
                      ? `${(trade.price / 100000000).toFixed(1)}억`
                      : `${(trade.price / 10000).toLocaleString()}만`}
                    원
                  </p>
                )}
                {trade.deposit != null && (
                  <p className="text-base font-bold text-on-surface">
                    보증금{' '}
                    {trade.deposit >= 100000000
                      ? `${(trade.deposit / 100000000).toFixed(1)}억`
                      : `${(trade.deposit / 10000).toLocaleString()}만`}
                    원
                  </p>
                )}
                {trade.monthlyRent != null && (
                  <p className="text-base font-bold text-on-surface">
                    월세 {trade.monthlyRent.toLocaleString()}만원
                  </p>
                )}
                {trade.commission && trade.commission.type !== 'none' && (
                  <p className="text-xs text-on-surface-variant mt-1">
                    수수료: {trade.commission.type === 'single' ? '단타' : '양타'}
                    {trade.commission.amount
                      ? ` ${trade.commission.amount.toLocaleString()}원`
                      : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Specs */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <Icon name="apartment" className="text-xl text-primary" />
          상세 정보
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <SpecItem label="방" value={property.rooms != null ? `${property.rooms}개` : '-'} />
          <SpecItem label="화장실" value={property.bathrooms != null ? `${property.bathrooms}개` : '-'} />
          <SpecItem label="면적" value={property.area ? `${property.area}m²` : '-'} />
          <SpecItem label="층" value={property.floor ?? '-'} />
          <SpecItem label="베란다" value={property.balcony != null ? `${property.balcony}개` : '-'} />
          <SpecItem label="다용도실" value={property.utilityRoom != null ? `${property.utilityRoom}개` : '-'} />
          <SpecItem
            label="특수구조"
            value={SPECIAL_LABEL[property.special ?? 'none'] ?? '-'}
          />
          <SpecItem
            label="입주상태"
            value={OCCUPANCY_LABEL[property.occupancy ?? 'none'] ?? '-'}
          />
          <SpecItem
            label="주차"
            value={
              property.parking?.length
                ? property.parking.map((p) => PARKING_LABEL[p] ?? p).join(', ')
                : '-'
            }
          />
        </div>
      </section>

      {/* Description */}
      {property.description && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="description" className="text-xl text-primary" />
            매물 설명
          </h2>
          <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10 whitespace-pre-wrap text-sm text-on-surface leading-relaxed">
            {property.description}
          </div>
        </section>
      )}

      {/* Contacts */}
      {property.contacts && property.contacts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="contact_phone" className="text-xl text-primary" />
            담당자 정보
          </h2>
          <div className="space-y-3">
            {property.contacts.map((c, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-surface-container-low rounded-xl p-4 border border-outline-variant/10"
              >
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                  <Icon name="person" className="text-on-primary-container" />
                </div>
                <div>
                  <p className="font-bold text-on-surface">{c.name}</p>
                  <p className="text-sm text-on-surface-variant">{c.phone}</p>
                </div>
                <a
                  href={`tel:${c.phone}`}
                  className="ml-auto w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <Icon name="call" className="text-on-secondary-container text-lg" />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Registrant */}
      {property.userId && typeof property.userId === 'object' && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="badge" className="text-xl text-primary" />
            등록자
          </h2>
          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
            <p className="font-bold text-on-surface">
              {(property.userId as unknown as { name: string }).name}
            </p>
            {(property.userId as unknown as { agencyName?: string }).agencyName && (
              <p className="text-sm text-on-surface-variant">
                {(property.userId as unknown as { agencyName: string }).agencyName}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/10 text-center">
      <p className="text-[10px] text-on-surface-variant font-bold mb-1">{label}</p>
      <p className="text-sm font-bold text-on-surface">{value}</p>
    </div>
  );
}
