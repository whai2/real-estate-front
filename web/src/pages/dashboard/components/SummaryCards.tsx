import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import type { DashboardSummary } from '@/types/dashboard';

type SummaryCardsProps = {
  summary: DashboardSummary | null;
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: '전체 관리 매물',
      icon: 'apartment',
      iconColor: 'text-primary',
      value: summary?.total ?? 0,
      valueColor: 'text-primary',
      sub: <span className="text-secondary text-xs font-bold">전월 대비 +12% 증가</span>,
    },
    {
      label: '위험 관리 구역',
      icon: 'warning',
      iconColor: 'text-error',
      value: summary?.danger ?? 0,
      valueColor: 'text-error',
      sub: <Badge variant="danger">고위험군</Badge>,
    },
    {
      label: '주의 관리 구역',
      icon: 'report_problem',
      iconColor: 'text-on-tertiary-container',
      value: summary?.caution ?? 0,
      valueColor: 'text-on-tertiary-container',
      sub: <Badge variant="warning">주의 필요</Badge>,
    },
    {
      label: '안전 관리 구역',
      icon: 'verified_user',
      iconColor: 'text-secondary',
      value: summary?.safe ?? 0,
      valueColor: 'text-secondary',
      sub: <Badge variant="safe">검증 완료</Badge>,
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card key={card.label}>
          <div className="flex justify-between items-start mb-4">
            <p className="text-on-surface-variant font-label text-xs font-bold uppercase tracking-widest">
              {card.label}
            </p>
            <Icon name={card.icon} className={card.iconColor} />
          </div>
          <p className={`text-3xl font-black font-headline mb-2 ${card.valueColor}`}>
            {card.value.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">{card.sub}</div>
        </Card>
      ))}
    </section>
  );
}
