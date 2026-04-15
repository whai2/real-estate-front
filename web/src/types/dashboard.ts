export type DashboardSummary = {
  total: number;
  danger: number;
  caution: number;
  safe: number;
};

export type HotRegion = {
  rank: number;
  region: string;
  totalTrades: number;
  rankChange: number;
  trend: 'up' | 'down' | 'stable';
};

export type HotRegionsResponse = {
  regions: HotRegion[];
  updatedAt: string;
  period: string;
};

export type Transaction = {
  _id: string;
  title: string;
  address: string;
  price: string;
  riskLevel: 'danger' | 'caution' | 'safe';
  updatedAt: string;
};
