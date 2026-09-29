import { create } from "zustand";

import { tokenStorage } from "./tokenStorage";
import { decodeJWT } from "../utils/decodeJWT";

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
  id: number;
  exp: number;
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
  "accessToken" | "refreshToken" | "user" | "isAuthenticated" | "id" | "exp"
> = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  id: 0,
  exp: 0,
};

const readClaims = (token: string | null) => {
  if (!token) return { id: 0, exp: 0 };
  const payload = decodeJWT(token);
  return { id: payload?.id ?? 0, exp: payload?.exp ?? 0 };
};

/**
 * web 은 zustand persist + localStorage 로 동기 rehydrate 하지만, SecureStore 는 비동기라
 * persist 대신 토큰만 직접 저장·복원한다. user 는 저장하지 않고 로그인 후 API 로 다시 받는다.
 * 저장 실패는 메모리 상태를 되돌리지 않는다 — 이번 세션은 유지되고 다음 실행에서 재로그인될 뿐이다.
 */
export const useUserAuthStore = create<UserAuthState>()((set, get) => {
  const persistTokens = () => {
    const { accessToken, refreshToken } = get();
    void tokenStorage.save({ accessToken, refreshToken }).catch(() => {});
  };

  return {
    ...initialState,
    hasHydrated: false,
    login: ({ accessToken, refreshToken, user }) => {
      set((state) => ({
        accessToken,
        refreshToken: refreshToken ?? state.refreshToken,
        user: user ?? state.user,
        isAuthenticated: true,
        ...readClaims(accessToken),
      }));
      persistTokens();
    },
    logout: () => {
      set(() => ({ ...initialState }));
      void tokenStorage.clear().catch(() => {});
    },
    updateAccessToken: (token) => {
      set(() => ({
        accessToken: token,
        isAuthenticated: Boolean(token),
        ...readClaims(token),
      }));
      persistTokens();
    },
    setUser: (user) => set(() => ({ user })),
  };
});

let hydration: Promise<void> | null = null;

/**
 * SecureStore 에서 토큰을 한 번만 복원한다. 여러 곳에서 불러도 같은 Promise 를 공유하므로
 * api 의 beforeRequest 가 이걸 기다리면 앱 시작 직후 요청에도 토큰이 빠지지 않는다.
 */
export const hydrateUserAuth = () => {
  hydration ??= tokenStorage
    .load()
    .then(({ accessToken, refreshToken }) => {
      // 복원이 끝나기 전에 login 이 먼저 일어났다면 그 상태를 덮어쓰지 않는다.
      if (useUserAuthStore.getState().accessToken) return;
      if (!accessToken && !refreshToken) return;

      useUserAuthStore.setState({
        accessToken,
        refreshToken,
        isAuthenticated: Boolean(accessToken),
        ...readClaims(accessToken),
      });
    })
    .catch(() => {})
    .finally(() => {
      useUserAuthStore.setState({ hasHydrated: true });
    });

  return hydration;
};

export const useUserAuthHydrated = () => useUserAuthStore((s) => s.hasHydrated);
