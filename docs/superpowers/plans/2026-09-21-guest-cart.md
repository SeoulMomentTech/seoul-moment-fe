# 비회원(게스트) 장바구니 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 비로그인 사용자가 `apps/web` 에서 장바구니에 담고, 보고, 수량을 바꾸고, 지울 수 있게 한다.

**Architecture:** 회원(`user/cart`)과 게스트(`guest/cart`) 두 어댑터가 같은 `CartApi` 인터페이스를 만족하고, `useCart` 는 어느 쪽인지 모른 채 그 인터페이스만 쓴다. 분기는 `useCartApi` 한 곳에 있다. 어려운 로직(400ms 수량 디바운스, 409 재조회 정정, 실패 토스트, 담기 결과 판정)은 `useCart` 에 한 벌만 존재한다. 라인 식별자는 두 카트 공통인 `productVariantId` 로 통일하고, `cartItemId` 는 회원 어댑터 내부 값으로 내려간다.

**Tech Stack:** Next.js 16 App Router · TanStack Query v5 · zustand(persist) · ky · vitest + @testing-library/react · next-intl

설계 문서: [`docs/superpowers/specs/2026-09-21-guest-cart-design.md`](../specs/2026-09-21-guest-cart-design.md)
기존 장바구니 문서: [`apps/web/docs/cart.md`](../../../apps/web/docs/cart.md)

## Global Constraints

- 모든 명령은 저장소 루트에서 실행한다. 테스트: `pnpm --filter @seoul-moment/web exec vitest run <경로>`. 타입: `pnpm typecheck`. 린트: `pnpm lint`.
- **새 i18n 키를 만들지 않는다.** `pnpm dev:web` 이 매 시작마다 `i18n:sync` 로 JSON 을 전체 덮어써서, 시트에 없는 키는 지워진다. 이 기능에 필요한 문구(`place_order`, `login_required`, `cart_add_unavailable`, `stock_not_enough`, `please_try_again`)는 전부 이미 있다.
- **FSD 의존 방향**: `shared` → `entities` → `features` → `widgets` → `views` → `app`. 역방향 import 금지. `shared` 는 `entities/cart` 를 알면 안 된다.
- **파일 간 import 는 반드시 barrel(`@entities/cart`)** 을 거친다. 같은 슬라이스 내부에서는 상대 경로를 쓴다 (기존 코드 관행).
- 게스트 서버 API 는 심사용 임시 모듈이다. 게스트 전용 코드는 **파일 단위로 분리**해 제거할 때 회원 코드에 흔적이 남지 않게 한다.
- 커밋 메시지는 Conventional Commits + 영문. 본문 끝에 `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- 작업 브랜치는 `feat/web-guest-cart` (이미 생성됨, `shared/services/guestCart.ts` 와 설계 문서가 커밋되어 있다).

## File Structure

| 파일 | 책임 | 상태 |
| --- | --- | --- |
| `shared/services/guestCart.ts` | 게스트 서버 호출 6개 | **완료** (커밋 6608246) |
| `entities/cart/model/types.ts` | `CartLine`·`CartBrandGroup`·`GetCartRes`·`CartApi` 계약 | 수정 |
| `entities/cart/model/cartSelectors.ts` | 선택 합계·품절 판정. 키를 SKU 로 | 수정 |
| `entities/cart/model/guestId.ts` | guestId 보관 (zustand persist) | 신규 |
| `entities/cart/model/cartSource.ts` | `CartSource` 타입 + 순수 판정 함수 | 신규 |
| `entities/cart/api/queryKey.ts` | 회원·게스트 쿼리 키 | 수정 |
| `entities/cart/api/useCartSource.ts` | store 를 읽어 `CartSource` 를 만드는 훅 | 신규 |
| `entities/cart/api/useMemberCart.ts` | 회원 어댑터 (기존 `useUserCart.ts` 이동) | 이동+수정 |
| `entities/cart/api/useGuestCart.ts` | 게스트 어댑터 | 신규 |
| `entities/cart/api/useCartApi.ts` | source 로 어댑터 선택 ← **분기는 여기만** | 신규 |
| `entities/cart/model/useCart.ts` | UI 가 쓰는 유일한 경계 | 수정 |
| `entities/cart/lib/cartError.ts` | 409·404 판정 | 수정 |
| `entities/cart/ui/GuestCartReset.tsx` | 로그인 전환 시 guestId 폐기 (헤드리스) | 신규 |
| `features/cart/model/useCartSelection.ts` | 선택 상태. 키를 SKU 로 | 수정 |
| `features/cart/ui/CartList.tsx` | 리스트 조립·삭제·주문 링크 | 수정 |
| `features/cart/ui/CartBrandGroup.tsx` | 브랜드 묶음 | 수정 |
| `features/cart/model/useAddToCartDraft.ts` | 담기 게이트 해제 | 수정 |
| `views/cart/ui/CartPage.tsx` | `AuthOnly` 제거 | 수정 |
| `widgets/header/ui/CartButton.tsx` | 비로그인 숨김 제거 | 수정 |
| `app/[locale]/layout.tsx` | `GuestCartReset` 마운트 | 수정 |

---

### Task 1: 라인 키를 `productVariantId` 로 통일

회원 전용 상태에서 끝나는 순수 리팩터링이다. 이 작업만으로도 동작은 지금과 같아야 한다.

**Files:**
- Modify: `apps/web/src/entities/cart/model/cartSelectors.ts:38-50`
- Modify: `apps/web/src/features/cart/model/useCartSelection.ts`
- Modify: `apps/web/src/features/cart/ui/CartList.tsx`
- Modify: `apps/web/src/features/cart/ui/CartBrandGroup.tsx`
- Test: `apps/web/src/entities/cart/model/cartSelectors.test.ts`
- Test: `apps/web/src/features/cart/model/useCartSelection.test.ts`
- Test: `apps/web/src/features/cart/ui/CartBrandGroup.test.tsx`

**Interfaces:**
- Produces: `sumSelectedAmount(items, selectedVariantIds: ReadonlySet<number>)`, `useCartSelection(items, unselectableVariantIds?)` → `{ selectedVariantIds, selectedCount, selectableCount, allSelected, someSelected, isSelected(productVariantId), toggle(productVariantId, selected), toggleMany(productVariantIds, selected), toggleAll(selected) }`

- [ ] **Step 1: 되돌리기 후 선택이 유지되는 테스트를 추가한다 (실패해야 한다)**

`apps/web/src/features/cart/model/useCartSelection.test.ts` 맨 아래에 추가:

```ts
it("라인이 새 cartItemId 로 다시 담겨도 선택 상태가 유지된다", () => {
  // 삭제 되돌리기는 곧 재담기라 서버가 새 cartItemId 를 매긴다. 라인 키가 SKU 이므로
  // 같은 라인으로 인식되어야 한다.
  const before = [line({ cartItemId: 1, productVariantId: 101 })];
  const after = [line({ cartItemId: 99, productVariantId: 101 })];

  const { result, rerender } = renderHook(({ items }) => useCartSelection(items), {
    initialProps: { items: before },
  });

  act(() => result.current.toggle(101, false));
  expect(result.current.selectedCount).toBe(0);

  rerender({ items: after });
  expect(result.current.selectedCount).toBe(0);
});
```

같은 파일 상단의 기존 헬퍼가 `cartItemId` 만 받는다면 `productVariantId` 도 받도록 고친다:

```ts
const line = (overrides: Partial<UserCartItem>): UserCartItem => ({
  cartItemId: 1,
  productItemId: 1,
  productVariantId: 101,
  productName: "상품",
  optionText: "IVORY / M",
  imageUrl: "",
  price: 1000,
  discountPrice: 0,
  quantity: 1,
  totalPrice: 1000,
  stockQuantity: 50,
  isSoldOut: false,
  isAvailable: true,
  ...overrides,
});
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/features/cart/model/useCartSelection.test.ts`
Expected: FAIL — 지금은 `toggle(101, false)` 가 `cartItemId` 1 을 해제하므로 rerender 후 `selectedCount` 가 1 이 된다.

- [ ] **Step 3: `cartSelectors.sumSelectedAmount` 의 키를 바꾼다**

`apps/web/src/entities/cart/model/cartSelectors.ts` 의 `sumSelectedAmount` 를 교체:

```ts
/**
 * 선택된 라인만의 합계.
 *
 * 서버가 라인마다 `totalPrice`(적용가 × 수량)를 주므로 단가 계산을 여기서 되풀이하지 않는다.
 * 합계 대상은 선택이라는 **클라이언트 상태**라 서버의 `totalProductAmount`(전체 기준)를
 * 그대로 쓸 수 없다.
 *
 * 라인을 가리키는 값은 `productVariantId` 다 — 회원·게스트 카트 모두 라인당 SKU 가 유일하고,
 * 게스트 라인에는 `cartItemId` 가 없다.
 */
export const sumSelectedAmount = (
  items: ReadonlyArray<Pick<UserCartItem, "productVariantId" | "totalPrice">>,
  selectedVariantIds: ReadonlySet<number>,
): number =>
  items.reduce(
    (total, item) =>
      selectedVariantIds.has(item.productVariantId)
        ? total + item.totalPrice
        : total,
    0,
  );
