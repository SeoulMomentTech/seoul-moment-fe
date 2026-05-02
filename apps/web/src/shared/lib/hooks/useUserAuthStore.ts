import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface UserAuthUser {
  id: number;
  email: string;
  [key: string]: unknown;
}

interface UserAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserAuthUser | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login(params: {
    accessToken: string;
    refreshToken?: string | null;
    user?: UserAuthUser | null;
  }): void;
  logout(): void;
  updateAccessToken(token: string | null): void;
  setUser(user: UserAuthUser | null): void;
}

const initialState: Pick<
  UserAuthState,
  "accessToken" | "refreshToken" | "user" | "isAuthenticated"
> = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
};

// localStorage 는 브라우저에서만 접근 가능. SSR 단계(typeof window === "undefined")
// 에서는 storage 를 undefined 로 두어 초기 상태 그대로 렌더링되게 한다.
const storage =
  typeof window !== "undefined"
    ? createJSONStorage(() => localStorage)
    : undefined;

export const useUserAuthStore = create<UserAuthState>()(
  persist(
    (set) => ({
      ...initialState,
      hasHydrated: false,
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
    }),
    {
      name: "user-auth",
      storage,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    },
  ),
);

/**
 * persist 미들웨어가 localStorage 로부터 rehydrate 를 끝냈는지 여부.
 * SSR 첫 렌더에서는 false, 클라이언트 hydration 이후 true 가 된다.
 * 헤더 등 인증 상태에 따라 다르게 그려지는 컴포넌트는 이 값으로 보호한다.
 */
export const useUserAuthHydrated = () => useUserAuthStore((s) => s.hasHydrated);
