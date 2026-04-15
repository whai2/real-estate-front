import { useEffect } from 'react';
import { useDashboardStore } from '@/stores/dashboard.store';

export function useDashboard() {
  const {
    summary,
    hotRegions,
    recentTransactions,
    isLoading,
    error,
    fetchSummary,
    fetchHotRegions,
    fetchRecentTransactions,
  } = useDashboardStore();

  useEffect(() => {
    fetchSummary();
    fetchHotRegions();
    fetchRecentTransactions();
  }, [fetchSummary, fetchHotRegions, fetchRecentTransactions]);

  return { summary, hotRegions, recentTransactions, isLoading, error, fetchHotRegions };
}