```

- [ ] **Step 4: `useCartSelection` 의 키를 바꾼다**

`apps/web/src/features/cart/model/useCartSelection.ts` 본문에서 `cartItemId` 를 전부 `productVariantId` 로 바꾸고, 반환값 이름도 바꾼다. 인자 이름은 `unselectableVariantIds` 다.

```ts
export const useCartSelection = (
  items: ReadonlyArray<Pick<UserCartItem, "productVariantId">>,
  unselectableVariantIds?: ReadonlySet<number>,
) => {
  const [excluded, setExcluded] = useState<ReadonlySet<number>>(new Set());

  const selectableItems = useMemo(
    () =>
      items.filter(
        (item) => !unselectableVariantIds?.has(item.productVariantId),
      ),
    [items, unselectableVariantIds],
  );

  // 선택 해제된 SKU 만 들고 있는다. 새로 담긴 라인이 자동으로 선택 상태가 되고,
  // 삭제된 라인의 SKU 는 items 에서 사라지므로 따로 정리할 필요가 없다.
  const selectedVariantIds = useMemo(
    () =>
      new Set(
        selectableItems
          .filter((item) => !excluded.has(item.productVariantId))
          .map((item) => item.productVariantId),
      ),
    [selectableItems, excluded],
  );

  const toggle = useCallback((productVariantId: number, selected: boolean) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (selected) next.delete(productVariantId);
      else next.add(productVariantId);
      return next;
    });
  }, []);

  const toggleMany = useCallback(
    (productVariantIds: ReadonlyArray<number>, selected: boolean) => {
      setExcluded((prev) => {
        const next = new Set(prev);
        for (const productVariantId of productVariantIds) {
          if (selected) next.delete(productVariantId);
          else next.add(productVariantId);
        }
        return next;
      });
    },
    [],
  );

  const selectedCount = selectedVariantIds.size;
  const allSelected =
    selectableItems.length > 0 && selectedCount === selectableItems.length;
  const someSelected = selectedCount > 0 && !allSelected;

  return {
    selectedVariantIds,
    selectedCount,
    /** 전체 선택 기준이 되는 개수 — 품절 라인은 빠진다 */
    selectableCount: selectableItems.length,
    allSelected,
    someSelected,
    isSelected: useCallback(
      (productVariantId: number) => selectedVariantIds.has(productVariantId),
      [selectedVariantIds],
    ),
    toggle,
    toggleMany,
    toggleAll: useCallback(
      (selected: boolean) =>
        toggleMany(
          selectableItems.map((item) => item.productVariantId),
          selected,
        ),
      [selectableItems, toggleMany],
    ),
  };
};
```

- [ ] **Step 5: 호출부 두 곳의 키를 바꾼다**

`apps/web/src/features/cart/ui/CartBrandGroup.tsx` — props 이름과 본문:

```tsx
interface CartBrandGroupProps {
  group: UserCartBrandGroup;
  selectedVariantIds: ReadonlySet<number>;
  onToggleLine(productVariantId: number, selected: boolean): void;
  onToggleGroup(productVariantIds: ReadonlyArray<number>, selected: boolean): void;
  onQuantityChange(productVariantId: number, quantity: number): void;
  onRemove(productVariantId: number): void;
}
```

본문의 `selectableIds` 는 `.map((item) => item.productVariantId)`, 라인 렌더는 `key={item.productVariantId}` 와 각 콜백 인자를 `item.productVariantId` 로 바꾼다. `selectedCartItemIds.has(...)` 는 전부 `selectedVariantIds.has(item.productVariantId)` 다.

`apps/web/src/features/cart/ui/CartList.tsx`:

```tsx
  const unselectableVariantIds = useMemo(
    () =>
      new Set(
        items.filter(isCartItemUnavailable).map((item) => item.productVariantId),
      ),
    [items],
  );

  const selection = useCartSelection(items, unselectableVariantIds);
```

```tsx
  const handleRemove = useCallback(
    (productVariantIds: ReadonlyArray<number>) => {
      if (!productVariantIds.length) return;

      const ids = new Set(productVariantIds);
      removedRef.current = items.filter((item) => ids.has(item.productVariantId));
      removeItems(productVariantIds);

      const snapshot = removedRef.current;
      toast(t("removed_from_cart"), {
        action: {
          label: t("undo"),
          onClick: () => void restoreItems(snapshot),
        },
      });
    },
    [items, removeItems, restoreItems, t],
  );
```

주문 링크는 아직 회원 전용이므로 `cartItemId` 를 SKU 에서 되찾아 넘긴다 (Task 7 에서 정리한다):

```tsx
  const orderHref = selection.selectedCount
    ? toOrderHref({
        type: "cart",
        cartItemIds: items
          .filter((item) => selection.selectedVariantIds.has(item.productVariantId))
          .map((item) => item.cartItemId),
      })
    : null;
```

나머지 `selection.selectedCartItemIds` → `selection.selectedVariantIds`, `onDeleteAll` 의 `items.map((item) => item.cartItemId)` → `item.productVariantId`, `CartBrandGroupSection` 의 `selectedCartItemIds` prop → `selectedVariantIds` 로 바꾼다.

- [ ] **Step 6: 기존 테스트의 키를 맞춘다**

`cartSelectors.test.ts` 의 `sumSelectedAmount` 호출에서 넘기는 Set 을 SKU 기준으로, `useCartSelection.test.ts` 와 `CartBrandGroup.test.tsx` 의 id·prop 이름을 위 시그니처에 맞게 바꾼다. 테스트 픽스처는 라인마다 `productVariantId` 가 서로 달라야 한다 — 같으면 한 라인으로 취급된다.

- [ ] **Step 7: 카트 관련 테스트 전부 통과를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart src/features/cart`
Expected: PASS (신규 1개 포함 전부)

- [ ] **Step 8: 타입·린트**

Run: `pnpm typecheck && pnpm lint`
Expected: 오류 없음

- [ ] **Step 9: 커밋**

```bash
git add apps/web/src/entities/cart apps/web/src/features/cart
git commit -m "$(cat <<'EOF'
refactor(web): key cart lines by product variant instead of cart item id

A guest cart line carries no line id, so the id the screen, the selection and
the totals agree on has to exist in both carts. Every line holds one SKU in
either cart, because both merge quantities for a SKU that is already there.

cartItemId stays, but only as the value the member adapter sends to
PATCH/DELETE user/cart/{id}. Restoring a removed line now keeps its selection:
the server assigns a fresh cartItemId, and the key no longer changes with it.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `CartApi` 계약과 게스트 라인 타입

코드가 아니라 **타입만** 추가한다. 이후 모든 작업이 이 이름들을 참조한다.

**Files:**
- Modify: `apps/web/src/entities/cart/model/types.ts`
- Modify: `apps/web/src/entities/cart/index.ts`

**Interfaces:**
- Produces: `CartLine`, `CartBrandGroup`, `GetCartRes`, `ResolvedCartItemDraft`, `CartApi`

- [ ] **Step 1: 타입을 추가한다**

`apps/web/src/entities/cart/model/types.ts` 하단에 추가:

```ts
/**
 * 화면이 다루는 장바구니 라인.
 *
 * 회원 라인과 게스트 라인의 유일한 차이는 `cartItemId` 다 — 게스트에는 라인 ID 가 없다.
 * 화면은 라인을 `productVariantId` 로 가리키므로 이 차이를 볼 일이 없다.
 */
export interface CartLine extends Omit<UserCartItem, "cartItemId"> {
  cartItemId: number | null;
}

export interface CartBrandGroup extends Omit<UserCartBrandGroup, "items"> {
  items: CartLine[];
}

export interface GetCartRes extends Omit<GetUserCartRes, "brandGroups"> {
  brandGroups: CartBrandGroup[];
}

/** SKU 가 확정된 담기 라인. 어댑터는 이것만 받는다 */
export interface ResolvedCartItemDraft {
  productVariantId: number;
  quantity: number;
}

/**
 * 회원·게스트 어댑터가 공통으로 만족하는 계약.
 *
 * `useCart` 는 이 인터페이스만 보고, 어느 카트인지 모른다. 실패는 전부 **throw** 로
 * 알린다 — 재고 부족(409) 뒤 정정과 실패 토스트는 `useCart` 한 곳에서 처리한다.
 */
export interface CartApi {
  data?: GetCartRes;
  isPending: boolean;
  isError: boolean;
  refetch(): void;
  /** 409 뒤 정정용 즉시 재조회. 읽지 못하면 `null` */
  fetchCart(): Promise<GetCartRes | null>;
  addItems(items: ReadonlyArray<ResolvedCartItemDraft>): Promise<void>;
  /** 화면(캐시)에만 반영한다. 전송은 하지 않는다 */
  setLineQuantity(productVariantId: number, quantity: number): void;
  /** 서버로 전송한다 */
  commitQuantity(productVariantId: number, quantity: number): Promise<void>;
  /** 고른 라인만 삭제 */
  removeItems(productVariantIds: ReadonlyArray<number>): void;
  /** 전체 비우기 */
  removeAll(): void;
}
```

- [ ] **Step 2: barrel 에 노출한다**

`apps/web/src/entities/cart/index.ts` 의 `export type { ... } from "./model/types";` 에 `CartApi`, `CartBrandGroup`, `CartLine`, `GetCartRes`, `ResolvedCartItemDraft` 를 알파벳 순으로 추가한다.

- [ ] **Step 3: 타입 검사**

Run: `pnpm typecheck && pnpm lint`
Expected: 오류 없음 (아직 아무도 쓰지 않는 타입이다)

- [ ] **Step 4: 커밋**

```bash
git add apps/web/src/entities/cart
git commit -m "$(cat <<'EOF'
feat(web): declare the cart adapter contract

The member and the guest cart differ in where they live, not in what the screen
does with them. Naming the contract first lets both adapters be written against
the same names, and keeps useCart unaware of which one it got.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: guestId 보관소

**Files:**
- Create: `apps/web/src/entities/cart/model/guestId.ts`
- Test: `apps/web/src/entities/cart/model/guestId.test.ts`
- Modify: `apps/web/src/entities/cart/index.ts`

