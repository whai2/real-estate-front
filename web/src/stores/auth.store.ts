import { create } from 'zustand';
import type { AuthState, User } from '@/types/auth';

const STORAGE_KEY = 'auth-storage';

function loadPersistedState(): Partial<AuthState> {
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
  } catch {
    // ignore
  }
  return {};
}

function saveState(state: { token: string | null; user: User | null }) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: state.token, user: state.user }),
    );
  } catch {
    // ignore
  }
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
