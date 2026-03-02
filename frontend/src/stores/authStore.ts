import { create } from 'zustand';
import { User } from '@/types';
import { api } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  login: (token: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  login: async (token: string) => {
    api.setToken(token);
    try {
      const user = await api.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
      // Connect WebSocket after login
      connectSocket(user.id);
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    api.clearToken();
    disconnectSocket();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  fetchUser: async () => {
    try {
      const user = await api.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
      connectSocket(user.id);
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));