**Interfaces:**
- Produces: `useGuestCartIdStore` (zustand), `useGuestCartId(): string | null`, `useGuestCartIdHydrated(): boolean`, store actions `setGuestId(id: string)` / `clearGuestId()`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`apps/web/src/entities/cart/model/guestId.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";

import { useGuestCartIdStore } from "./guestId";

describe("guestId store", () => {
  beforeEach(() => {
    useGuestCartIdStore.setState({ guestId: null });
  });

  it("발급받은 ID 를 보관한다", () => {
    useGuestCartIdStore.getState().setGuestId("g-1");

    expect(useGuestCartIdStore.getState().guestId).toBe("g-1");
  });

  it("폐기하면 null 로 돌아간다", () => {
    useGuestCartIdStore.getState().setGuestId("g-1");
    useGuestCartIdStore.getState().clearGuestId();

    expect(useGuestCartIdStore.getState().guestId).toBeNull();
  });

  it("같은 ID 를 다시 저장해도 상태 객체가 바뀌지 않는다", () => {
    // 담기 응답마다 저장하므로, 매번 새 참조를 만들면 구독자가 불필요하게 다시 그린다.
    useGuestCartIdStore.getState().setGuestId("g-1");
    const before = useGuestCartIdStore.getState();

    useGuestCartIdStore.getState().setGuestId("g-1");

    expect(useGuestCartIdStore.getState()).toBe(before);
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart/model/guestId.test.ts`
Expected: FAIL — `Failed to resolve import "./guestId"`

- [ ] **Step 3: store 를 만든다**

`apps/web/src/entities/cart/model/guestId.ts`:

```ts
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
```

- [ ] **Step 4: 통과를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart/model/guestId.test.ts`
Expected: PASS (3개)

- [ ] **Step 5: barrel 에 노출하고 타입·린트를 확인한다**

`apps/web/src/entities/cart/index.ts` 에 추가:

```ts
export {
  useGuestCartId,
  useGuestCartIdHydrated,
  useGuestCartIdStore,
} from "./model/guestId";
```

Run: `pnpm typecheck && pnpm lint`
Expected: 오류 없음

- [ ] **Step 6: 커밋**

```bash
git add apps/web/src/entities/cart
git commit -m "$(cat <<'EOF'
feat(web): keep the guest cart id

The server issues the id in the first add response and identifies the cart by
it from then on, so it has to outlive the tab. Writing the same id again keeps
the state object identical, because every add response carries it and a fresh
reference would repaint every subscriber.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `cartSource` 판정

**Files:**
- Create: `apps/web/src/entities/cart/model/cartSource.ts`
- Create: `apps/web/src/entities/cart/api/useCartSource.ts`
- Test: `apps/web/src/entities/cart/model/cartSource.test.ts`
- Modify: `apps/web/src/entities/cart/index.ts`

**Interfaces:**
- Consumes: `useGuestCartId`, `useGuestCartIdHydrated` (Task 3)
- Produces: `type CartSource = { kind: "member" } | { kind: "guest"; guestId: string | null }`, `resolveCartSource(args): CartSource | null`, `useCartSource(): CartSource | null`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`apps/web/src/entities/cart/model/cartSource.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { resolveCartSource } from "./cartSource";

describe("resolveCartSource", () => {
  it("복원 전에는 어느 카트인지 말하지 않는다", () => {
    // 인증이 복원되기 전에 게스트로 단정하면 로그인 사용자의 화면이 한 번 비었다 찬다.
    expect(
      resolveCartSource({
        hasAuthHydrated: false,
        isAuthenticated: false,
        hasGuestHydrated: true,
        guestId: null,
      }),
    ).toBeNull();

    expect(
      resolveCartSource({
        hasAuthHydrated: true,
        isAuthenticated: false,
        hasGuestHydrated: false,
        guestId: null,
      }),
    ).toBeNull();
  });

  it("로그인했으면 회원 카트다", () => {
    expect(
      resolveCartSource({
        hasAuthHydrated: true,
        isAuthenticated: true,
        hasGuestHydrated: true,
        guestId: "g-1",
      }),
    ).toEqual({ kind: "member" });
  });

  it("비로그인이면 게스트 카트다 — 담은 적이 없으면 guestId 가 null 이다", () => {
    expect(
      resolveCartSource({
        hasAuthHydrated: true,
        isAuthenticated: false,
        hasGuestHydrated: true,
        guestId: null,
      }),
    ).toEqual({ kind: "guest", guestId: null });

    expect(
      resolveCartSource({
        hasAuthHydrated: true,
        isAuthenticated: false,
        hasGuestHydrated: true,
        guestId: "g-1",
      }),
    ).toEqual({ kind: "guest", guestId: "g-1" });
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart/model/cartSource.test.ts`
Expected: FAIL — `Failed to resolve import "./cartSource"`

- [ ] **Step 3: 순수 판정 함수를 만든다**

`apps/web/src/entities/cart/model/cartSource.ts`:

```ts
/**
 * 지금 어느 장바구니를 쓰는지.
 *
 * 서버는 회원(`user/cart`)과 게스트(`guest/cart`)에 서로 다른 인증 수단을 요구하지만,
 * 화면은 이 타입 하나만 들고 다닌다 — 분기는 `useCartApi` 한 곳에 있다.
 * (`entities/order/model/orderSource.ts` 와 같은 어휘다.)
 */
export type CartSource =
  | { kind: "member" }
  | { kind: "guest"; guestId: string | null };

interface ResolveCartSourceArgs {
  hasAuthHydrated: boolean;
  isAuthenticated: boolean;
  hasGuestHydrated: boolean;
  guestId: string | null;
}

/**
 * 두 store 의 복원이 끝나기 전에는 `null` 이다 — "게스트다" 와 "아직 모른다" 는 다르다.
 * 복원 전에 게스트로 단정하면 로그인 사용자의 장바구니가 한 번 비었다가 채워진다.
 */
export const resolveCartSource = ({
  hasAuthHydrated,
  isAuthenticated,
  hasGuestHydrated,
  guestId,
}: ResolveCartSourceArgs): CartSource | null => {
  if (!hasAuthHydrated || !hasGuestHydrated) return null;

  return isAuthenticated ? { kind: "member" } : { kind: "guest", guestId };
};
```

- [ ] **Step 4: 통과를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart/model/cartSource.test.ts`
Expected: PASS (5개)

- [ ] **Step 5: store 를 읽는 훅을 만든다**

`apps/web/src/entities/cart/api/useCartSource.ts`:

```ts
"use client";

import {
  useUserAuthHydrated,
  useUserAuthStore,
} from "@shared/lib/hooks/useUserAuthStore";

import { resolveCartSource, type CartSource } from "../model/cartSource";
import { useGuestCartId, useGuestCartIdHydrated } from "../model/guestId";

/** 지금 유효한 장바구니. 두 store 의 복원이 끝나기 전에는 `null` 이다 */
export const useCartSource = (): CartSource | null =>
  resolveCartSource({
    hasAuthHydrated: useUserAuthHydrated(),
    isAuthenticated: useUserAuthStore((s) => s.isAuthenticated),
    hasGuestHydrated: useGuestCartIdHydrated(),
    guestId: useGuestCartId(),
  });
```

- [ ] **Step 6: barrel 에 노출하고 타입·린트를 확인한다**

`apps/web/src/entities/cart/index.ts` 에 추가:

```ts
export { useCartSource } from "./api/useCartSource";
export { resolveCartSource, type CartSource } from "./model/cartSource";
```

Run: `pnpm typecheck && pnpm lint`
Expected: 오류 없음

- [ ] **Step 7: 커밋**

```bash
git add apps/web/src/entities/cart
git commit -m "$(cat <<'EOF'
feat(web): resolve which cart is in use

Both stores live in localStorage, so before they rehydrate "this is a guest"
and "we do not know yet" look the same. Deciding too early empties a signed-in
visitor's cart for one paint, so the source is null until both are restored and
the screen keeps showing its skeleton.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: 회원 어댑터 (`useMemberCart`)

기존 `useUserCart.ts` 를 `CartApi` 를 만족하는 훅 하나로 모은다. 동작은 바뀌지 않는다.

**Files:**
- Create: `apps/web/src/entities/cart/api/useMemberCart.ts` (기존 `useUserCart.ts` 의 내용을 옮긴다)
- Delete: `apps/web/src/entities/cart/api/useUserCart.ts`
- Modify: `apps/web/src/entities/cart/model/useCart.ts`
- Modify: `apps/web/src/entities/cart/index.ts`
- Test: `apps/web/src/entities/cart/model/useCart.test.tsx` (기존, 계속 통과해야 한다)

**Interfaces:**
- Consumes: `CartApi`, `ResolvedCartItemDraft`, `GetCartRes` (Task 2)
- Produces: `useMemberCart(): CartApi`

- [ ] **Step 1: 파일을 옮긴다**

```bash
git mv apps/web/src/entities/cart/api/useUserCart.ts apps/web/src/entities/cart/api/useMemberCart.ts
```

- [ ] **Step 2: 어댑터 훅을 추가한다**

`apps/web/src/entities/cart/api/useMemberCart.ts` 안의 개별 훅(`useUserCartQuery`·`useCreateUserCartItemsMutation` 등)은 그대로 두고, 파일 하단에 그것들을 묶는 훅을 추가한다. `cartItemId` 로의 번역이 여기서 끝난다.

