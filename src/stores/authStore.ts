import { create } from 'zustand';
import { Platform } from 'react-native';

type Subscription = {
  plan: string;
  expiresAt: string;
  points: number;
  pinCount: number;
  pushCount: number;
};

type User = {
  _id: string;
  phone: string;
  name: string;
  agencyName: string;
  licenseNo?: string;
  businessCardUrl?: string;
  isApproved: boolean;
  subscription: Subscription;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
};

const STORAGE_KEY = 'auth-storage';

function loadPersistedState(): Partial<AuthState> {
  if (Platform.OS !== 'web') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        token: parsed.token ?? null,
        user: parsed.user ?? null,
        isAuthenticated: !!parsed.token,
      };
    }
  } catch {}
  return {};
}

function saveState(state: { token: string | null; user: User | null }) {
  if (Platform.OS !== 'web') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: state.token, user: state.user }));
  } catch {}
}

const persisted = loadPersistedState();

export const useAuthStore = create<AuthState>()((set) => ({
  token: persisted.token ?? null,
  user: persisted.user ?? null,
  isAuthenticated: persisted.isAuthenticated ?? false,
  setAuth: (token, user) => {
    saveState({ token, user });
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    saveState({ token: null, user: null });
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
