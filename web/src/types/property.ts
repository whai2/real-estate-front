export type Trade = {
  type: 'sale' | 'investment' | 'jeonse' | 'monthly';
  price?: number;
  deposit?: number;
  monthlyRent?: number;
  commission?: {
    type: 'none' | 'single' | 'double';
    amount?: number;
  };
};

export type Property = {
  _id: string;
  title: string;
  address: string;
  detailAddress?: string;
  propertyType: string;
  type: 'open' | 'general';
  trades: Trade[];
  rooms?: number;
  bathrooms?: number;
  area?: number;
  status: 'active' | 'hidden' | 'completed' | 'deleted' | 'autoHide';
  score?: number;
  riskLevel?: 'danger' | 'caution' | 'safe';
  photos?: string[];
  memo?: string;
  groupId?: { _id: string; name: string };
  userId?: { _id: string; name: string; agencyName: string };
  createdAt: string;
  updatedAt: string;
  lastRefreshedAt?: string;
};

export type StatusCount = {
  _id: string;
  count: number;
};

export type MyPropertiesResponse = {
  properties: Property[];
  total: number;
  page: number;
  statusCounts: StatusCount[];
  typeCounts: StatusCount[];
};
