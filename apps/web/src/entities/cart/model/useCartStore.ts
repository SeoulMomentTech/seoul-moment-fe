import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AddCartLinesResult, CartLine, CartLineDraft } from "./types";
import { createCartLineId } from "../lib/cartLineId";

/** 한 라인의 수량 상한. 서버에 재고/최대주문수량 필드가 없어 클라이언트 상수로만 둔다. */
export const MAX_LINE_QUANTITY = 99;
/** localStorage 무한 증가 방지 */
export const MAX_CART_LINES = 100;

interface CartState {
  lines: CartLine[];
  /**
   * 이 장바구니의 주인. 저장은 로컬인데 접근은 로그인 필수라서, 다른 계정으로 로그인했을 때
   * 이전 사용자의 장바구니가 보이면 안 된다. persist `name` 은 스토어 생성 시 고정이라
   * `cart:${userId}` 로 쪼갤 수 없어 상태에 주인을 들고 있는다. `useCartOwnerGuard` 가 감시한다.
   */
  ownerId: number;
  hasHydrated: boolean;

  addLines(drafts: ReadonlyArray<CartLineDraft>): AddCartLinesResult;
  updateQuantity(lineId: string, quantity: number): void;
  removeLines(lineIds: ReadonlyArray<string>): void;
  restoreLines(lines: ReadonlyArray<CartLine>): void;
  clear(): void;
  setOwner(ownerId: number): void;
}

const initialState = {
  lines: [] as CartLine[],
  ownerId: 0,
};

const clampQuantity = (quantity: number) =>
  Math.min(Math.max(Math.trunc(quantity), 1), MAX_LINE_QUANTITY);

// localStorage 는 브라우저에서만 접근 가능. SSR 단계에서는 storage 를 undefined 로 두어
// 초기 상태 그대로 렌더링되게 한다. (useUserAuthStore 와 같은 패턴)
const storage =
  typeof window !== "undefined"
    ? createJSONStorage(() => localStorage)
    : undefined;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...initialState,
      hasHydrated: false,

      addLines: (drafts) => {
        if (!drafts.length) return { status: "added", count: 0 };

        const current = get().lines;
        const next = [...current];

        for (const draft of drafts) {
          const lineId = createCartLineId(draft.productId, draft.options);
          const index = next.findIndex((line) => line.lineId === lineId);

          if (index >= 0) {
            // 이미 담긴 조합이면 새 라인이 아니라 수량 합산
            next[index] = {
              ...next[index],
              quantity: clampQuantity(next[index].quantity + draft.quantity),
            };
            continue;
          }

          if (next.length >= MAX_CART_LINES) {
            return { status: "limit", max: MAX_CART_LINES };
          }

          next.push({
            ...draft,
            lineId,
            quantity: clampQuantity(draft.quantity),
            addedAt: Date.now(),
          });
        }

        set({ lines: next });

        return { status: "added", count: drafts.length };
      },

      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.lineId === lineId
              ? { ...line, quantity: clampQuantity(quantity) }
              : line,
          ),
        })),

      removeLines: (lineIds) =>
        set((state) => ({
          lines: state.lines.filter((line) => !lineIds.includes(line.lineId)),
        })),

      // 삭제 되돌리기. 이미 있는 라인은 건드리지 않는다.
      restoreLines: (restored) =>
        set((state) => {
          const existing = new Set(state.lines.map((line) => line.lineId));
          const additions = restored.filter(
            (line) => !existing.has(line.lineId),
          );

          return {
            lines: [...state.lines, ...additions]
              .slice(0, MAX_CART_LINES)
              .sort((a, b) => a.addedAt - b.addedAt),
          };
        }),

      clear: () => set({ lines: [] }),

      setOwner: (ownerId) => set({ ownerId }),
    }),
    {
      name: "user-cart",
      storage,
      partialize: (state) => ({ lines: state.lines, ownerId: state.ownerId }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    },
  ),
);

/**
 * persist 가 localStorage 에서 rehydrate 를 끝냈는지 여부.
 * 헤더 배지처럼 저장 상태에 따라 다르게 그려지는 컴포넌트는 이 값으로 보호한다 —
 * 안 하면 SSR(빈 장바구니)과 클라이언트 첫 렌더가 어긋나 hydration 불일치가 난다.
 */
export const useCartHydrated = () => useCartStore((state) => state.hasHydrated);