```ts
/**
 * 회원 장바구니 어댑터.
 *
 * 화면은 라인을 `productVariantId` 로 가리키지만 서버는 `cartItemId` 를 요구한다.
 * 그 번역이 이 훅 안에서 끝나고, 밖으로는 새어 나가지 않는다.
 */
export function useMemberCart(): CartApi {
  const queryClient = useQueryClient();
  const keys = useUserCartKeys();

  const { data, isPending, isError, refetch } = useUserCartQuery();
  const fetchUserCart = useFetchUserCart();
  const setItemQuantity = useSetCartItemQuantity();

  const { mutateAsync: createItems } = useCreateUserCartItemsMutation({
    toastOnError: false,
  });
  const { mutateAsync: updateItem } = useUpdateUserCartItemMutation({
    toastOnError: false,
  });
  const { mutate: deleteItems } = useDeleteUserCartItemsMutation();

  // 캐시에서 직접 찾는다. 렌더 시점의 값을 닫아두면 디바운스된 전송이 낡은 id 를 쓴다.
  const toCartItemId = useCallback(
    (productVariantId: number) =>
      queryClient
        .getQueryData<CartListCache>(keys.list)
        ?.data.brandGroups.flatMap((group) => group.items)
        .find((item) => item.productVariantId === productVariantId)
        ?.cartItemId ?? null,
    [queryClient, keys.list],
  );

  return {
    data,
    isPending,
    isError,
    refetch: useCallback(() => void refetch(), [refetch]),
    fetchCart: useCallback(
      () =>
        fetchUserCart()
          .then((res) => res.data)
          .catch(() => null),
      [fetchUserCart],
    ),
    addItems: useCallback(
      async (items) => {
        await createItems({ items: [...items] });
      },
      [createItems],
    ),
    setLineQuantity: useCallback(
      (productVariantId, quantity) => {
        const cartItemId = toCartItemId(productVariantId);
        if (cartItemId == null) return;

        setItemQuantity(cartItemId, quantity);
      },
      [setItemQuantity, toCartItemId],
    ),
    commitQuantity: useCallback(
      async (productVariantId, quantity) => {
        const cartItemId = toCartItemId(productVariantId);
        // 라인이 이미 사라졌다. 보낼 곳이 없으므로 조용히 끝낸다.
        if (cartItemId == null) return;

        await updateItem({ cartItemId, quantity });
      },
      [toCartItemId, updateItem],
    ),
    removeItems: useCallback(
      (productVariantIds) => {
        const ids = productVariantIds
          .map(toCartItemId)
          .filter((id): id is number => id != null);

        // `deleteUserCartItems()` 를 빈 인자로 부르면 전체 비우기다. 지울 것이 없으면
        // 호출 자체를 하지 않는다.
        if (!ids.length) return;

        deleteItems(ids);
      },
      [deleteItems, toCartItemId],
    ),
    removeAll: useCallback(() => deleteItems(undefined), [deleteItems]),
  };
}
```

파일 상단 import 에 `CartApi`, `CartListCache` 가 이미 있는지 확인한다 (`CartListCache` 는 같은 파일에 정의되어 있다). `CartApi` 는 `../model/types` 에서 타입 import 한다.

`useSetCartItemQuantity` 가 파일 안에서만 쓰이게 되었으므로 `export` 를 떼고, `entities/cart/index.ts` 의 재노출도 지운다. barrel 의 `from "./api/useUserCart"` 경로를 `"./api/useMemberCart"` 로 바꾸고, `useMemberCart` 를 내보낸다.

- [ ] **Step 3: `useCart` 가 어댑터를 쓰게 고친다**

`apps/web/src/entities/cart/model/useCart.ts` 에서 개별 훅 호출을 어댑터 하나로 바꾼다. 나머지 로직(디바운스·409 정정·토스트·결과 판정)은 **그대로 둔다**. 바뀌는 곳만:

```ts
import { useMemberCart } from "../api/useMemberCart";

export const useCart = () => {
  const t = useTranslations();

  const cart = useMemberCart();
```

`reconcileAfterStockConflict` 는 SKU 로 라인을 찾는다:

```ts
  const reconcileAfterStockConflict = useCallback(
    async (productVariantId?: number) => {
      const data = await cart.fetchCart();

      const serverItem =
        productVariantId == null
          ? undefined
          : data?.brandGroups
              .flatMap((group) => group.items)
              .find((item) => item.productVariantId === productVariantId);

      // 서버를 못 읽었거나 그 라인이 사라졌으면 남은 재고를 말할 수 없다.
      if (!serverItem) {
        toast.error(t("stock_not_enough"), { id: STOCK_TOAST_ID });
        return;
      }

      toast.error(t("stock_left_only", { stock: serverItem.stockQuantity }), {
        id: STOCK_TOAST_ID,
      });
    },
    [cart, t],
  );
```

`addItems` 는 `createItems(...)` 대신 `cart.addItems(targets)` 를, 디바운스 flush 는 `updateItem({cartItemId, quantity})` 대신 `cart.commitQuantity(productVariantId, quantity)` 를 부른다. `pendingQuantities` 의 키도 `productVariantId` 다. `updateQuantity` 는 `cart.setLineQuantity(productVariantId, next)` 를 부른다. `removeItems` 는 `cart.removeItems(productVariantIds)` 로 위임하고, 새로 `removeAll` 을 반환에 추가한다:

```ts
  return {
    brandGroups: cart.data?.brandGroups ?? EMPTY_BRAND_GROUPS,
    totalProductAmount: cart.data?.totalProductAmount ?? 0,
    estimatedShippingFee: cart.data?.estimatedShippingFee ?? 0,
    remoteIslandFee: cart.data?.remoteIslandFee ?? 0,
    freeShippingThreshold: cart.data?.freeShippingThreshold ?? 0,
    totalCount: cart.data?.totalCount ?? 0,
    isPending: cart.isPending,
    isError: cart.isError,
    refetch: cart.refetch,
    addItems,
    updateQuantity,
    removeItems,
    removeAll: cart.removeAll,
    restoreItems,
  };
```

`EMPTY_BRAND_GROUPS` 의 타입은 `CartBrandGroup[]` 으로 바꾼다.

- [ ] **Step 4: `CartList` 의 임시 변환을 걷어내고 전체 삭제를 `removeAll` 로 바꾼다**

Task 1 은 `useCart().removeItems`·`updateQuantity` 가 아직 `cartItemId` 를 받는 중간 상태였기 때문에, `CartList.tsx` 안에서 `productVariantId` → `cartItemId` 를 인라인으로 되찾아 넘기고 있다. 이 작업에서 두 함수가 SKU 를 받게 되었으므로 **그 변환과 래퍼(`handleQuantityChange`)를 지우고 SKU 를 그대로 넘긴다.** 남겨두면 한 번 더 번역되어 어긋난다.

`apps/web/src/features/cart/ui/CartList.tsx`:

```tsx
  const { /* ... */ removeAll } = useCart();

  const handleRemoveAll = useCallback(() => {
    if (!items.length) return;

    removedRef.current = [...items];
    removeAll();

    const snapshot = removedRef.current;
    toast(t("removed_from_cart"), {
      action: { label: t("undo"), onClick: () => void restoreItems(snapshot) },
    });
  }, [items, removeAll, restoreItems, t]);
```

`CartSelectionBar` 의 `onDeleteAll` 을 `handleRemoveAll` 로 바꾼다.

- [ ] **Step 5: 라인 타입을 `CartLine` 으로 넓힌다**

`cart.data` 가 `GetCartRes` 가 되면서 `brandGroups` 의 원소 타입이 `CartBrandGroup` 이 된다. 이 값을 받는 세 곳의 타입을 바꾼다 (게스트 라인은 `cartItemId` 가 `null` 이라 `UserCartItem` 으로는 받을 수 없다).

- `entities/cart/model/cartSelectors.ts` 의 `listCartItems(brandGroups: ReadonlyArray<CartBrandGroup>): CartLine[]`
- `entities/cart/ui/CartLineRow.tsx` 의 `item: UserCartItem` → `item: CartLine`
- `features/cart/ui/CartBrandGroup.tsx` 의 `group: UserCartBrandGroup` → `group: CartBrandGroup`

`isCartItemUnavailable`·`isCartItemLowStock`·`getCartItemUnitPrice` 는 `cartItemId` 를 보지 않으므로 인자 타입만 `CartLine` 으로 넓히면 된다. `CartList.tsx` 의 `removedRef` 도 `useRef<CartLine[]>([])` 다.

- [ ] **Step 6: 기존 테스트가 그대로 통과하는지 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart src/features/cart`
Expected: PASS. 실패하면 **테스트가 아니라 구현을 고친다** — 이 작업은 리팩터링이라 동작이 바뀌면 안 된다. 단, 전체 삭제가 `DELETE user/cart` (ids 없음) 한 번으로 바뀌었으므로 그 호출을 검증하던 테스트는 기대값을 바꾼다.

- [ ] **Step 7: 타입·린트**

Run: `pnpm typecheck && pnpm lint`
Expected: 오류 없음

- [ ] **Step 8: 커밋**

```bash
git add apps/web/src/entities/cart apps/web/src/features/cart
git commit -m "$(cat <<'EOF'
refactor(web): gather the member cart behind the adapter contract

useCart called six hooks directly, which left no seam for a second cart. It now
takes one CartApi, and the member adapter owns the translation from the SKU the
screen names to the cartItemId the server wants — read from the cache at call
time, so a debounced patch cannot send an id the cart no longer has.

Clearing the whole cart goes through removeAll, one request with no ids, rather
than listing every line.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: 게스트 어댑터 (`useGuestCart`)

**Files:**
- Create: `apps/web/src/entities/cart/api/useGuestCart.ts`
- Test: `apps/web/src/entities/cart/api/useGuestCart.test.tsx`
- Modify: `apps/web/src/entities/cart/api/queryKey.ts`
- Modify: `apps/web/src/entities/cart/lib/cartError.ts`

**Interfaces:**
- Consumes: `CartApi` (Task 2), `useGuestCartIdStore` (Task 3), `shared/services/guestCart`
- Produces: `useGuestCart(guestId: string | null): CartApi`, `guestCartQueryKeys`, `isGuestCartGoneError(error): boolean`

- [ ] **Step 1: 쿼리 키와 404 판정을 추가한다**

`apps/web/src/entities/cart/api/queryKey.ts` 하단:

```ts
export const GUEST_CART_QUERY_KEY = ["guest", "cart"] as const;

/**
 * 게스트 장바구니 키. 회원 키의 userId 자리를 guestId 가 대신한다 —
 * ID 가 바뀌면(발급·폐기) 이전 카트의 캐시가 그대로 보이면 안 된다.
 */
export const guestCartQueryKeys = {
  all: GUEST_CART_QUERY_KEY,

  list: (guestId: string | null, languageCode: LanguageType) =>
    [...GUEST_CART_QUERY_KEY, "list", guestId, languageCode] as const,

  count: (guestId: string | null) =>
    [...GUEST_CART_QUERY_KEY, "count", guestId] as const,
};
```

