import { apiRequest } from '@/lib/api-client';

const options = [
  { label: '스타터', points: 10000, price: '11,000원', raw: 10000 },
  { label: '프로', points: 30000, price: '33,000원', original: '36,000원', raw: 30000, featured: true },
  { label: '프리미엄', points: 100000, price: '110,000원', raw: 100000 },
];

type PurchaseOptionsProps = {
  onPurchased: () => void;
};

export function PurchaseOptions({ onPurchased }: PurchaseOptionsProps) {
  async function handlePurchase(points: number) {
    try {
      await apiRequest('/purchase/points', {
        method: 'POST',
        body: { points, method: 'card' },
      });
      onPurchased();
    } catch {
      // error
    }
  }

  return (
    <section>
      <h3 className="text-xl font-bold text-primary mb-6 font-headline">포인트 충전</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((opt) => (
          <div
            key={opt.raw}
            className={`bg-surface-container-lowest p-6 rounded-xl group cursor-pointer transition-all ${
              opt.featured
                ? 'border-2 border-secondary relative overflow-hidden'
                : 'border border-outline-variant/10 hover:border-secondary'
            }`}
          >
            {opt.featured && (
              <div className="absolute top-0 right-0 bg-secondary text-white text-[8px] font-black px-3 py-1 rounded-bl-lg">
                인기
              </div>
            )}
            <p className="text-[10px] font-bold text-on-surface-variant mb-2">
              {opt.label}
            </p>
            <h4 className="text-2xl font-extrabold text-primary mb-1">
              {opt.points.toLocaleString()} pts
            </h4>
            <p className="text-lg font-bold text-secondary mb-4">
              {opt.price}
              {opt.original && (
                <span className="text-[10px] line-through text-on-surface-variant opacity-50 ml-1">
                  {opt.original}
                </span>
              )}
            </p>
            <button
              onClick={() => handlePurchase(opt.raw)}
              className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${
                opt.featured
                  ? 'bg-secondary text-white'
                  : 'bg-surface-container-low group-hover:bg-secondary group-hover:text-white'
              }`}
            >
              선택하기
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
