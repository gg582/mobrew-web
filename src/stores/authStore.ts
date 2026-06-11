import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, setTokens, clearTokens } from '@/infrastructure/api/apiClient';

interface AuthUser {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthActions {
  register: (email: string, password: string, username?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  migrateGuestData: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setGuest: (value: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isGuest: true,
      isAuthenticated: false,
      loading: false,

      register: async (email, password, username) => {
        set({ loading: true });
        try {
          const res = await apiClient.post('/auth/register', {
            email,
            password,
            username: username ?? email.split('@')[0],
          });
          const { accessToken, refreshToken, user } = res.data;
          setTokens(accessToken, refreshToken);
          set({
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
            },
            token: accessToken,
            isGuest: false,
            isAuthenticated: true,
          });
        } finally {
          set({ loading: false });
        }
      },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await apiClient.post('/auth/login', { email, password });
          const { accessToken, refreshToken, user } = res.data;
          setTokens(accessToken, refreshToken);
          set({
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
            },
            token: accessToken,
            isGuest: false,
            isAuthenticated: true,
          });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch {
          // ignore server errors on logout
        }
        clearTokens();
        set({ user: null, token: null, isGuest: true, isAuthenticated: false });
      },

      migrateGuestData: async () => {
        const { user } = get();
        if (!user) return;
        set({ loading: true });
        try {
          await apiClient.post('/auth/migrate', { userId: user.id });
        } finally {
          set({ loading: false });
        }
      },

      checkAuth: async () => {
        const accessToken = localStorage.getItem('mobrew_access_token');
        if (!accessToken) {
          set({ user: null, token: null, isGuest: true, isAuthenticated: false });
          return;
        }
        set({ loading: true });
        try {
          const res = await apiClient.get('/auth/me');
          const user = res.data.user as AuthUser;
          set({
            user,
            token: accessToken,
            isGuest: false,
            isAuthenticated: true,
          });
        } catch {
          clearTokens();
          set({ user: null, token: null, isGuest: true, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },

      setGuest: (value) => set({ isGuest: value }),
    }),
    {
      name: 'mobrew_auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isGuest: state.isGuest,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

window.addEventListener('mobrew:auth:logout', () => {
  clearTokens();
  useAuthStore.setState({ user: null, token: null, isGuest: true, isAuthenticated: false });
});