`apps/web/src/entities/cart/lib/cartError.ts` 하단:

```ts
/**
 * 게스트 장바구니가 사라졌는지.
 *
 * 서버 보관은 7일이라 헤더의 ID 가 살아 있어도 카트가 없을 수 있다. 그 상태로 계속
 * 요청하면 모든 조작이 조용히 실패하므로, 404 를 만나면 ID 를 버리고 빈 카트로 돌아간다.
 */
export const isGuestCartGoneError = (error: unknown): boolean =>
  getErrorInfo(error).status === 404;
```

- [ ] **Step 2: 실패하는 테스트를 쓴다**

`apps/web/src/entities/cart/api/useGuestCart.test.tsx`:

```tsx
import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useGuestCart } from "./useGuestCart";
import { useGuestCartIdStore } from "../model/guestId";

const createGuestCartItems = vi.fn();
const getGuestCart = vi.fn();
const getGuestCartCount = vi.fn();
const updateGuestCartItem = vi.fn();
const deleteGuestCartItem = vi.fn();
const deleteGuestCart = vi.fn();

vi.mock("@shared/services/guestCart", () => ({
  createGuestCartItems: (...args: unknown[]) => createGuestCartItems(...args),
  getGuestCart: (...args: unknown[]) => getGuestCart(...args),
  getGuestCartCount: (...args: unknown[]) => getGuestCartCount(...args),
  updateGuestCartItem: (...args: unknown[]) => updateGuestCartItem(...args),
  deleteGuestCartItem: (...args: unknown[]) => deleteGuestCartItem(...args),
  deleteGuestCart: (...args: unknown[]) => deleteGuestCart(...args),
}));

vi.mock("@shared/lib/hooks", () => ({ useLanguage: () => "ko" }));

const emptyCart = {
  brandGroups: [],
  totalProductAmount: 0,
  estimatedShippingFee: 0,
  remoteIslandFee: 0,
  freeShippingThreshold: 0,
  amountToFreeShipping: 0,
  estimatedTotalAmount: 0,
  totalCount: 0,
};

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const httpError = (status: number) =>
  Object.assign(new Error("failed"), { response: { status } });

describe("useGuestCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGuestCartIdStore.setState({ guestId: null });
    getGuestCart.mockResolvedValue({ result: true, data: emptyCart });
    getGuestCartCount.mockResolvedValue({ result: true, data: { count: 0 } });
    createGuestCartItems.mockResolvedValue({
      result: true,
      data: { guestId: "g-1", items: [], totalCount: 1 },
    });
  });

  it("guestId 가 없으면 조회하지 않고, 스켈레톤에 갇히지 않는다", () => {
    const { result } = renderHook(() => useGuestCart(null), { wrapper });

    expect(getGuestCart).not.toHaveBeenCalled();
    // 비활성 쿼리는 상태가 pending 으로 남는다. 그대로 흘리면 CartPage 가 영영 스켈레톤이다.
    expect(result.current.isPending).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("첫 담기 응답의 guestId 를 저장한다", async () => {
    const { result } = renderHook(() => useGuestCart(null), { wrapper });

    await act(async () => {
      await result.current.addItems([{ productVariantId: 101, quantity: 1 }]);
    });

    expect(createGuestCartItems).toHaveBeenCalledWith({
      guestId: undefined,
      items: [{ productVariantId: 101, quantity: 1 }],
    });
    expect(useGuestCartIdStore.getState().guestId).toBe("g-1");
  });

  it("guestId 가 없을 때 동시에 담아도 헤더 없는 요청은 한 번뿐이다", async () => {
    // 두 번 나가면 서버가 게스트 ID 를 둘 발급해 카트가 갈라진다.
    const { result } = renderHook(() => useGuestCart(null), { wrapper });

    await act(async () => {
      await Promise.all([
        result.current.addItems([{ productVariantId: 101, quantity: 1 }]),
        result.current.addItems([{ productVariantId: 102, quantity: 1 }]),
      ]);
    });

    expect(createGuestCartItems).toHaveBeenCalledTimes(2);
    expect(createGuestCartItems.mock.calls[0][0].guestId).toBeUndefined();
    expect(createGuestCartItems.mock.calls[1][0].guestId).toBe("g-1");
  });

  it("수량 변경이 404 면 guestId 를 버린다", async () => {
    useGuestCartIdStore.setState({ guestId: "g-1" });
    updateGuestCartItem.mockRejectedValue(httpError(404));

    const { result } = renderHook(() => useGuestCart("g-1"), { wrapper });

    await act(async () => {
      await result.current.commitQuantity(101, 2).catch(() => null);
    });

    await waitFor(() =>
      expect(useGuestCartIdStore.getState().guestId).toBeNull(),
    );
  });

  it("선택 삭제는 라인마다 부르고, 전체 비우기는 한 번만 부른다", async () => {
    useGuestCartIdStore.setState({ guestId: "g-1" });
    deleteGuestCartItem.mockResolvedValue(undefined);
    deleteGuestCart.mockResolvedValue(undefined);

    const { result } = renderHook(() => useGuestCart("g-1"), { wrapper });

    await act(async () => {
      result.current.removeItems([101, 102]);
    });
    await waitFor(() => expect(deleteGuestCartItem).toHaveBeenCalledTimes(2));

    await act(async () => {
      result.current.removeAll();
    });
    await waitFor(() => expect(deleteGuestCart).toHaveBeenCalledTimes(1));
  });
});
```

- [ ] **Step 3: 실패를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart/api/useGuestCart.test.tsx`
Expected: FAIL — `Failed to resolve import "./useGuestCart"`

- [ ] **Step 4: 게스트 어댑터를 만든다**

`apps/web/src/entities/cart/api/useGuestCart.ts`:

```ts
"use client";

import { useCallback, useRef } from "react";

import type { HTTPError } from "ky";

import { useLanguage } from "@shared/lib/hooks";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import {
  createGuestCartItems,
  deleteGuestCart,
  deleteGuestCartItem,
  getGuestCart,
  getGuestCartCount,
  updateGuestCartItem,
  type GetGuestCartCountRes,
  type GetGuestCartRes,
} from "@shared/services/guestCart";

import type { CommonRes } from "@shared/services";
import { useQueryClient } from "@tanstack/react-query";

import { guestCartQueryKeys } from "./queryKey";
import { isGuestCartGoneError } from "../lib/cartError";
import { useGuestCartIdStore } from "../model/guestId";
import type { CartApi } from "../model/types";

/**
 * 게스트 장바구니 어댑터.
 *
 * 회원 어댑터와 다른 점은 셋뿐이다 — 주인이 헤더의 `guestId` 이고, 그 ID 가 첫 담기
 * 응답으로만 발급되며, 라인을 `productVariantId` 로 가리킨다. 나머지(디바운스·409 정정·
 * 실패 토스트)는 `useCart` 가 회원과 똑같이 처리한다.
 */
export function useGuestCart(guestId: string | null): CartApi {
  const queryClient = useQueryClient();
  const languageCode = useLanguage();
  const setGuestId = useGuestCartIdStore((s) => s.setGuestId);
  const clearGuestId = useGuestCartIdStore((s) => s.clearGuestId);

  const listKey = guestCartQueryKeys.list(guestId, languageCode);
  const countKey = guestCartQueryKeys.count(guestId);

  const query = useAppQuery<
    Awaited<ReturnType<typeof getGuestCart>>,
    HTTPError,
    GetGuestCartRes
  >({
    queryKey: listKey,
    queryFn: () => getGuestCart({ guestId: guestId as string, languageCode }),
    select: (res) => res.data,
    enabled: !!guestId,
    persist: true,
  });

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: guestCartQueryKeys.all });
  }, [queryClient]);

  /** 404 는 "이 게스트 카트는 더 이상 없다" 는 뜻이다. ID 를 버리고 빈 카트로 돌아간다 */
  const handleError = useCallback(
    (error: unknown) => {
      if (isGuestCartGoneError(error)) {
        clearGuestId();
        invalidate();
      }

      throw error;
    },
    [clearGuestId, invalidate],
  );

  // ID 가 없을 때의 첫 담기. 진행 중인 요청이 있으면 그것이 발급한 ID 를 기다렸다가 쓴다 —
  // 헤더 없는 요청을 둘 보내면 서버가 카트를 둘 만든다.
  const issuing = useRef<Promise<string> | null>(null);

  const addItems = useCallback<CartApi["addItems"]>(
    async (items) => {
      const pendingId = guestId ? null : issuing.current;
      const id = pendingId ? await pendingId : guestId;

      const request = createGuestCartItems({
        guestId: id ?? undefined,
        items: [...items],
      });

      if (!id) {
        issuing.current = request
          .then((res) => res.data.guestId)
          .finally(() => {
            issuing.current = null;
          });
      }

      const res = await request.catch(handleError);

      setGuestId(res.data.guestId);
      queryClient.setQueryData<CommonRes<GetGuestCartCountRes>>(countKey, {
        result: true,
        data: { count: res.data.totalCount },
      });
      invalidate();
    },
    [countKey, guestId, handleError, invalidate, queryClient, setGuestId],
  );

  const setLineQuantity = useCallback<CartApi["setLineQuantity"]>(
    (productVariantId, quantity) => {
      queryClient.setQueryData<CommonRes<GetGuestCartRes>>(listKey, (cache) =>
        cache
          ? {
              ...cache,
              data: {
                ...cache.data,
                brandGroups: cache.data.brandGroups.map((group) => ({
                  ...group,
                  items: group.items.map((item) =>
                    item.productVariantId === productVariantId
                      ? {
                          ...item,
                          quantity,
                          totalPrice:
                            (item.discountPrice && item.discountPrice > 0
                              ? item.discountPrice
                              : item.price) * quantity,
                        }
                      : item,
                  ),
                })),
              },
            }
          : cache,
      );
    },
    [listKey, queryClient],
  );

  return {
    // guestId 가 없으면 담은 적이 없는 게스트다. 비활성 쿼리의 pending 을 그대로 흘리면
    // 화면이 스켈레톤에서 빠져나오지 못한다.
    data: guestId ? query.data : undefined,
    isPending: !!guestId && query.isPending,
    isError: query.isError,
    refetch: useCallback(() => void query.refetch(), [query]),
    fetchCart: useCallback(async () => {
      if (!guestId) return null;

      return queryClient
        .fetchQuery({
          queryKey: listKey,
          queryFn: () => getGuestCart({ guestId, languageCode }),
          meta: { logError: false, persist: true },
        })
        .then((res) => res.data)
        .catch(() => null);
    }, [guestId, languageCode, listKey, queryClient]),
    addItems,
    setLineQuantity,
    commitQuantity: useCallback(
      async (productVariantId, quantity) => {
        if (!guestId) return;

        await updateGuestCartItem({ guestId, productVariantId, quantity })
          .catch(handleError)
          .finally(invalidate);
      },
      [guestId, handleError, invalidate],
    ),
    removeItems: useCallback(
      (productVariantIds) => {
        if (!guestId || !productVariantIds.length) return;

        // 게스트 API 에는 선택 삭제가 없다. 라인마다 부르고, 하나라도 실패하면 재조회로
        // 화면을 서버에 맞춘다.
        void Promise.allSettled(
          productVariantIds.map((productVariantId) =>
            deleteGuestCartItem({ guestId, productVariantId }),
          ),
        ).then(invalidate);
      },
      [guestId, invalidate],
    ),
    removeAll: useCallback(() => {
      if (!guestId) return;

      void deleteGuestCart(guestId).catch(() => null).finally(invalidate);
    }, [guestId, invalidate]),
  };
}
```

- [ ] **Step 5: 통과를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart/api/useGuestCart.test.tsx`
Expected: PASS (5개)

