export type Subscription = {
  plan: string;
  expiresAt: string;
  points: number;
  pinCount: number;
  pushCount: number;
};

export type UserType = 'broker' | 'assistant' | 'fieldManager' | 'consultant' | 'owner';

export type User = {
  _id: string;
  phone: string;
  name: string;
  agencyName: string;
  licenseNo?: string;
  userType?: UserType;
  businessCardUrl?: string;
  isApproved: boolean;
  subscription: Subscription;
};

export type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
};
