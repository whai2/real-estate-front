import { useState } from 'react';
import { SummaryCards } from './components/SummaryCards';
import { RiskFilterTabs } from './components/RiskFilterTabs';
import { TransactionFilters } from './components/TransactionFilters';
import { RecentTransactions } from './components/RecentTransactions';
import { TransactionChangeList } from './components/TransactionChangeList';
import { InteractiveMap } from './components/InteractiveMap';
import { HotRegionsTable } from './components/HotRegionsTable';
import { PropertyDetailPanel } from './components/PropertyDetailPanel';
import { MobileBentoStats } from './components/MobileBentoStats';
import { MobileHotplaces } from './components/MobileHotplaces';
import { MobileRecentTransactions } from './components/MobileRecentTransactions';
import { useDashboard } from '@/hooks/use-dashboard';
import type { Transaction } from '@/types/dashboard';

type RiskLevel = 'all' | 'danger' | 'caution' | 'safe';

export default function DashboardPage() {
  const { summary, hotRegions, recentTransactions, fetchHotRegions } = useDashboard();
  const [riskFilter, setRiskFilter] = useState<RiskLevel>('all');
  const [selectedProperty, setSelectedProperty] = useState<Transaction | null>(null);

  const filteredTransactions =
    riskFilter === 'all'
      ? recentTransactions
      : recentTransactions.filter((tx) => tx.riskLevel === riskFilter);

  return (
    <>
      {/* ── Mobile Layout (lg 미만) ── */}
      <div className="lg:hidden space-y-8">
        <MobileBentoStats summary={summary} />
        <MobileHotplaces regions={hotRegions} />
        <MobileRecentTransactions transactions={recentTransactions} />
      </div>

      {/* ── Desktop Layout (lg 이상) ── */}
      <div className="hidden lg:block space-y-8">
        {/* 1. Summary Cards */}
        <SummaryCards summary={summary} />

        {/* 2. Risk Filter Tabs */}
        <RiskFilterTabs
          summary={summary}
          activeFilter={riskFilter}
          onFilterChange={setRiskFilter}
        />

        {/* 3. Transactions, Map & Detail Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <TransactionFilters />
            <RecentTransactions
              transactions={filteredTransactions}
              onSelectProperty={setSelectedProperty}
            />
            <TransactionChangeList transactions={filteredTransactions} />
          </div>

          {selectedProperty ? (
            <div className="lg:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InteractiveMap />
              <PropertyDetailPanel
                property={selectedProperty}
                onClose={() => setSelectedProperty(null)}
              />
            </div>
          ) : (
            <InteractiveMap />
          )}
        </section>

        {/* 4. Hot Transaction Regions */}
        <HotRegionsTable
          regions={hotRegions}
          onRegionFilter={(region) => fetchHotRegions(region)}
        />
      </div>
    </>
  );
}