- [ ] **Step 6: 타입·린트**

Run: `pnpm typecheck && pnpm lint`
Expected: 오류 없음

- [ ] **Step 7: 커밋**

```bash
git add apps/web/src/entities/cart
git commit -m "$(cat <<'EOF'
feat(web): add the guest cart adapter

Same contract as the member adapter, with the three differences the server
imposes: the owner is a header, the id only ever arrives in the first add
response, and lines are addressed by SKU.

Two of them need care. A second header-less add issued before the first one
answers would leave the visitor with two carts, so concurrent first adds wait
for the id the first request brings back. And a 404 means the seven-day cart is
gone, so the id is dropped rather than replayed against a cart that no longer
exists.

Selected deletes fan out one call per line, since the guest API only knows how
to empty the whole cart.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: 어댑터 선택과 계약 스위트

**Files:**
- Create: `apps/web/src/entities/cart/api/useCartApi.ts`
- Modify: `apps/web/src/entities/cart/model/useCart.ts`
- Modify: `apps/web/src/entities/cart/model/useCartBadgeCount.ts`
- Modify: `apps/web/src/entities/cart/api/useMemberCart.ts` (카운트 쿼리는 그대로, 게스트 카운트만 추가)
- Test: `apps/web/src/entities/cart/model/useCart.test.tsx` (기존 → `describe.each`)

**Interfaces:**
- Consumes: `useCartSource` (Task 4), `useMemberCart` (Task 5), `useGuestCart` (Task 6)
- Produces: `useCartApi(): CartApi`

- [ ] **Step 1: 선택 훅을 만든다**

`apps/web/src/entities/cart/api/useCartApi.ts`:

```ts
"use client";

import type { CartApi } from "../model/types";
import { useCartSource } from "./useCartSource";
import { useGuestCart } from "./useGuestCart";
import { useMemberCart } from "./useMemberCart";

/** 복원이 끝나기 전에는 아직 무엇도 읽을 수 없다. 화면은 스켈레톤을 유지한다 */
const UNRESOLVED: CartApi = {
  data: undefined,
  isPending: true,
  isError: false,
  refetch: () => {},
  fetchCart: () => Promise.resolve(null),
  addItems: () => Promise.resolve(),
  setLineQuantity: () => {},
  commitQuantity: () => Promise.resolve(),
  removeItems: () => {},
  removeAll: () => {},
};

/**
 * 회원·게스트 중 지금 유효한 장바구니.
 *
 * **게스트 분기는 이 파일에만 있다.** 심사가 끝나 게스트 모듈을 걷어낼 때 고칠 곳도 여기다.
 * 훅 규칙상 둘 다 호출하되, 자기 차례가 아닌 쪽은 쿼리의 `enabled` 가 꺼져 아무것도 하지 않는다.
 */
export function useCartApi(): CartApi {
  const source = useCartSource();

  const member = useMemberCart();
  const guest = useGuestCart(source?.kind === "guest" ? source.guestId : null);

  if (!source) return UNRESOLVED;

  return source.kind === "member" ? member : guest;
}
```

- [ ] **Step 2: `useCart` 가 선택 훅을 쓰게 한다**

`apps/web/src/entities/cart/model/useCart.ts` 의 `useMemberCart()` 호출을 `useCartApi()` 로 바꾸고 import 를 고친다. 다른 변경은 없다.

- [ ] **Step 3: 뱃지 수를 두 카트에서 읽게 한다**

`apps/web/src/entities/cart/api/useGuestCart.ts` 하단에 카운트 쿼리를 추가한다:

```ts
/**
 * @description 게스트 장바구니 라인 수. ID 가 없으면 요청하지 않고 0 이다
 */
export function useGuestCartCountQuery(guestId: string | null) {
  return useAppQuery<
    Awaited<ReturnType<typeof getGuestCartCount>>,
    HTTPError,
    GetGuestCartCountRes
  >({
    queryKey: guestCartQueryKeys.count(guestId),
    queryFn: () => getGuestCartCount(guestId as string),
    select: (res) => res.data,
    enabled: !!guestId,
    persist: true,
  });
}
```

`apps/web/src/entities/cart/model/useCartBadgeCount.ts` 를 교체:

```ts
"use client";

import { useIsRestoring } from "@tanstack/react-query";

import { useGuestCartCountQuery } from "../api/useGuestCart";
import { useCartSource } from "../api/useCartSource";
import { useUserCartCountQuery } from "../api/useMemberCart";

/**
 * 헤더 배지에 찍을 라인 수.
 *
 * 값의 근거는 서버다 — 회원은 다른 기기에서 담은 것까지 세어야 하고, 게스트는 담은 적이
 * 없으면 요청 없이 0 이다.
 *
 * 응답 전에도 깜박이지 않는 이유는 이 쿼리 캐시가 localStorage 에 남아 복원되기 때문이다.
 * 복원이 끝나기 전에는 아직 아무것도 모르므로 `isReady` 가 false 다 — 그 값은 서버와
 * 클라이언트 첫 렌더가 같아서 hydration 불일치가 나지 않는다.
 */
export const useCartBadgeCount = () => {
  const isRestoring = useIsRestoring();
  const source = useCartSource();

  const member = useUserCartCountQuery();
  const guest = useGuestCartCountQuery(
    source?.kind === "guest" ? source.guestId : null,
  );

  // 아직 어느 카트인지 모르면 숫자를 말하지 않는다.
  if (!source) return { count: 0, isReady: false };

  const data = source.kind === "member" ? member.data : guest.data;

  return {
    count: data?.count ?? 0,
    isReady: !isRestoring && data != null,
  };
};
```

- [ ] **Step 4: 계약 스위트를 두 번 돌리도록 고친다**

`apps/web/src/entities/cart/model/useCart.test.tsx` 를 `describe.each` 로 감싼다. 서비스 mock 은 **두 벌 모두** 두고, 케이스에 따라 store 를 세팅해 source 를 가른다.

파일 상단(기존 mock 아래)에 추가:

```tsx
import { useGuestCartIdStore } from "./guestId";
import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

/** 게스트 서비스도 회원과 같은 가짜 서버 카트를 보게 해서 같은 시나리오를 돌린다 */
vi.mock("@shared/services/guestCart", () => ({
  createGuestCartItems: ({ items }: { items: CreateUserCartItem[] }) => {
    const added = items.map((line) =>
      cartItem(line.productVariantId, line.quantity),
    );
    serverCart = [...serverCart, ...added];

    return Promise.resolve({
      result: true,
      data: { guestId: "g-1", items, totalCount: serverCart.length },
    });
  },
  getGuestCart: () => Promise.resolve(toCartResponse(serverCart)),
  getGuestCartCount: () =>
    Promise.resolve({ result: true, data: { count: serverCart.length } }),
  updateGuestCartItem: ({
    productVariantId,
    quantity,
  }: {
    productVariantId: number;
    quantity: number;
  }) => {
    const line = serverCart.find(
      (item) => item.productVariantId === productVariantId,
    );
    if (line) line.quantity = quantity;

    return Promise.resolve({ result: true, data: null });
  },
  deleteGuestCartItem: ({ productVariantId }: { productVariantId: number }) => {
    serverCart = serverCart.filter(
      (item) => item.productVariantId !== productVariantId,
    );

    return Promise.resolve(undefined);
  },
  deleteGuestCart: () => {
    serverCart = [];

    return Promise.resolve(undefined);
  },
}));
```

`toCartResponse(serverCart)` 는 기존 `getUserCart` mock 이 만드는 응답 모양을 재사용하도록 그 로직을 헬퍼로 뽑아 쓴다.

기존 `describe("useCart", ...)` 를 감싼다:

```tsx
describe.each([
  {
    name: "회원",
    setup: () => {
      useUserAuthStore.setState({
        isAuthenticated: true,
        id: 1,
        hasHydrated: true,
      });
      useGuestCartIdStore.setState({ guestId: null, hasHydrated: true });
    },
  },
  {
    name: "게스트",
    setup: () => {
      useUserAuthStore.setState({
        isAuthenticated: false,
        id: 0,
        hasHydrated: true,
      });
      useGuestCartIdStore.setState({ guestId: "g-1", hasHydrated: true });
    },
  },
])("useCart ($name)", ({ setup }) => {
  beforeEach(() => {
    setup();
  });

  // ... 기존 테스트 본문 전체
});
```

- [ ] **Step 5: 양쪽 모두 통과를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart/model/useCart.test.tsx`
Expected: PASS — 기존 시나리오 수 × 2. 게스트에서만 깨지는 것이 있으면 **어댑터를 고친다**. 단, 게스트 카트에는 `cartItemId` 가 없으므로 그 값을 직접 단언하던 테스트는 SKU 기준 단언으로 바꾼다.

