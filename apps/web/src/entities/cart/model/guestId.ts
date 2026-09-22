import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface GuestCartIdState {
  /** 서버가 첫 담기 응답으로 발급한 ID. 담은 적이 없으면 null */
  guestId: string | null;
  hasHydrated: boolean;
  setGuestId(guestId: string): void;
  clearGuestId(): void;
}

// localStorage 는 브라우저에만 있다. SSR 단계에서는 storage 를 undefined 로 두어
// 초기 상태 그대로 렌더링되게 한다 (useUserAuthStore 와 같은 방식).
const storage =
  typeof window !== "undefined"
    ? createJSONStorage(() => localStorage)
    : undefined;

/**
 * 게스트 장바구니의 주인을 가리키는 ID.
 *
 * 발급 경로가 담기 응답 하나뿐이라 응답마다 저장한다. 같은 값이면 상태를 갈아끼우지
 * 않는다 — 담을 때마다 새 참조를 만들면 이 값을 구독하는 화면이 매번 다시 그려진다.
 */
export const useGuestCartIdStore = create<GuestCartIdState>()(
  persist(
    (set) => ({
      guestId: null,
      hasHydrated: false,
      setGuestId: (guestId) =>
        set((state) => (state.guestId === guestId ? state : { guestId })),
      clearGuestId: () =>
        set((state) => (state.guestId === null ? state : { guestId: null })),
    }),
    {
      name: "guest-cart",
      storage,
      partialize: (state) => ({ guestId: state.guestId }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    },
  ),
);

export const useGuestCartId = () => useGuestCartIdStore((s) => s.guestId);

/**
 * persist 가 localStorage 복원을 끝냈는지. 복원 전에는 "게스트 카트가 없다" 와
 * "아직 모른다" 를 구분할 수 없으므로 화면은 이 값으로 기다린다.
 */
export const useGuestCartIdHydrated = () =>
  useGuestCartIdStore((s) => s.hasHydrated);
