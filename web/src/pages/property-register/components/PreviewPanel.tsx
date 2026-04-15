import { Icon } from '@/components/ui/Icon';

type PreviewPanelProps = {
  form: {
    title: string;
    address: string;
    price: string;
    commission: string;
    rooms: number;
    bathrooms: number;
    balcony: number;
  };
};

function formatPrice(price: string): string {
  const num = Number(price);
  if (!num) return '0원';
  if (num >= 100000000) {
    const uk = Math.floor(num / 100000000);
    const man = Math.floor((num % 100000000) / 10000);
    return man > 0 ? `${uk}억 ${man.toLocaleString()}만` : `${uk}억`;
  }
  if (num >= 10000) return `${(num / 10000).toLocaleString()}만`;
  return `${num.toLocaleString()}원`;
}

export function PreviewPanel({ form }: PreviewPanelProps) {
  const commissionAmount =
    Number(form.price) && Number(form.commission)
      ? Math.round(Number(form.price) * (Number(form.commission) / 100))
      : 0;

  return (
    <div className="lg:col-span-5 lg:sticky lg:top-28">
      <div className="bg-surface-container-low rounded-2xl p-4 md:p-8 space-y-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface/40">
            실시간 미리보기
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-on-secondary-container animate-pulse" />
            리스팅 준비 완료
          </span>
        </div>

        {/* Card Preview */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(7,27,59,0.06)] border border-outline-variant/10">
          <div className="relative h-64 overflow-hidden bg-surface-container-high flex items-center justify-center">
            <Icon name="image" className="text-5xl text-on-surface-variant/30" />
            <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">
              미리보기
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-extrabold text-primary tracking-tight font-headline">
                  {form.title || '매물 명칭을 입력하세요'}
                </h3>
                <p className="text-sm text-on-surface-variant flex items-center gap-1">
                  <Icon name="location_on" className="text-sm" />
                  {form.address || '주소 미입력'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-secondary tracking-tighter font-headline">
                  {formatPrice(form.price)}
                </p>
                <p className="text-[10px] font-bold text-on-surface/50 uppercase">
                  희망 매매가
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-outline-variant/10">
              <div className="flex flex-col items-center gap-1">
                <Icon name="bed" className="text-on-surface-variant" />
                <span className="text-xs font-bold">방 {form.rooms}개</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Icon name="bathtub" className="text-on-surface-variant" />
                <span className="text-xs font-bold">
                  욕실 {form.bathrooms}개
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Icon name="balcony" className="text-on-surface-variant" />
                <span className="text-xs font-bold">
                  테라스 {form.balcony}개
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                  <Icon name="person" className="text-sm" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-on-surface/40 leading-none">
                    담당 중개사
                  </p>
                  <p className="text-xs font-bold">김중개</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-on-surface/40 leading-none">
                  중개 수수료
                </p>
                <p className="text-xs font-bold text-on-tertiary-container">
                  {form.commission || '0'}% (약{' '}
                  {formatPrice(String(commissionAmount))})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Quality */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-on-surface/40 uppercase tracking-widest">
            데이터 정밀 검수
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-surface-container-high/50 rounded-lg">
              <span className="text-xs font-medium">매물 신뢰도 점수</span>
              <span className="text-xs font-bold text-secondary">
                {form.title && form.address && form.price
                  ? '94% 매우 높음'
                  : '입력 대기중'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-container-high/50 rounded-lg">
              <span className="text-xs font-medium">시장 적정가 지수</span>
              <span className="text-xs font-bold text-on-tertiary-container">
                {form.price ? '최적가 산정 완료' : '가격 미입력'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