- [ ] **Step 6: 카트 전체 테스트 · 타입 · 린트**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart src/features/cart && pnpm typecheck && pnpm lint`
Expected: 전부 통과

- [ ] **Step 7: 커밋**

```bash
git add apps/web/src/entities/cart
git commit -m "$(cat <<'EOF'
feat(web): pick the cart adapter from the resolved source

useCartApi is the only place that knows a guest cart exists, so removing the
guest module later is a one-file edit. Both adapters are called every render —
hooks cannot be conditional — and the one that is not in use keeps its queries
disabled.

The useCart suite now runs twice, once per source, against the same fake server
cart. Parity between the two adapters is the whole premise of the design, so it
is asserted rather than assumed.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: 화면의 로그인 게이트를 연다

**Files:**
- Modify: `apps/web/src/views/cart/ui/CartPage.tsx`
- Modify: `apps/web/src/widgets/header/ui/CartButton.tsx`
- Modify: `apps/web/src/features/cart/model/useAddToCartDraft.ts:322-341`
- Modify: `apps/web/src/features/cart/ui/CartList.tsx`
- Create: `apps/web/src/entities/cart/model/cartOrderHref.ts`
- Test: `apps/web/src/entities/cart/model/cartOrderHref.test.ts`
- Test: `apps/web/src/features/cart/model/useAddToCartDraft.test.tsx`

**Interfaces:**
- Consumes: `CartSource` (Task 4), `CartLine` (Task 2)
- Produces: `toCartOrderHref({ source, lines, selectedVariantIds }): string | null`

- [ ] **Step 1: 주문 링크 판정의 실패하는 테스트를 쓴다**

`apps/web/src/entities/cart/model/cartOrderHref.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { toCartOrderHref } from "./cartOrderHref";
import type { CartLine } from "./types";

const line = (overrides: Partial<CartLine>): CartLine => ({
  cartItemId: 1,
  productItemId: 1,
  productVariantId: 101,
  productName: "상품",
  optionText: "IVORY / M",
  imageUrl: "",
  price: 1000,
  discountPrice: 0,
  quantity: 1,
  totalPrice: 1000,
  stockQuantity: 50,
  isSoldOut: false,
  isAvailable: true,
  ...overrides,
});

describe("toCartOrderHref", () => {
  it("고른 것이 없으면 링크를 만들지 않는다", () => {
    expect(
      toCartOrderHref({
        source: { kind: "member" },
        lines: [line({})],
        selectedVariantIds: new Set(),
      }),
    ).toBeNull();
  });

  it("회원은 고른 라인의 cartItemId 로 주문서에 간다", () => {
    const href = toCartOrderHref({
      source: { kind: "member" },
      lines: [
        line({ cartItemId: 11, productVariantId: 101 }),
        line({ cartItemId: 12, productVariantId: 102 }),
      ],
      selectedVariantIds: new Set([102]),
    });

    expect(href).toContain("12");
    expect(href).not.toContain("11");
  });

  it("고른 라인 중 하나라도 서버 id 가 없으면 링크를 만들지 않는다", () => {
    // 일부만 주문되면 사용자는 무엇이 빠졌는지 알 수 없다.
    expect(
      toCartOrderHref({
        source: { kind: "member" },
        lines: [
          line({ cartItemId: 11, productVariantId: 101 }),
          line({ cartItemId: null, productVariantId: 102 }),
        ],
        selectedVariantIds: new Set([101, 102]),
      }),
    ).toBeNull();
  });

  it("게스트는 로그인으로 보낸다", () => {
    // 주문·결제는 회원 전용이다. 빈 주문서로 보내는 것보다 로그인이 정직하다.
    expect(
      toCartOrderHref({
        source: { kind: "guest", guestId: "g-1" },
        lines: [line({ cartItemId: null })],
        selectedVariantIds: new Set([101]),
      }),
    ).toBe("/login");
  });

  it("아직 어느 카트인지 모르면 링크를 만들지 않는다", () => {
    expect(
      toCartOrderHref({
        source: null,
        lines: [line({})],
        selectedVariantIds: new Set([101]),
      }),
    ).toBeNull();
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart/model/cartOrderHref.test.ts`
Expected: FAIL — `Failed to resolve import "./cartOrderHref"`

- [ ] **Step 3: 판정 함수를 만든다**

`apps/web/src/entities/cart/model/cartOrderHref.ts`:

```ts
import { toOrderHref } from "@entities/order";

import type { CartSource } from "./cartSource";
import type { CartLine } from "./types";

interface ToCartOrderHrefArgs {
  source: CartSource | null;
  lines: ReadonlyArray<CartLine>;
  selectedVariantIds: ReadonlySet<number>;
}

/**
 * 장바구니의 `주문하기` 가 갈 곳.
 *
 * 주문·결제는 회원 전용이다(서버가 게스트 주문을 지원하지 않는다). 게스트는 같은 자리에서
 * 로그인으로 보낸다 — 빈 주문서로 보내는 것보다 정직하고, 게스트 라인은 `cartItemId` 가
 * 없어 주문서가 받을 수도 없다.
 *
 * 고른 것이 없으면 `null` 이고 버튼은 비활성이다.
 */
export const toCartOrderHref = ({
  source,
  lines,
  selectedVariantIds,
}: ToCartOrderHrefArgs): string | null => {
  if (!source || selectedVariantIds.size === 0) return null;

  if (source.kind === "guest") return "/login";

  const selected = lines.filter((line) =>
    selectedVariantIds.has(line.productVariantId),
  );

  const cartItemIds = selected
    .map((line) => line.cartItemId)
    .filter((cartItemId): cartItemId is number => cartItemId != null);

  // 고른 라인 중 하나라도 서버 id 가 없으면 링크를 만들지 않는다. 일부만 주문서로 넘기면
  // 사용자는 무엇이 빠졌는지 알 수 없다 — 담기의 all-or-nothing 과 같은 규칙이다.
  return cartItemIds.length && cartItemIds.length === selected.length
    ? toOrderHref({ type: "cart", cartItemIds })
    : null;
};
```

> `entities/cart` 가 `entities/order` 를 import 하는 것은 같은 레이어 간 참조다. 기존 `features/cart/ui/CartList.tsx` 가 이미 `@entities/order` 를 쓰고 있고, ESLint 의 FSD 규칙이 막지 않는다. `pnpm lint` 가 반대로 말하면 이 함수를 `features/cart/lib/cartOrderHref.ts` 로 옮기고 테스트 경로도 함께 옮긴다.

- [ ] **Step 4: 통과를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart/model/cartOrderHref.test.ts`
Expected: PASS (5개)

- [ ] **Step 5: 비로그인 담기가 되는 테스트를 고친다**

`apps/web/src/features/cart/model/useAddToCartDraft.test.tsx` 의 `authState.isAuthenticated = false` 케이스(598행 근처)를 바꾼다. 담기는 되고 구매하기는 막힌다:

```tsx
  it("비로그인이어도 담기는 된다", async () => {
    authState.isAuthenticated = false;

    const { result } = renderHook(() => useAddToCartDraft({ product }), {
      wrapper,
    });

    act(() => result.current.pickVariant(String(product.variants[0].id)));

    await act(async () => {
      expect(await result.current.submit()).toBe(true);
    });

    expect(addItems).toHaveBeenCalled();
  });

  it("비로그인이면 구매하기는 막는다", () => {
    // 주문·결제는 회원 전용이다.
    authState.isAuthenticated = false;

    const { result } = renderHook(() => useAddToCartDraft({ product }), {
      wrapper,
    });

    act(() => result.current.pickVariant(String(product.variants[0].id)));

    expect(result.current.toDirectItems()).toBeNull();
  });
```

- [ ] **Step 6: 실패를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/features/cart/model/useAddToCartDraft.test.tsx`
Expected: FAIL — 지금은 `submit()` 이 `login_required` 토스트를 띄우고 `false` 를 준다.

- [ ] **Step 7: 담기 게이트를 제거한다**

`apps/web/src/features/cart/model/useAddToCartDraft.ts` 의 `submit` 에서 인증 검사 세 줄을 지운다:

```ts
  const submit = useCallback(async () => {
    if (!lines.length) return false;
```

의존성 배열에서 `isAuthenticated` 를 뺀다. `toDirectItems` 의 검사(301행)는 **그대로 둔다** — 주문은 회원 전용이다. `isAuthenticated` 는 `toDirectItems` 가 계속 쓰므로 선언은 남긴다.

- [ ] **Step 8: 화면의 게이트 셋을 연다**

`apps/web/src/views/cart/ui/CartPage.tsx` — `AuthOnly` import 와 래핑을 제거하고 최상위를 `<div>` 로 되돌린다.

`apps/web/src/widgets/header/ui/CartButton.tsx` — 36행을 바꾼다:

```tsx
  // 게스트도 장바구니를 쓴다. 복원 전에는 숫자를 모르므로 배지만 감춘다.
  if (!hasAuthHydrated) return null;
```

`useUserAuthStore` import 와 `isAuthenticated` 선언이 남지 않게 지운다.

`apps/web/src/features/cart/ui/CartList.tsx` — 주문 링크를 판정 함수로 바꾼다:

