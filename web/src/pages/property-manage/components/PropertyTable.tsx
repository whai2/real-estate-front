import { Icon } from '@/components/ui/Icon';
import type { Property } from '@/types/property';

type PropertyTableProps = {
  properties: Property[];
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onOpenMemo?: (property: Property) => void;
  onOpenGroupAssign?: (propertyIds: string[]) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
};

const defaultBadge = { bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: '진행중' };

const statusBadgeMap: Record<string, { bg: string; text: string; label: string }> = {
  active: defaultBadge,
  hidden: { bg: 'bg-surface-container-highest', text: 'text-on-surface', label: '숨김' },
  completed: { bg: 'bg-surface-container-highest', text: 'text-on-surface', label: '거래 종료' },
  autoHide: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-container', label: '업데이트 필요' },
  deleted: { bg: 'bg-error-container', text: 'text-error', label: '삭제됨' },
};

function getStatusBadge(status: string) {
  return statusBadgeMap[status] ?? defaultBadge;
}

function getTypeIcon(propertyType: string) {
  const icons: Record<string, string> = {
    apartment: 'apartment',
    villa: 'home_work',
    officetel: 'location_city',
    house: 'cottage',
  };
  return icons[propertyType] ?? 'domain';
}


function formatPrice(trades: Property['trades']): string {
  if (!trades || trades.length === 0) return '-';
  const trade = trades[0];
  if (trade?.price) return `${(trade.price / 10000).toLocaleString()}만원`;
  if (trade?.deposit && trade?.monthlyRent)
    return `${(trade.deposit / 10000).toLocaleString()}/${trade.monthlyRent.toLocaleString()}`;
  return '-';
}

function formatCommission(trades: Property['trades']): string {
  if (!trades || trades.length === 0 || !trades[0]?.commission) return '-';
  const c = trades[0].commission;
  if (c.type === 'none') return '없음';
  if (c.amount) return `${c.amount.toLocaleString()}원`;
  return c.type === 'single' ? '단타' : '양타';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function PropertyTable({
  properties,
  onUpdateStatus,
  onDelete,
  onOpenMemo,
  onOpenGroupAssign,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
}: PropertyTableProps) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(7,27,59,0.06)] border border-outline-variant/15">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-high">
            <tr>
              <th className="p-5 w-12">
                <input
                  className="rounded border-outline-variant text-secondary focus:ring-secondary"
                  type="checkbox"
                  checked={selectedIds.length === properties.length && properties.length > 0}
                  onChange={() => onToggleSelectAll?.()}
                />
              </th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.05em] font-bold text-on-surface-variant">
                유형
              </th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.05em] font-bold text-on-surface-variant">
                매물 상세
              </th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.05em] font-bold text-on-surface-variant">
                소재지
              </th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.05em] font-bold text-on-surface-variant">
                스펙
              </th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.05em] font-bold text-on-surface-variant">
                매매가/임대료
              </th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.05em] font-bold text-on-surface-variant">
                수수료
              </th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.05em] font-bold text-on-surface-variant">
                그룹
              </th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.05em] font-bold text-on-surface-variant">
                상태
              </th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.05em] font-bold text-on-surface-variant">
                업데이트일
              </th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.05em] font-bold text-on-surface-variant text-right">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {properties.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-12 text-center text-on-surface-variant">
                  등록된 매물이 없습니다.
                </td>
              </tr>
            ) : (
              properties.map((prop) => {
                const badge = getStatusBadge(prop.status);
                const isInactive =
                  prop.status === 'completed' || prop.status === 'hidden';
                const iconName = getTypeIcon(prop.propertyType);

                return (
                  <tr
                    key={prop._id}
                    className={`hover:bg-surface-bright transition-colors group ${isInactive ? 'opacity-60' : ''}`}
                  >
                    <td className="p-5">
                      <input
                        className="rounded border-outline-variant text-secondary focus:ring-secondary"
                        type="checkbox"
                        checked={selectedIds.includes(prop._id)}
                        onChange={() => onToggleSelect?.(prop._id)}
                      />
                    </td>
                    <td className="p-5">
                      <div className="bg-surface-container-high p-2 rounded-lg w-fit">
                        <Icon
                          name={iconName}
                          className="text-primary text-xl"
                        />
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">
                          {prop.title}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          ID: {prop._id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 max-w-[200px]">
                      <span className="text-sm text-on-surface-variant truncate block">
                        {prop.address}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-medium">
                        방 {prop.rooms ?? '-'} / 욕실 {prop.bathrooms ?? '-'}
                        {prop.area ? ` • ${prop.area}평` : ''}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-bold text-primary">
                        {formatPrice(prop.trades)}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-medium text-secondary">
                        {formatCommission(prop.trades)}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-sm text-on-surface-variant">
                        {prop.groupId?.name ?? '미지정'}
                      </span>
                    </td>
                    <td className="p-5">
                      <span
                        className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-xs text-on-surface-variant">
                        {formatDate(prop.updatedAt)}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onOpenMemo?.(prop)}
                          className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant"
                          title="관리 메모"
                        >
                          <Icon name="sticky_note_2" className="text-lg" />
                        </button>
                        <button
                          className="p-2 hover:bg-surface-container-high rounded-lg text-primary-container"
                          title="수정"
                        >
                          <Icon name="edit" className="text-lg" />
                        </button>
                        {prop.status === 'active' ? (
                          <button
                            onClick={() => onUpdateStatus(prop._id, 'hidden')}
                            className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant"
                            title="숨김"
                          >
                            <Icon name="visibility_off" className="text-lg" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateStatus(prop._id, 'active')}
                            className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant"
                            title="공개 전환"
                          >
                            <Icon name="visibility" className="text-lg" />
                          </button>
                        )}
                        {prop.status !== 'completed' && (
                          <button
                            onClick={() =>
                              onUpdateStatus(prop._id, 'completed')
                            }
                            className="p-2 hover:bg-surface-container-high rounded-lg text-secondary"
                            title="완료 처리"
                          >
                            <Icon name="check_circle" className="text-lg" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(prop._id)}
                          className="p-2 hover:bg-error-container/20 rounded-lg text-error"
                          title="삭제"
                        >
                          <Icon name="delete" className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Footer */}
      <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-t border-outline-variant/10">
        <span className="text-xs text-on-surface-variant font-medium">
          전체 {properties.length}개 매물 표시
        </span>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-surface-container-high disabled:opacity-30">
            <Icon name="chevron_left" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-bold">
            1
          </button>
          <button className="p-2 rounded-lg hover:bg-surface-container-high">
            <Icon name="chevron_right" />
          </button>
        </div>
      </div>
    </div>
  );
}
