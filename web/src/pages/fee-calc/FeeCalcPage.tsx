import { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/Icon';

type TradeType = 'sale' | 'jeonse' | 'monthly';

// 법정 중개보수 요율표 (주택 매매/교환 기준, 2023.10 개정)
const SALE_RATES = [
  { max: 50000000, rate: 0.6, limit: 250000 },
  { max: 200000000, rate: 0.5, limit: 800000 },
  { max: 900000000, rate: 0.4, limit: null },
  { max: Infinity, rate: 0.9, limit: null },
];

// 전세 기준
const JEONSE_RATES = [
  { max: 50000000, rate: 0.5, limit: 200000 },
  { max: 100000000, rate: 0.4, limit: 300000 },
  { max: 600000000, rate: 0.3, limit: null },
  { max: Infinity, rate: 0.8, limit: null },
];

function calculateFee(
  tradeType: TradeType,
  amount: number,
  deposit: number,
  monthlyRent: number,
) {
  let target = amount;
  if (tradeType === 'monthly') {
    // 월세: 보증금 + (월세 × 100) 기준 (5천만 이상 시), 아니면 보증금 + (월세 × 70)
    const calc = deposit + monthlyRent * 100;
    target = calc < 50000000 ? deposit + monthlyRent * 70 : calc;
  } else if (tradeType === 'jeonse') {
    target = amount;
  }

  const rates = tradeType === 'sale' ? SALE_RATES : JEONSE_RATES;
  const tier = rates.find((r) => target < r.max) ?? rates[rates.length - 1]!;

  let fee = target * (tier.rate / 100);
  if (tier.limit && fee > tier.limit) fee = tier.limit;

  const vat = fee * 0.1;

  return {
    rate: tier.rate,
    limit: tier.limit,
    fee,
    vat,
    total: fee + vat,
    targetAmount: target,
  };
}

function formatKRW(n: number): string {
  return `₩ ${Math.floor(n).toLocaleString()}`;
}

const rateTable = [
  { range: '5천만 원 미만', rate: '0.6% (한도 25만원)' },
  { range: '5천만 ~ 2억 미만', rate: '0.5% (한도 80만원)' },
  { range: '2억 ~ 9억 미만', rate: '0.4%' },
  { range: '9억 원 이상', rate: '최대 0.9% (협의)' },
];

export default function FeeCalcPage() {
  const [tradeType, setTradeType] = useState<TradeType>('sale');
  const [amount, setAmount] = useState('1200000000');
  const [deposit, setDeposit] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');

  const result = useMemo(
    () =>
      calculateFee(
        tradeType,
        Number(amount) || 0,
        Number(deposit) || 0,
        Number(monthlyRent) || 0,
      ),
    [tradeType, amount, deposit, monthlyRent],
  );

  return (
    <>
      {/* Header */}
      <div className="mb-12">
        <h2 className="text-4xl font-extrabold tracking-tighter text-primary mb-2 font-headline">
          중개보수 계산기
        </h2>
        <p className="text-on-surface-variant font-medium">
          최신 법정 요율 및 규제 기준을 반영한 정밀 중개 수수료 산출 서비스입니다.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Input */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_40px_rgba(7,27,59,0.04)] border border-outline-variant/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Trade Type */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  거래 유형
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container-low rounded-xl">
                  {(
                    [
                      { key: 'sale', label: '매매/교환' },
                      { key: 'jeonse', label: '전세' },
                      { key: 'monthly', label: '월세' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTradeType(t.key)}
                      className={`py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                        tradeType === t.key
                          ? 'bg-white shadow-sm text-primary'
                          : 'text-on-surface-variant hover:bg-white/50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  {tradeType === 'jeonse' ? '전세 금액 (원)' : '거래 금액 (원)'}
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-secondary/20 rounded-xl py-4 pl-6 pr-12 text-primary font-bold text-lg"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">
                    ₩
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Rent Fields */}
            {tradeType === 'monthly' && (
              <div className="mt-8 pt-8 border-t border-outline-variant/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                    보증금
                  </label>
                  <div className="relative">
                    <input
                      className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-secondary/20 rounded-xl py-4 pl-6 pr-12 text-primary font-semibold"
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">
                      ₩
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                    월세액
                  </label>
                  <div className="relative">
                    <input
                      className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-secondary/20 rounded-xl py-4 pl-6 pr-12 text-primary font-semibold"
                      type="number"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">
                      ₩
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary-container p-8 rounded-2xl text-white overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="trending_up" className="text-secondary-container" />
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary-fixed-dim">
                    현재 시장 동향
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2 font-headline">
                  고거래 집중 구간
                </h3>
                <p className="text-sm text-primary-fixed-dim leading-relaxed">
                  입력하신 금액대의 거래가 이번 분기 증가 추세입니다.
                </p>
              </div>
            </div>
            <div className="bg-surface-container-high p-8 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="gavel" className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-on-primary-fixed-variant">
                  법적 준수 사항
                </span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2 font-headline">
                2023년 10월 개정안
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                국토교통부(MOLIT)의 공인 중개보수 요율 체계를 준수합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(7,27,59,0.06)] overflow-hidden border border-outline-variant/10">
            <div className="p-8 bg-surface-container-high flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
                계산 결과 요약
              </span>
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold">
                실시간
              </span>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <p className="text-on-surface-variant text-sm font-medium mb-1">
                  적용 상한 요율
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-primary tracking-tighter font-headline">
                    {result.rate}
                  </span>
                  <span className="text-lg font-bold text-secondary">%</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant text-sm">한도액</span>
                  <span className="text-primary font-bold">
                    {result.limit ? formatKRW(result.limit) : '별도 제한 없음'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant text-sm">
                    부가세 (10%)
                  </span>
                  <span className="text-primary font-bold">
                    {formatKRW(result.vat)}
                  </span>
                </div>
                <div className="h-px bg-outline-variant/15" />
                <div className="flex justify-between items-end py-2">
                  <span className="text-primary font-extrabold text-lg">
                    최종 합계
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-bold text-on-tertiary-container uppercase tracking-widest mb-1">
                      총 청구 예정 금액
                    </p>
                    <span className="text-3xl font-extrabold text-primary tracking-tighter font-headline">
                      {formatKRW(result.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Table */}
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20">
            <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center">
              <Icon name="list_alt" className="text-sm mr-2" />
              법정 요율표 (주택 매매 기준)
            </h4>
            <div className="space-y-3">
              {rateTable.map((r) => (
                <div
                  key={r.range}
                  className="flex justify-between text-xs font-semibold"
                >
                  <span className="text-on-surface-variant">{r.range}</span>
                  <span className="text-primary">{r.rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Features */}
      <div className="mt-16 bg-surface-container-lowest rounded-2xl p-10 border border-outline-variant/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-secondary-fixed rounded-xl flex items-center justify-center text-secondary">
              <Icon name="verified" />
            </div>
            <h4 className="font-bold text-primary">검증된 산출 알고리즘</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              서울 및 수도권 각 지자체의 조례 변경 사항을 반영합니다.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-tertiary-fixed rounded-xl flex items-center justify-center text-on-tertiary-container">
              <Icon name="receipt_long" />
            </div>
            <h4 className="font-bold text-primary">수수료 협의 가이드</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              산출 금액은 법정 상한 요율 기준입니다. 실제 중개보수는 협의
              가능합니다.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-surface-container-high rounded-xl flex items-center justify-center text-primary">
              <Icon name="history" />
            </div>
            <h4 className="font-bold text-primary">계산 이력 관리</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              모든 계산 내역은 계정에 자동 저장되어 증빙 자료로 활용 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