```tsx
import { toCartOrderHref, useCartSource } from "@entities/cart";

  const source = useCartSource();

  const orderHref = toCartOrderHref({
    source,
    lines: items,
    selectedVariantIds: selection.selectedVariantIds,
  });
```

`@entities/order` 의 `toOrderHref` import 가 더 이상 쓰이지 않으면 지운다.

`apps/web/src/entities/cart/index.ts` 에 `export { toCartOrderHref } from "./model/cartOrderHref";` 를 추가한다.

- [ ] **Step 9: 전체 통과를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart src/features/cart && pnpm typecheck && pnpm lint`
Expected: 전부 통과

- [ ] **Step 10: 커밋**

```bash
git add apps/web/src
git commit -m "$(cat <<'EOF'
feat(web): let a signed-out visitor use the cart

Adding, the /cart route and the header icon were all gated on a login. They now
follow the cart that is actually in use, and only the two paths the server keeps
for members stay closed: buy-now on a product page, and the order CTA in the
cart, which sends a guest to the login screen instead of an order sheet it
cannot build without cart item ids.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: 로그인 시 게스트 카트 폐기

**Files:**
- Create: `apps/web/src/entities/cart/ui/GuestCartReset.tsx`
- Test: `apps/web/src/entities/cart/ui/GuestCartReset.test.tsx`
- Modify: `apps/web/src/app/[locale]/layout.tsx:134`
- Modify: `apps/web/src/entities/cart/index.ts`

**Interfaces:**
- Consumes: `useGuestCartIdStore` (Task 3)
- Produces: `GuestCartReset` (헤드리스 컴포넌트, `null` 을 렌더한다)

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`apps/web/src/entities/cart/ui/GuestCartReset.test.tsx`:

```tsx
import { act } from "react";

import { beforeEach, describe, expect, it } from "vitest";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import { render } from "@testing-library/react";

import { GuestCartReset } from "./GuestCartReset";
import { useGuestCartIdStore } from "../model/guestId";

describe("GuestCartReset", () => {
  beforeEach(() => {
    useUserAuthStore.setState({ isAuthenticated: false });
    useGuestCartIdStore.setState({ guestId: "g-1" });
  });

  it("로그인하면 게스트 ID 를 버린다", () => {
    render(<GuestCartReset />);
    expect(useGuestCartIdStore.getState().guestId).toBe("g-1");

    act(() => {
      useUserAuthStore.setState({ isAuthenticated: true });
    });

    expect(useGuestCartIdStore.getState().guestId).toBeNull();
  });

  it("로그아웃에서는 건드리지 않는다", () => {
    // 게스트로 담아둔 것이 있으면 로그아웃 후 그 카트로 돌아온다.
    useUserAuthStore.setState({ isAuthenticated: true });
    render(<GuestCartReset />);
    useGuestCartIdStore.setState({ guestId: "g-1" });

    act(() => {
      useUserAuthStore.setState({ isAuthenticated: false });
    });

    expect(useGuestCartIdStore.getState().guestId).toBe("g-1");
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart/ui/GuestCartReset.test.tsx`
Expected: FAIL — `Failed to resolve import "./GuestCartReset"`

- [ ] **Step 3: 컴포넌트를 만든다**

`apps/web/src/entities/cart/ui/GuestCartReset.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import { useGuestCartIdStore } from "../model/guestId";

/**
 * 로그인하면 게스트 장바구니를 버린다.
 *
 * 서버는 게스트 카트를 회원 카트로 옮겨주지 않고, 우리도 대신 옮기지 않는다 —
 * 게스트 모듈은 심사용 임시 기능이다. 로컬 ID 만 버리면 되고 `DELETE guest/cart` 는
 * 부르지 않는다 (서버 보관이 7일이라 알아서 정리된다).
 *
 * 반대 방향(로그아웃)에서는 건드리지 않는다. 게스트로 담아둔 것이 있으면 그 카트로 돌아온다.
 *
 * `GlobalQueryHandler` 에 넣지 않은 이유는 의존 방향이다 — `shared` 가 `entities/cart` 의
 * store 를 알면 역방향 참조가 된다.
 */
export function GuestCartReset() {
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const clearGuestId = useGuestCartIdStore((s) => s.clearGuestId);

  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (!wasAuthenticated.current && isAuthenticated) {
      clearGuestId();
    }

    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, clearGuestId]);

  return null;
}
```

- [ ] **Step 4: 통과를 확인한다**

Run: `pnpm --filter @seoul-moment/web exec vitest run src/entities/cart/ui/GuestCartReset.test.tsx`
Expected: PASS (2개)

- [ ] **Step 5: layout 에 마운트한다**

`apps/web/src/app/[locale]/layout.tsx` 의 `<GlobalQueryHandler />` (134행) 바로 아래에 `<GuestCartReset />` 를 추가하고, `@entities/cart` 에서 import 한다. barrel 에 `export { GuestCartReset } from "./ui/GuestCartReset";` 를 추가한다.

- [ ] **Step 6: 타입·린트·전체 테스트**

Run: `pnpm --filter @seoul-moment/web exec vitest run && pnpm typecheck && pnpm lint`
Expected: 전부 통과

- [ ] **Step 7: 커밋**

```bash
git add apps/web/src
git commit -m "$(cat <<'EOF'
feat(web): drop the guest cart on login

The server neither merges the guest cart into the member one nor offers a way to
do it, and the guest module is review-only, so signing in discards it. Only the
local id is dropped — the cart expires on its own after seven days, and calling
DELETE would add a request that can fail right after a login.

Signing out leaves the id alone, so a visitor who filled a guest cart earlier
finds it again.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: 문서 갱신과 최종 검증

**Files:**
- Modify: `apps/web/docs/cart.md`

- [ ] **Step 1: `cart.md` 를 실제 구조에 맞춘다**

다음을 반영한다.

- 파일 구조 트리에 `api/useCartSource.ts`·`useCartApi.ts`·`useMemberCart.ts`·`useGuestCart.ts`, `model/cartSource.ts`·`guestId.ts`·`cartOrderHref.ts`, `ui/GuestCartReset.tsx` 를 추가한다.
- "장바구니 화면" 다이어그램의 `AuthOnly` 분기를 `useCartSource` 분기로 바꾼다.
- Hook 표에 `useCartApi`·`useCartSource`·`useGuestCart`·`useMemberCart` 를 넣고, `useCart` 설명에 "회원·게스트를 가리지 않는 경계" 를 더한다.
- Service 표 아래에 게스트 엔드포인트 표(`shared/services/guestCart.ts`)를 추가한다.
- 쿼리 키 설명에 `["guest","cart",...]` 를 더한다.
- ADR 표에 설계 문서의 결정 7개를 옮긴다.
- **"알려진 제약 / TODO" 의 첫 줄 "비로그인 담기 불가" 를 지운다.** 대신 게스트 제약(7일 TTL · 병합 없음 · 주문 불가 · 심사 후 제거)을 적고 [설계 문서](../../../docs/superpowers/specs/2026-09-21-guest-cart-design.md)의 제거 절차를 링크한다.

- [ ] **Step 2: 전체 검증**

Run: `pnpm --filter @seoul-moment/web exec vitest run && pnpm typecheck && pnpm lint && pnpm --filter @seoul-moment/web exec next build`
Expected: 전부 통과. `next build` 는 서버 렌더 경로에서 store 접근이 깨지지 않는지 확인하는 용도다.

- [ ] **Step 3: 수동 확인 (비로그인 브라우저)**

`pnpm dev:web` 으로 띄우고 **로그아웃 상태**에서 확인한다.

1. 상품상세에서 조합을 고르고 `장바구니 담기` → 성공 토스트 + 헤더 배지 1
2. 새로고침 → 배지와 `/cart` 내용이 유지된다 (깜박임 없음)
3. `/cart` 에서 수량 스테퍼 조작 → 금액이 즉시 바뀌고 잠시 뒤 서버 반영
4. 선택 삭제 · 전체 삭제 · 되돌리기
5. `주문하기` → `/login`
6. 로그인 → 장바구니가 회원 카트로 바뀐다 (게스트에 담았던 것은 사라진다)
7. DevTools Application → localStorage 에 `guest-cart` 키가 사라졌는지 확인

- [ ] **Step 4: 커밋**

```bash
git add apps/web/docs/cart.md
git commit -m "$(cat <<'EOF'
docs(web): record the guest cart in the cart guide

The guide still said adding to the cart requires a login, which is now the one
thing that changed. It carries the adapter layout, the guest endpoints and the
constraints the guest cart comes with, including how to remove it once the
review is over.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**Spec coverage**

| 설계 문서 항목 | 구현 Task |
| --- | --- |
| 서버 API 계층 | 완료 (커밋 6608246) |
| `CartApi` 계약 | Task 2 |
| 라인 키 `productVariantId` 통일 | Task 1 |
| guestId 보관 | Task 3 |
| `useCartSource` 판정 표 4행 | Task 4 |
| 회원 어댑터 | Task 5 |
| 게스트 어댑터 (최초 발급 직렬화 · 404 폐기 · 선택 삭제 fan-out · `isPending` 처리) | Task 6 |
| 분기 한 곳 (`useCartApi`) · 계약 스위트 2회 | Task 7 |
| 뱃지 · 담기 게이트 · `AuthOnly` · 주문 동선 | Task 8 |
| 로그인 시 폐기 | Task 9 |
| 문서 · 검증 | Task 10 |
| E2E 미작성 (의도) | — |

**미확인 사항** — Task 7 Step 4 의 계약 스위트는 기존 `useCart.test.tsx` 의 mock 구조에 의존한다. `toCartResponse` 헬퍼는 그 파일의 `getUserCart` mock 안에 인라인되어 있으므로, 먼저 함수로 뽑아야 게스트 mock 이 재사용할 수 있다. 구현자는 Task 7 을 시작할 때 그 파일을 먼저 읽는다.
