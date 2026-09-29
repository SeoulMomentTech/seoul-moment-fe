import type { StoredTokens } from "./tokenStorage";

/**
 * expo-secure-store 는 web 구현이 없다. web 타깃은 개발 확인용이므로
 * 메모리에만 들고 있고, 새로고침하면 로그아웃된다.
 */
let memory: StoredTokens = { accessToken: null, refreshToken: null };

export type { StoredTokens };

export const tokenStorage = {
  load: async (): Promise<StoredTokens> => memory,
  save: async (tokens: StoredTokens) => {
    memory = tokens;
  },
  clear: async () => {
    memory = { accessToken: null, refreshToken: null };
  },
};
