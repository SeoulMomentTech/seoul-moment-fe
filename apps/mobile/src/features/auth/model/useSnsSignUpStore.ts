import { create } from "zustand";

/**
 * 가입 화면으로 넘길 것. 두 상태가 **배타적**이다 — signupToken 이 있으면 바로 가입할 수
 * 있고, emailToken 뿐이면 이메일을 먼저 받아 인증해야 한다. 한 객체에 둘 다 담으면
 * 화면이 어느 쪽인지 매번 다시 따져야 하므로 kind 로 가른다.
 */
export type SnsSignUpContext =
  | { kind: "ready"; signupToken: string; email?: string; name?: string }
  | { kind: "emailPending"; emailToken: string };

interface SnsSignUpState {
  context: SnsSignUpContext | null;
  set(context: SnsSignUpContext): void;
  clear(): void;
}

/**
 * 짧은 토큰이라 **저장하지 않는다**. 로그인 세션(useUserAuthStore)과 달리 SecureStore 에
 * 남기지 않고 메모리에만 둔다 — 앱을 껐다 켜면 그 토큰은 어차피 만료돼 있고, 남아 있으면
 * 가입 화면이 쓸 수 없는 토큰을 들고 열린다.
 */
export const useSnsSignUpStore = create<SnsSignUpState>()((set) => ({
  context: null,
  set: (context) => set({ context }),
  clear: () => set({ context: null }),
}));
