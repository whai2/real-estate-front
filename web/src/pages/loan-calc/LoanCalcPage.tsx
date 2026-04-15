import { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/Icon';

type RepaymentType = 'equal_payment' | 'equal_principal' | 'bullet';

function calculate(
  principal: number,
  annualRate: number,
  years: number,
  type: RepaymentType,
) {
  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  if (principal <= 0 || annualRate <= 0 || years <= 0) {
    return { monthly: 0, totalInterest: 0, totalPayment: 0, schedule: [] };
  }

  const schedule: {
    year: number;
    principalPaid: number;
    interestPaid: number;
    remaining: number;
    equityPercent: number;
  }[] = [];

  let totalInterest = 0;
  let monthly = 0;

  if (type === 'equal_payment') {
    // 원리금 균등
    monthly =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    let remaining = principal;
    for (let y = 1; y <= years; y++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      for (let m = 0; m < 12; m++) {
        const interest = remaining * monthlyRate;
        const principalPart = monthly - interest;
        yearInterest += interest;
        yearPrincipal += principalPart;
        remaining -= principalPart;
      }
      totalInterest += yearInterest;
      schedule.push({
        year: y,
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        remaining: Math.max(0, remaining),
        equityPercent: ((principal - Math.max(0, remaining)) / principal) * 100,
      });
    }
  } else if (type === 'equal_principal') {
    // 원금 균등
    const monthlyPrincipal = principal / months;
    let remaining = principal;
    for (let y = 1; y <= years; y++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      for (let m = 0; m < 12; m++) {
        const interest = remaining * monthlyRate;
        yearInterest += interest;
        yearPrincipal += monthlyPrincipal;
        remaining -= monthlyPrincipal;
      }
      totalInterest += yearInterest;
      schedule.push({
        year: y,
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        remaining: Math.max(0, remaining),
        equityPercent: ((principal - Math.max(0, remaining)) / principal) * 100,
      });
    }
    monthly = principal / months + principal * monthlyRate; // 첫 달 기준
  } else {
    // 만기 일시
    monthly = principal * monthlyRate;
    totalInterest = monthly * months;
    for (let y = 1; y <= years; y++) {
      schedule.push({
        year: y,
        principalPaid: y === years ? principal : 0,
        interestPaid: monthly * 12,
        remaining: y === years ? 0 : principal,
        equityPercent: y === years ? 100 : 0,
      });
    }
  }

  return {
    monthly,
    totalInterest,
    totalPayment: principal + totalInterest,
    schedule,
  };
}

function formatKRW(n: number): string {
  if (n >= 100000000) {
    const uk = Math.floor(n / 100000000);
    const man = Math.floor((n % 100000000) / 10000);
    return man > 0 ? `${uk}억 ${man.toLocaleString()}만원` : `${uk}억원`;
  }
  if (n >= 10000) return `${Math.floor(n / 10000).toLocaleString()}만원`;
  return `${Math.floor(n).toLocaleString()}원`;
}

const repaymentTypes: { key: RepaymentType; label: string }[] = [
  { key: 'equal_payment', label: '원리금 균등' },
  { key: 'equal_principal', label: '원금 균등' },
  { key: 'bullet', label: '만기 일시' },
];

export default function LoanCalcPage() {
  const [principal, setPrincipal] = useState('245000000');
  const [rate, setRate] = useState('4.75');
  const [years, setYears] = useState('25');
  const [repayType, setRepayType] = useState<RepaymentType>('equal_payment');

  const result = useMemo(
    () =>
      calculate(
        Number(principal) || 0,
        Number(rate) || 0,
        Number(years) || 0,
        repayType,
      ),
    [principal, rate, years, repayType],
  );

  const displaySchedule = result.schedule.filter(
    (s) => s.year === 1 || s.year === 5 || s.year === 10 || s.year === Number(years),
  );

  return (
    <>
      {/* Hero */}
      <div className="mb-12 flex items-end justify-between">
        <div>
          <h2 className="text-5xl font-headline font-extrabold text-primary tracking-tighter mb-2">
            대출 계산기
          </h2>
          <p className="text-on-surface-variant max-w-lg">
            원금, 이자 및 상환 일정을 정밀하게 산출합니다.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Input */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_40px_rgba(7,27,59,0.04)]">
            <h3 className="font-headline font-bold text-lg text-primary mb-8 flex items-center gap-2">
              <Icon name="tune" className="text-secondary" />
              대출 조건 설정
            </h3>
            <div className="space-y-8">
              {/* Amount */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    총 대출 금액
                  </label>
                  <span className="text-secondary font-bold font-headline">
                    {formatKRW(Number(principal) || 0)}
                  </span>
                </div>
                <div className="relative flex items-center bg-surface-container-low rounded-lg px-4 py-4 focus-within:bg-surface-container-lowest focus-within:ring-1 focus-within:ring-secondary transition-all">
                  <span className="text-slate-400 mr-3">₩</span>
                  <input
                    className="w-full bg-transparent border-none focus:ring-0 font-headline font-bold text-xl text-primary"
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    { label: '5천만', value: 50000000 },
                    { label: '1억', value: 100000000 },
                    { label: '2억', value: 200000000 },
                    { label: '3억', value: 300000000 },
                    { label: '5억', value: 500000000 },
                    { label: '10억', value: 1000000000 },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPrincipal(String(opt.value))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        Number(principal) === opt.value
                          ? 'bg-primary text-white'
                          : 'bg-surface-container-high text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate & Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-3">
                    연 이자율 (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRate((prev) => Math.max(0, Number(prev) - 0.1).toFixed(1))}
                      className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors shrink-0"
                    >
                      <Icon name="remove" className="text-lg" />
                    </button>
                    <div className="flex-1 bg-surface-container-low rounded-lg px-4 py-4 focus-within:ring-1 focus-within:ring-secondary transition-all">
                      <input
                        className="w-full bg-transparent border-none focus:ring-0 font-headline font-bold text-xl text-primary text-center"
                        type="text"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => setRate((prev) => (Number(prev) + 0.1).toFixed(1))}
                      className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors shrink-0"
                    >
                      <Icon name="add" className="text-lg" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['2.0', '3.0', '3.5', '4.0', '4.5', '5.0'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRate(r)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          rate === r
                            ? 'bg-primary text-white'
                            : 'bg-surface-container-high text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        {r}%
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-3">
                    대출 기간 (년)
                  </label>
                  <div className="bg-surface-container-low rounded-lg px-4 py-4 focus-within:ring-1 focus-within:ring-secondary transition-all">
                    <input
                      className="w-full bg-transparent border-none focus:ring-0 font-headline font-bold text-xl text-primary"
                      type="number"
                      value={years}
                      onChange={(e) => setYears(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      { label: '1년', value: '1' },
                      { label: '5년', value: '5' },
                      { label: '10년', value: '10' },
                      { label: '20년', value: '20' },
                      { label: '30년', value: '30' },
                      { label: '40년', value: '40' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setYears(opt.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          years === opt.value
                            ? 'bg-primary text-white'
                            : 'bg-surface-container-high text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Repayment Type */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-4">
                  상환 방식
                </label>
                <div className="flex p-1.5 bg-surface-container-low rounded-xl">
                  {repaymentTypes.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setRepayType(t.key)}
                      className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${
                        repayType === t.key
                          ? 'bg-surface-container-lowest text-primary shadow-sm'
                          : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Results */}
        <div className="col-span-12 lg:col-span-7">
          <div className="grid grid-cols-2 gap-6">
            {/* Monthly */}
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-[0_12px_40px_rgba(7,27,59,0.04)] relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-6">
                월 상환액
              </h4>
              <p className="text-4xl font-headline font-extrabold text-primary tracking-tighter mb-2">
                {formatKRW(result.monthly)}
              </p>
              <p className="text-sm text-secondary font-semibold flex items-center gap-1">
                <Icon name="verified" className="text-sm" />
                {repaymentTypes.find((t) => t.key === repayType)?.label} 기준
              </p>
            </div>

            {/* Total Interest */}
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-[0_12px_40px_rgba(7,27,59,0.04)] relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-tertiary-fixed-dim/10 rounded-full blur-3xl" />
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-6">
                총 납입 이자
              </h4>
              <p className="text-4xl font-headline font-extrabold text-primary tracking-tighter mb-2">
                {formatKRW(result.totalInterest)}
              </p>
              <p className="text-sm text-on-tertiary-container font-semibold flex items-center gap-1">
                <Icon name="warning" className="text-sm" />
                원금의 약{' '}
                {Number(principal) > 0
                  ? ((result.totalInterest / Number(principal)) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>

            {/* Summary */}
            <div className="col-span-2 bg-surface-container-low rounded-xl p-8">
              <div className="grid grid-cols-3 gap-8">
                <div className="border-l border-outline-variant/30 pl-4">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                    1년차 원금 상환
                  </p>
                  <p className="text-xl font-headline font-bold text-primary">
                    {result.schedule[0]
                      ? formatKRW(result.schedule[0].principalPaid)
                      : '-'}
                  </p>
                </div>
                <div className="border-l border-outline-variant/30 pl-4">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                    총 상환 예정액
                  </p>
                  <p className="text-xl font-headline font-bold text-primary">
                    {formatKRW(result.totalPayment)}
                  </p>
                </div>
                <div className="border-l border-outline-variant/30 pl-4">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                    상환 완료 예정
                  </p>
                  <p className="text-xl font-headline font-bold text-primary">
                    {Number(years) > 0
                      ? `${new Date().getFullYear() + Number(years)}년`
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Table */}
      {displaySchedule.length > 0 && (
        <div className="mt-16">
          <h3 className="font-headline font-bold text-2xl text-primary mb-8">
            상환 상세 타임라인
          </h3>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_12px_40px_rgba(7,27,59,0.04)] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high">
                <tr>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    기간
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    원금 상환액
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    이자 상환액
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    잔금
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    자산 지분율
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {displaySchedule.map((row) => (
                  <tr
                    key={row.year}
                    className="hover:bg-surface-bright transition-colors"
                  >
                    <td className="px-8 py-5 font-headline font-bold text-primary">
                      {row.year}년차
                    </td>
                    <td className="px-8 py-5 text-on-surface-variant">
                      {formatKRW(row.principalPaid)}
                    </td>
                    <td className="px-8 py-5 text-on-surface-variant">
                      {formatKRW(row.interestPaid)}
                    </td>
                    <td className="px-8 py-5 text-on-surface-variant font-semibold">
                      {formatKRW(row.remaining)}
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-surface-container-highest text-secondary text-[10px] font-bold px-2 py-1 rounded uppercase">
                        {row.equityPercent.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
