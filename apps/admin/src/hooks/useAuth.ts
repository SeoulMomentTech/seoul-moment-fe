import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthUser {
  id: number;
  email: string;
  name: string;
  [key: string]: unknown;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login(params: {
    accessToken: string;
    refreshToken?: string | null;
    user?: AuthUser | null;
  }): void;
  logout(): void;
  updateAccessToken(token: string | null): void;
  setUser(user: AuthUser | null): void;
  reset(): void;
}

const initialState: Pick<
  AuthState,
  "accessToken" | "refreshToken" | "user" | "isAuthenticated"
> = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
};

const storage =
  typeof window !== "undefined"
    ? createJSONStorage(() => localStorage)
    : undefined;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      login: ({ accessToken, refreshToken, user }) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
          user: user ?? state.user,
          isAuthenticated: true,
        })),
      logout: () => set(() => ({ ...initialState })),
      updateAccessToken: (token) =>
        set(() => ({
          accessToken: token,
          isAuthenticated: Boolean(token),
        })),
      setUser: (user) => set(() => ({ user })),
      reset: () => set(() => ({ ...initialState })),
    }),
    {
      name: "admin-auth",
      storage,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export const useAuth = () => {
  return useAuthStore();
};
