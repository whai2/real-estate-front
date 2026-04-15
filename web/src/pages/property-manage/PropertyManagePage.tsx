import { useState, useCallback } from 'react';
import { useProperties } from '@/hooks/use-properties';
import { PageHeader } from './components/PageHeader';
import { AutoHideBanner } from './components/AutoHideBanner';
import { FilterTabs } from './components/FilterTabs';
import { PropertyTable } from './components/PropertyTable';
import { MobilePropertyList } from './components/MobilePropertyList';
import { GroupManager } from './components/GroupManager';
import { GroupAssignModal } from './components/GroupAssignModal';
import { MemoModal } from './components/MemoModal';
import type { Property } from '@/types/property';

export default function PropertyManagePage() {
  const {
    properties,
    total,
    statusCounts,
    statusFilter,
    setStatusFilter,
    updateStatus,
    deleteProperty,
    batchRefresh,
    fetchMyProperties,
  } = useProperties();

  const autoHideCount =
    statusCounts.find((c) => c._id === 'autoHide')?.count ?? 0;

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === properties.length
        ? []
        : properties.map((p) => p._id),
    );
  }, [properties]);

  // Group manager modal
  const [showGroupManager, setShowGroupManager] = useState(false);

  // Group assign modal
  const [showGroupAssign, setShowGroupAssign] = useState(false);
  const [assignPropertyIds, setAssignPropertyIds] = useState<string[]>([]);

  function openGroupAssign(ids: string[]) {
    setAssignPropertyIds(ids);
    setShowGroupAssign(true);
  }

  // Memo modal
  const [memoTarget, setMemoTarget] = useState<Property | null>(null);

  return (
    <>
      {/* ── Mobile Layout ── */}
      <div className="lg:hidden">
        <MobilePropertyList
          properties={properties}
          statusCounts={statusCounts}
          total={total}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          onUpdateStatus={updateStatus}
          onDelete={deleteProperty}
        />
      </div>

      {/* ── Desktop Layout ── */}
      <div className="hidden lg:block space-y-8">
        <PageHeader
          onBatchRefresh={batchRefresh}
          onOpenGroupManager={() => setShowGroupManager(true)}
          selectedIds={selectedIds}
          onOpenGroupAssign={openGroupAssign}
        />
        <AutoHideBanner count={autoHideCount} />
        <FilterTabs
          statusCounts={statusCounts}
          total={total}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />
        <PropertyTable
          properties={properties}
          onUpdateStatus={updateStatus}
          onDelete={deleteProperty}
          onOpenMemo={(prop) => setMemoTarget(prop)}
          onOpenGroupAssign={(ids) => openGroupAssign(ids)}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
        />
      </div>

      {/* ── Modals ── */}
      <GroupManager
        open={showGroupManager}
        onClose={() => setShowGroupManager(false)}
        onGroupsChange={() => fetchMyProperties()}
      />
      <GroupAssignModal
        open={showGroupAssign}
        propertyIds={assignPropertyIds}
        onClose={() => setShowGroupAssign(false)}
        onAssigned={() => {
          setSelectedIds([]);
          fetchMyProperties();
        }}
      />
      {memoTarget && (
        <MemoModal
          open={!!memoTarget}
          propertyId={memoTarget._id}
          propertyTitle={memoTarget.title}
          initialMemo={memoTarget.memo ?? ''}
          onClose={() => setMemoTarget(null)}
          onSaved={() => fetchMyProperties()}
        />
      )}
    </>
  );
}
