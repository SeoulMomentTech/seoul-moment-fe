# 주문서 배송 방법 선택(택배 / 편의점 픽업) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 주문서 배송지 섹션에서 택배와 편의점 픽업을 탭으로 고르고, 편의점은 ECPay 전자지도를 같은 탭으로 다녀와 매장을 고른 뒤 배송비까지 확정되게 한다. 결제 연결은 하지 않는다.

**Architecture:** `features/order/model/useOrderShipping`이 탭·택배 폼·편의점 폼·매장 토큰·임시 저장(draft)을 한곳에서 들고, 화면은 그 값을 그리기만 한다. 지도 왕복은 `sessionStorage` draft(1시간)로 입력값을 지키고, 복귀 URL은 쿼리 없는 `/{locale}/order`라 돌아온 뒤 draft의 `sourceHref`로 원래 주문서에 되돌아간다. 배송비 미리보기는 매장 조회가 성공한 뒤에만 `cvsStoreToken`을 넣는다.

**Tech Stack:** Next.js 16 App Router, React 19, react-hook-form + zod, TanStack Query v5(`useAppQuery` 래퍼), nuqs, next-intl, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-04-order-shipping-method-design.md`

## Global Constraints

- FSD 하향 import만 허용: `views → widgets → features → entities → shared`. `features/order`는 `entities/*`와 `shared/*`만 본다.
- `@tanstack/react-query` 훅 직접 사용 금지(ESLint). `useAppQuery`/`useAppMutation`만 쓴다. 이미 있는 `useLogisticsCvsStoreQuery`(`@entities/logistics`)를 재사용한다.
- 라우팅 헬퍼는 `@/i18n/navigation`에서만(`useRouter`, `getPathname`). `next/navigation`의 `useRouter` 금지.
- 아이콘은 `lucide-react`만.
- 개인정보(이름·전화·주소)를 URL 쿼리에 싣지 않는다. 쿼리는 `cvsStoreToken`과 `?cart=`/`?buy=`뿐.
- 서버 규칙(스웨거): CVS `recipientName`은 중문 2–5자 또는 영문 4–10자(공백·숫자 불가), `phone`은 `09`로 시작하는 10자리. 매장 토큰은 1시간 유효(만료 404).
- i18n 키는 `snake_case`. `pnpm dev:web`은 시작 시 Google Sheet에서 `messages/*.json`을 덮어쓴다. 로컬에서 키를 넣은 뒤 dev를 돌릴 때는 `pnpm --filter @seoul-moment/web exec next dev --turbopack`으로 sync를 건너뛰거나, 시트에 먼저 키를 넣는다(서비스 계정은 읽기 전용이라 시트 편집은 브라우저로).
- 커밋 전 `pnpm --filter @seoul-moment/web exec eslint --fix <files>`와 `pnpm --filter @seoul-moment/web typecheck`가 깨끗해야 한다. husky가 lint-staged를 돌린다.
- 테스트 실행: `cd apps/web && pnpm vitest run <path>`.
- 커밋 메시지는 Conventional Commits, 영문, 끝에 `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Review Focus

- **sessionStorage가 막힌 브라우저(Safari 프라이빗)에서 칩을 누름** — 저장이 throw 해도 지도 이동은 되어야 한다. → Task 2 테스트 `저장이 실패해도 throw 하지 않는다`, Task 4 테스트 `저장이 실패해도 지도로 이동한다`.
- **복귀 URL에 토큰은 있는데 draft가 없음(만료·다른 탭·저장 실패)** — 토큰만 URL에서 지우고 "주문할 것이 없음" 화면이 떠야 하며 크래시가 없어야 한다. → Task 3 테스트 `draft 가 없으면 토큰만 지운다`.
- **편의점 매장을 고른 뒤 택배 탭으로 돌아감** — 미리보기는 택배 주소 기준이어야 하고 결제 활성도 택배 스키마로 판정해야 한다. → Task 4 테스트 `택배 탭으로 돌아오면 미리보기와 유효성이 택배 기준이다`.
- **draft 복원 뒤 프로필이 늦게 도착** — 직접 입력(`useDefaultShipping=false`)으로 복원된 값을 프로필이 덮어쓰면 안 된다. → Task 4 테스트 `복원된 직접 입력 주소를 늦게 온 프로필이 덮지 않는다`.
- **이미 고른 매장의 체인 칩을 다시 누름** — 지도로 가지 않아야 한다(토큰·입력 유지). → Task 4 테스트 `같은 체인 칩을 다시 누르면 지도로 가지 않는다`.

## File Structure

| 파일 | 책임 |
| --- | --- |
| `apps/web/src/features/order/model/schema.ts` (수정) | 편의점 수령인·휴대폰 규칙, `orderCvsPickupSchema`, 에러 키 |
| `apps/web/src/features/order/model/cvsChain.ts` (신규) | 체인 → 표시명 상수 |
| `apps/web/src/features/order/model/orderDraft.ts` (신규) | draft 저장·조회·소비·TTL. 브라우저 저장소만 다루고 React를 모른다 |
| `apps/web/src/features/order/model/useOrderCvsReturn.ts` (신규) | `?cvsStoreToken=` 복귀 처리. draft에 토큰을 넣고 원래 주문서로 보낸다 |
| `apps/web/src/features/order/model/useOrderShipping.ts` (수정) | 탭·택배 폼·편의점 폼·매장·draft 복원·`openCvsMap`·`previewShipping`·`submitShipping`·`paymentMethod` |
| `apps/web/src/features/order/model/useOrderItems.ts` (수정) | `{ source, previewShipping }`를 받아 미리보기 호출 |
| `apps/web/src/features/order/ui/OrderShippingMethodTabs.tsx` (신규) | 세그먼트 탭 |
| `apps/web/src/features/order/ui/OrderCvsStoreCard.tsx` (신규) | 매장 카드 / 빈 안내 / 만료 / 스켈레톤 |
| `apps/web/src/features/order/ui/OrderCvsPickupPanel.tsx` (신규) | 칩 + 카드 + 받는 분·휴대폰 |
| `apps/web/src/features/order/ui/OrderShippingSection.tsx` (수정) | 탭 + 두 패널 분기. 기존 본문은 택배 패널로 감싼다 |
| `apps/web/src/features/order/index.tsx` (수정) | 새 export |
| `apps/web/src/views/order/ui/OrderPage.tsx` (수정) | 새 훅 값 배선, 편의점 지역 라벨 |
| `apps/web/src/i18n/messages/{ko,en,zh-TW}.json` (수정) | 새 키 9개 |

---

### Task 1: 편의점 수령인·휴대폰 스키마와 체인 상수

**Files:**
- Modify: `apps/web/src/features/order/model/schema.ts`
- Create: `apps/web/src/features/order/model/cvsChain.ts`
- Test: `apps/web/src/features/order/model/schema.test.ts`

**Interfaces:**
- Consumes: `toPhoneDigits`, `toLocalMobile` (이미 `schema.ts`에 있음), `CvsChain` (`@shared/services/logistics`)
- Produces:
  ```ts
  // schema.ts
  export const isValidCvsRecipientName: (value: string) => boolean;
  /** 어떤 형식(+886…, 886…, 0912…, 912…)이든 `09` + 8자리로. 유효하지 않으면 "" */
  export const toCvsPhone: (value: string) => string;
  export const isValidCvsPhone: (value: string) => boolean;
  export const orderCvsPickupSchema: z.ZodObject<{ recipientName; phone }>;
  export type OrderCvsPickupValues = z.infer<typeof orderCvsPickupSchema>;
  export const orderCvsPickupResolver: Resolver<OrderCvsPickupValues>;
  export const CVS_ERROR_KEY: Record<keyof OrderCvsPickupValues, string>;
  // cvsChain.ts
  export const CVS_CHAINS: ReadonlyArray<{ chain: CvsChain; label: string }>;
  export const getCvsChainLabel: (chain: CvsChain) => string;
  ```

- [ ] **Step 1: `schema.test.ts`에 실패하는 테스트 추가**

```ts
describe("isValidCvsRecipientName", () => {
  it.each(["李佳蓉", "王明", "歐陽靖雯慧"])("중문 2–5자 %s 를 허용한다", (v) =>
    expect(isValidCvsRecipientName(v)).toBe(true));
  it.each(["Amy", "JohnSmith", "ChristopherA"])("영문 4–10자 %s", (v) =>
    expect(isValidCvsRecipientName(v)).toBe(v.length >= 4 && v.length <= 10));
  it("공백·숫자·한 글자·혼용은 거부한다", () => {
    for (const v of ["李", "李佳蓉慧雯靖", "John Smith", "John1", "李Amy", ""]) {
      expect(isValidCvsRecipientName(v)).toBe(false);
    }
  });
});

describe("toCvsPhone / isValidCvsPhone", () => {
  it.each(["+886912345678", "+886 912 345 678", "886912345678", "0912345678", "912345678", "0912-345-678"])(
    "%s → 0912345678", (v) => expect(toCvsPhone(v)).toBe("0912345678"));
  it("09 가 아니거나 자리수가 어긋나면 빈 문자열이다", () => {
    expect(toCvsPhone("0212345678")).toBe("");
    expect(toCvsPhone("09123456789")).toBe("");
    expect(isValidCvsPhone("")).toBe(false);
  });
});

describe("orderCvsPickupSchema", () => {
  it("실명과 휴대폰이 맞아야 통과한다", () => {
    expect(orderCvsPickupSchema.safeParse({ recipientName: "李佳蓉", phone: "0912345678" }).success).toBe(true);
    expect(orderCvsPickupSchema.safeParse({ recipientName: "李", phone: "0912345678" }).success).toBe(false);
    expect(orderCvsPickupSchema.safeParse({ recipientName: "李佳蓉", phone: "+886912" }).success).toBe(false);
  });
});

describe("getCvsChainLabel", () => {
  it("UNIMART → 7-ELEVEN, FAMI → 全家, HILIFE → 萊爾富", () => { /* 세 개 expect */ });
});
```

- [ ] **Step 2: 실패 확인** — `pnpm vitest run src/features/order/model/schema.test.ts` → `isValidCvsRecipientName is not a function` 류로 FAIL.

- [ ] **Step 3: 구현.** `isValidCvsRecipientName`: `/^[一-鿿]{2,5}$/` 또는 `/^[A-Za-z]{4,10}$/`. `toCvsPhone`: `toLocalMobile(value)`가 `/^9\d{8}$/`면 `"0" + local`, 아니면 `""`. 스키마는 `z.object({ recipientName: z.string().trim().refine(isValidCvsRecipientName), phone: z.string().refine(isValidCvsPhone) })`. `CVS_ERROR_KEY = { recipientName: "cvs_recipient_invalid", phone: "cvs_phone_invalid" }`. `cvsChain.ts`는 `[{ chain: "UNIMART", label: "7-ELEVEN" }, { chain: "FAMI", label: "全家" }, { chain: "HILIFE", label: "萊爾富" }]`.

- [ ] **Step 4: 통과 확인** — 같은 명령, PASS.

- [ ] **Step 5: 커밋** — `feat(web): add cvs pickup schema and chain labels for the order form`

---

### Task 2: 주문서 임시 저장(draft)

**Files:**
- Create: `apps/web/src/features/order/model/orderDraft.ts`
- Test: `apps/web/src/features/order/model/orderDraft.test.ts`

**Interfaces:**
- Consumes: `OrderShippingValues` (Task 1 파일), `UserOrderPaymentMethod` (`@shared/services/userOrder`), `CvsChain` (`@shared/services/logistics`)
- Produces:
  ```ts
  export const ORDER_DRAFT_KEY = "order:draft";
  export const ORDER_DRAFT_TTL_MS = 60 * 60 * 1000;
  export interface OrderDraft {
    sourceHref: string;                       // toOrderHref(source)
    shippingMethod: "HOME" | "CVS";
    home: { useDefaultShipping: boolean; values: OrderShippingValues };
    cvs: { chain: CvsChain | null; storeToken: string | null; recipientName: string; phone: string };
    paymentMethod: UserOrderPaymentMethod;
    savedAt: number;
  }
  /** savedAt 을 지금으로 채워 저장. 저장소가 없거나 throw 하면 조용히 무시 */
  export const saveOrderDraft: (draft: Omit<OrderDraft, "savedAt">) => void;
  /** 있고 만료 전이면 돌려준다. 만료·손상이면 지우고 null */
  export const peekOrderDraft: () => OrderDraft | null;
  /** sourceHref 가 같은 draft 를 돌려주고 지운다. 다르면 건드리지 않고 null */
  export const takeOrderDraft: (sourceHref: string) => OrderDraft | null;
  export const clearOrderDraft: () => void;
  ```

- [ ] **Step 1: 실패하는 테스트 작성** (`vi.useFakeTimers()`로 `Date.now` 고정, `beforeEach(() => sessionStorage.clear())`)

```ts
const draft = { sourceHref: "/order?cart=1,2", shippingMethod: "CVS", home: { useDefaultShipping: true, values: EMPTY_HOME }, cvs: { chain: "UNIMART", storeToken: null, recipientName: "李佳蓉", phone: "0912345678" }, paymentMethod: "LINE_PAY" } as const;

it("저장한 draft 를 같은 sourceHref 로 가져오면 지워진다", () => {
  saveOrderDraft(draft);
  expect(takeOrderDraft("/order?cart=1,2")).toMatchObject(draft);
  expect(peekOrderDraft()).toBeNull();
});
it("다른 sourceHref 면 돌려주지 않고 남겨 둔다", () => {
  saveOrderDraft(draft);
  expect(takeOrderDraft("/order?buy=101:1")).toBeNull();
  expect(peekOrderDraft()).not.toBeNull();
});
it("1시간이 지나면 버린다", () => {
  saveOrderDraft(draft);
  vi.advanceTimersByTime(ORDER_DRAFT_TTL_MS + 1);
  expect(peekOrderDraft()).toBeNull();
  expect(sessionStorage.getItem(ORDER_DRAFT_KEY)).toBeNull();
});
it("손상된 JSON 은 지우고 null 이다", () => {
  sessionStorage.setItem(ORDER_DRAFT_KEY, "{not json");
  expect(peekOrderDraft()).toBeNull();
});
it("저장이 실패해도 throw 하지 않는다", () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("QuotaExceeded"); });
  expect(() => saveOrderDraft(draft)).not.toThrow();
});
```

- [ ] **Step 2: 실패 확인** — `pnpm vitest run src/features/order/model/orderDraft.test.ts` → FAIL (모듈 없음).

- [ ] **Step 3: 구현.** 모든 저장소 접근은 `typeof window === "undefined"` 가드 + try/catch. `peekOrderDraft`는 파싱 실패·`savedAt` 누락·TTL 초과 시 `removeItem` 후 null.

- [ ] **Step 4: 통과 확인** — PASS.

- [ ] **Step 5: 커밋** — `feat(web): add session draft for the order form round trip`

---

### Task 3: 복귀 처리 훅 `useOrderCvsReturn`

**Files:**
- Create: `apps/web/src/features/order/model/useOrderCvsReturn.ts`
- Test: `apps/web/src/features/order/model/useOrderCvsReturn.test.tsx`

**Interfaces:**
- Consumes: `peekOrderDraft`, `saveOrderDraft` (Task 2), `toOrderHref`, `OrderSource` (`@entities/order`), `useRouter` (`@/i18n/navigation`), nuqs `useQueryState("cvsStoreToken", parseAsString)`
- Produces:
  ```ts
  /**
   * `/order?cvsStoreToken=x` 로 돌아왔을 때 한 번만 실행된다.
   * - draft 가 있으면 토큰을 draft.cvs.storeToken 에 넣어 다시 저장하고,
   *   현재 URL 의 주문 대상이 draft.sourceHref 와 다르면 router.replace(draft.sourceHref)
   *   (isRedirecting=true), 같으면 토큰 쿼리만 지운다.
   * - draft 가 없으면 토큰 쿼리만 지운다.
   */
  export const useOrderCvsReturn: (source: OrderSource | null) => { isRedirecting: boolean };
  ```

- [ ] **Step 1: 실패하는 테스트 작성.** wrapper는 `NuqsTestingAdapter`(`orderSource.test.tsx` 방식). `vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ replace }) }))`. `onUrlUpdate` 콜백으로 토큰 제거를 확인한다.

```ts
it("draft 가 있으면 토큰을 넣고 원래 주문서로 보낸다", () => {
  saveOrderDraft({ ...draft, sourceHref: "/order?cart=1,2" });
  const { result } = render("?cvsStoreToken=tok123", null);
  expect(peekOrderDraft()?.cvs.storeToken).toBe("tok123");
  expect(replace).toHaveBeenCalledWith("/order?cart=1,2");
  expect(result.current.isRedirecting).toBe(true);
});
it("주문 대상이 이미 같으면 토큰만 URL 에서 지운다", () => {
  saveOrderDraft({ ...draft, sourceHref: "/order?cart=1,2" });
  render("?cart=1,2&cvsStoreToken=tok123", { type: "cart", cartItemIds: [1, 2] });
  expect(replace).not.toHaveBeenCalled();
  expect(lastUrl.searchParams.has("cvsStoreToken")).toBe(false);
});
it("draft 가 없으면 토큰만 지운다", () => {
  const { result } = render("?cvsStoreToken=tok123", null);
  expect(replace).not.toHaveBeenCalled();
  expect(result.current.isRedirecting).toBe(false);
  expect(lastUrl.searchParams.has("cvsStoreToken")).toBe(false);
});
it("토큰이 없으면 아무것도 하지 않는다", () => { /* replace 미호출, draft 그대로 */ });
```

- [ ] **Step 2: 실패 확인** — `pnpm vitest run src/features/order/model/useOrderCvsReturn.test.tsx` → FAIL.

- [ ] **Step 3: 구현.** `useRef(false)`로 1회 실행. 토큰 제거는 `setToken(null, { history: "replace" })`. 비교는 `source ? toOrderHref(source) === draft.sourceHref : false`.

- [ ] **Step 4: 통과 확인** — PASS.

- [ ] **Step 5: 커밋** — `feat(web): handle the cvs map return on the order page`

---

### Task 4: `useOrderShipping` 확장 (탭 · 편의점 폼 · 매장 · draft · 지도 이동)

**Files:**
- Modify: `apps/web/src/features/order/model/useOrderShipping.ts`
- Modify: `apps/web/src/features/order/model/useOrderItems.ts`
- Test: `apps/web/src/features/order/model/useOrderShipping.test.ts` (기존 5개 유지 + 추가)

**Interfaces:**
- Consumes: Task 1·2 전부, `useLogisticsCvsStoreQuery` + `getLogisticsCvsMapUrl` (`@entities/logistics`), `toOrderHref`/`OrderSource`/`useOrderPreviewQuery` (`@entities/order`), `getPathname` (`@/i18n/navigation`), `useLanguage` (`@shared/lib/hooks`), `UserOrderShippingType`·`UserOrderCvsPickup`·`UserOrderShipping`·`UserOrderPaymentMethod` (`@shared/services/userOrder`)
- Produces (기존 반환값에 추가):
  ```ts
  interface UseOrderShippingParams { profile?: UserProfile; userInfo?: UserInfo; source: OrderSource | null }

  export type OrderPreviewShipping =
    | { shippingType: "HOME"; city?: string; district?: string }
    | { shippingType: "CVS"; cvsStoreToken?: string };

  export type OrderSubmitShipping =
    | { shippingType: "HOME"; useDefaultShipping: true }
    | { shippingType: "HOME"; useDefaultShipping: false; shipping: UserOrderShipping }
    | { shippingType: "CVS"; cvsPickup: UserOrderCvsPickup };

  // 반환값
  shippingMethod: UserOrderShippingType;
  setShippingMethod(next: UserOrderShippingType): void;
  paymentMethod: UserOrderPaymentMethod;            // OrderPage 의 useState 를 여기로 옮긴다
  setPaymentMethod(next: UserOrderPaymentMethod): void;
  cvs: {
    chain: CvsChain | null;
    storeToken: string | null;
    store: GetLogisticsCvsStoreRes | undefined;
    isStoreLoading: boolean;
    isStoreExpired: boolean;                        // 조회 에러의 response.status === 404
    form: UseFormReturn<OrderCvsPickupValues>;
    openCvsMap(chain: CvsChain): void;              // 같은 체인 매장이 이미 있으면 no-op
  };
  previewShipping: OrderPreviewShipping;            // CVS 는 store 가 있을 때만 cvsStoreToken 포함
  isValid: boolean;                                 // 탭에 맞는 스키마 (CVS 는 store 도 필요)
  submitShipping: OrderSubmitShipping | null;       // isValid 가 false 면 null
  ```
  `useOrderItems({ source, previewShipping })` — 기존 `{ city, district }` 대신.

- [ ] **Step 1: 기존 테스트를 새 시그니처로 옮기고 실패하는 테스트 추가.** wrapper: `QueryClientProvider`(retry: false) + `NuqsTestingAdapter`. 모킹: `@shared/services/logistics`의 `getLogisticsCvsStore`(vi.fn), `@/i18n/navigation`의 `getPathname: ({ href, locale }) => \`/${locale}${href}\``, `next/navigation`의 `useParams: () => ({ locale: "ko" })`. `window.location.assign`은 `vi.spyOn(window.location, "assign")`가 jsdom에서 막히므로 `Object.defineProperty(window, "location", { value: { ...window.location, assign: vi.fn(), origin: "http://localhost:3000" } })`로 대체한다.

```ts
const source: OrderSource = { type: "cart", cartItemIds: [1, 2] };
const store = { storeToken: "tok123", chain: "UNIMART", logisticsSubType: "UNIMARTC2C", storeId: "131386", storeName: "建盛門市", storeAddress: "台北市中正區重慶南路一段122號", storeTelephone: null, isOutsideIsland: false };

it("기본은 택배이고 편의점 폼은 프로필 이름과 09 번호로 채워진다", async () => {
  // profile.name "李佳蓉", userInfo.phone "+886912345678"
  expect(result.current.shippingMethod).toBe("HOME");
  await waitFor(() => expect(result.current.cvs.form.getValues()).toEqual({ recipientName: "李佳蓉", phone: "0912345678" }));
});
it("편의점 탭은 매장이 없으면 유효하지 않고 미리보기에 토큰을 넣지 않는다", async () => {
  act(() => result.current.setShippingMethod("CVS"));
  expect(result.current.previewShipping).toEqual({ shippingType: "CVS" });
  await waitFor(() => expect(result.current.isValid).toBe(false));
  expect(result.current.submitShipping).toBeNull();
});
it("칩을 누르면 draft 를 저장하고 쿼리 없는 복귀 주소로 지도에 간다", () => {
  act(() => result.current.cvs.openCvsMap("FAMI"));
  expect(peekOrderDraft()).toMatchObject({ sourceHref: "/order?cart=1,2", shippingMethod: "CVS", cvs: { chain: "FAMI" }, paymentMethod: "LINE_PAY" });
  expect(window.location.assign).toHaveBeenCalledWith(expect.stringContaining("returnUrl=http%3A%2F%2Flocalhost%3A3000%2Fko%2Forder"));
  expect(window.location.assign).toHaveBeenCalledWith(expect.stringContaining("chain=FAMI"));
});
it("저장이 실패해도 지도로 이동한다", () => { /* setItem throw 스파이 → assign 호출됨 */ });
it("같은 체인 칩을 다시 누르면 지도로 가지 않는다", async () => {
  saveOrderDraft({ ...draft, sourceHref: "/order?cart=1,2", cvs: { chain: "UNIMART", storeToken: "tok123", recipientName: "李佳蓉", phone: "0912345678" } });
  getLogisticsCvsStore.mockResolvedValue({ result: true, data: store });
  // 마운트 → 복원 → 조회 성공
  await waitFor(() => expect(result.current.cvs.store).toEqual(store));
  act(() => result.current.cvs.openCvsMap("UNIMART"));
  expect(window.location.assign).not.toHaveBeenCalled();
});
it("draft 를 복원하면 매장 조회 성공 뒤에야 미리보기에 토큰이 들어가고 제출값이 생긴다", async () => {
  // 위와 같은 draft, 조회를 지연 resolve
  expect(result.current.previewShipping).toEqual({ shippingType: "CVS" });
  resolveStore();
  await waitFor(() => expect(result.current.previewShipping).toEqual({ shippingType: "CVS", cvsStoreToken: "tok123" }));
  expect(result.current.isValid).toBe(true);
  expect(result.current.submitShipping).toEqual({ shippingType: "CVS", cvsPickup: { storeToken: "tok123", recipientName: "李佳蓉", phone: "0912345678" } });
  expect(peekOrderDraft()).toBeNull(); // 복원 즉시 삭제
});
it("매장 조회가 404 면 만료로 표시하고 토큰을 비운다", async () => {
  getLogisticsCvsStore.mockRejectedValue(Object.assign(new Error("404"), { response: { status: 404 } }));
  await waitFor(() => expect(result.current.cvs.isStoreExpired).toBe(true));
  expect(result.current.cvs.storeToken).toBeNull();
  expect(result.current.isValid).toBe(false);
});
it("택배 탭으로 돌아오면 미리보기와 유효성이 택배 기준이다", async () => {
  // CVS 매장까지 고른 상태에서
  act(() => result.current.setShippingMethod("HOME"));
  expect(result.current.previewShipping).toEqual({ shippingType: "HOME", city: "臺北市", district: "信義區" });
  await waitFor(() => expect(result.current.isValid).toBe(true));
  expect(result.current.submitShipping).toEqual({ shippingType: "HOME", useDefaultShipping: true });
});
it("복원된 직접 입력 주소를 늦게 온 프로필이 덮지 않는다", async () => {
  saveOrderDraft({ ...draft, shippingMethod: "HOME", home: { useDefaultShipping: false, values: { ...EMPTY, recipientName: "陳小明", city: "臺中市", district: "西屯區", postalCode: "407", detailAddress: "X", phone: "912000000", requestMessage: "shipping_request_none" } } });
  const { result, rerender } = renderHook((p) => useOrderShipping(p), { initialProps: { source }, wrapper });
  rerender({ source, profile, userInfo });
  await waitFor(() => expect(result.current.shipping.recipientName).toBe("陳小明"));
  expect(result.current.useDefaultShipping).toBe(false);
});
```

- [ ] **Step 2: 실패 확인** — `pnpm vitest run src/features/order/model/useOrderShipping.test.ts` → FAIL.

- [ ] **Step 3: 구현.**
  - 상태: `shippingMethod`(기본 `"HOME"`), `paymentMethod`(기본 `"LINE_PAY"`), `chain`, `storeToken`.
  - 편의점 폼: `useForm<OrderCvsPickupValues>({ resolver: orderCvsPickupResolver, defaultValues: { recipientName: "", phone: "" }, mode: "onBlur" })`. 프로필 주입 효과: 폼이 비어 있을 때만 `reset({ recipientName: profile.name ?? "", phone: toCvsPhone(userInfo.phone ?? "") })`.
  - 매장 조회: `useLogisticsCvsStoreQuery(storeToken)`. 404(`error.response.status === 404`, ky `HTTPError`)가 오면 효과에서 `setStoreExpired(true)`와 `setStoreToken(null)`을 함께 한다. `isStoreExpired`는 쿼리 에러가 아니라 이 **별도 state**다 — 토큰을 비우면 쿼리가 꺼져 에러도 사라지므로 에러에서 파생하면 곧바로 false로 돌아간다. `openCvsMap`과 draft 복원에서 새 토큰이 들어오면 false로 되돌린다.
  - draft 복원 효과: `sourceHref = source ? toOrderHref(source) : null`을 키로, 값이 생겼을 때 `takeOrderDraft(sourceHref)` → 있으면 `shippingMethod`·`paymentMethod`·`chain`·`storeToken`·`home.useDefaultShipping`·`reset(home.values)`·`cvsForm.reset(cvs)`. `restoredRef`로 1회.
  - 프로필 주입 효과(`fillFromProfile`)는 복원 효과보다 **뒤에** 선언하고, `useDefaultShipping`이 false면 건너뛴다(기존 조건 그대로). 복원이 `useDefaultShipping=false`를 먼저 세우므로 덮지 않는다.
  - `openCvsMap(next)`: `next === chain && storeToken && store` 면 return. 아니면 `saveOrderDraft({...})` 후 `window.location.assign(getLogisticsCvsMapUrl({ chain: next, returnUrl: \`${window.location.origin}${getPathname({ href: "/order", locale })}\` }))`.
  - `previewShipping`: HOME → `{ shippingType: "HOME", city: city || undefined, district: district || undefined }`; CVS → `store ? { shippingType: "CVS", cvsStoreToken: store.storeToken } : { shippingType: "CVS" }`.
  - `isValid`: HOME → 기존; CVS → `!!store && orderCvsPickupSchema.safeParse(cvsValues).success`.
  - `submitShipping`: `isValid`일 때만. HOME+기본 → `{ shippingType: "HOME", useDefaultShipping: true }`, HOME+직접 → `{ ..., useDefaultShipping: false, shipping }`, CVS → `{ shippingType: "CVS", cvsPickup: { storeToken: store.storeToken, recipientName: trim, phone: toCvsPhone(phone) } }`.
  - `useOrderItems`: `useOrderPreviewQuery({ source, ...previewShipping })` — `shippingType`이 `"HOME"`이면 `city`/`district`, `"CVS"`면 `cvsStoreToken`을 넘긴다. `useOrderSource()` 호출은 제거하고 `source`를 인자로 받는다.

- [ ] **Step 4: 통과 확인** — 같은 파일 PASS. 그리고 `pnpm vitest run src/features/order src/entities/order` 전체 PASS.

- [ ] **Step 5: 커밋** — `feat(web): add shipping method, cvs pickup state, and draft restore to the order form model`

---

### Task 5: UI — 탭, 매장 카드, 편의점 패널, 섹션 분기, i18n 키

**Files:**
- Create: `apps/web/src/features/order/ui/OrderShippingMethodTabs.tsx`
- Create: `apps/web/src/features/order/ui/OrderCvsStoreCard.tsx`
- Create: `apps/web/src/features/order/ui/OrderCvsPickupPanel.tsx`
- Modify: `apps/web/src/features/order/ui/OrderShippingSection.tsx`
- Modify: `apps/web/src/features/order/index.tsx`
- Modify: `apps/web/src/i18n/messages/ko.json`, `en.json`, `zh-TW.json`
- Test: `apps/web/src/features/order/ui/OrderCvsPickupPanel.test.tsx`

**Interfaces:**
- Consumes: Task 1 (`CVS_CHAINS`, `CVS_ERROR_KEY`, `OrderCvsPickupValues`), Task 4 반환값의 `cvs`
- Produces:
  ```tsx
  export function OrderShippingMethodTabs(props: { value: UserOrderShippingType; onChange(next: UserOrderShippingType): void }): JSX.Element;
  // role="tablist" + 두 개의 role="tab" button, aria-selected, 선택된 탭은 검정 배경 흰 글씨
  export function OrderCvsStoreCard(props: {
    store: GetLogisticsCvsStoreRes | undefined; isLoading: boolean; isExpired: boolean; onReselect(): void;
  }): JSX.Element;
  export function OrderCvsPickupPanel(props: {
    form: UseFormReturn<OrderCvsPickupValues>; chain: CvsChain | null;
    store: GetLogisticsCvsStoreRes | undefined; isStoreLoading: boolean; isStoreExpired: boolean;
    onOpenMap(chain: CvsChain): void;
  }): JSX.Element;
  // OrderShippingSection 에 추가되는 props
  shippingMethod: UserOrderShippingType; onShippingMethodChange(next): void;
  cvs: ReturnType<typeof useOrderShipping>["cvs"];   // Task 4 의 cvs 객체를 그대로 받는다
  // 섹션이 패널에 풀어 넘긴다: form, chain, store, isStoreLoading, isStoreExpired, onOpenMap={cvs.openCvsMap}
  ```

- [ ] **Step 1: i18n 키 추가.** 세 JSON 파일 끝(마지막 키 `language_setting` 뒤)에 같은 순서로 추가한다. 스펙 표의 ko 문구를 그대로 쓰고 en·zh-TW는 다음을 쓴다.

| 키 | en | zh-TW |
| --- | --- | --- |
| `shipping_method_home` | Home delivery | 宅配 |
| `shipping_method_cvs` | Convenience store pickup | 超商取貨 |
| `cvs_chain` | Convenience store | 超商 |
| `cvs_store_empty` | Choose a convenience store to pick a branch | 請選擇超商並挑選門市 |
| `cvs_store_expired` | Your store selection expired. Please choose again | 門市選擇已過期，請重新選擇 |
| `cvs_store_reselect` | Choose another store | 重新選擇門市 |
| `cvs_recipient_placeholder` | Full name (2–5 Chinese or 4–10 English letters) | 真實姓名（中文2–5字 / 英文4–10字） |
| `cvs_recipient_invalid` | ID is checked at pickup. Enter your real name: 2–5 Chinese or 4–10 English letters | 取貨時需核對證件，請輸入真實姓名：中文2–5字或英文4–10字 |
| `cvs_phone_invalid` | Enter a 10-digit mobile number starting with 09 | 請輸入09開頭的10碼手機號碼 |

- [ ] **Step 2: 실패하는 테스트 작성** (`OrderCvsPickupPanel.test.tsx`). `next-intl`은 `vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))`. 폼은 테스트 안에서 `useForm` 래퍼로 만든다.

```ts
it("매장이 없으면 안내 문구와 체인 칩 세 개를 그린다", () => {
  render(<Panel store={undefined} chain={null} />);
  expect(screen.getByText("cvs_store_empty")).toBeInTheDocument();
  expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(3);
});
it("칩을 누르면 그 체인으로 onOpenMap 을 부른다", () => {
  fireEvent.click(screen.getByRole("button", { name: "全家" }));
  expect(onOpenMap).toHaveBeenCalledWith("FAMI");
});
it("매장이 있으면 체인명·매장명·ID·주소와 다시 고르기 링크를 그린다", () => {
  render(<Panel store={store} chain="UNIMART" />);
  expect(screen.getByText("7-ELEVEN 建盛門市 · 131386")).toBeInTheDocument();
  expect(screen.getByText("台北市中正區重慶南路一段122號")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /cvs_store_reselect/ }));
  expect(onOpenMap).toHaveBeenCalledWith("UNIMART");
});
it("만료면 만료 문구를 그린다", () => {
  render(<Panel store={undefined} chain="UNIMART" isStoreExpired />);
  expect(screen.getByText("cvs_store_expired")).toBeInTheDocument();
});
```

- [ ] **Step 3: 실패 확인** — `pnpm vitest run src/features/order/ui/OrderCvsPickupPanel.test.tsx` → FAIL.

- [ ] **Step 4: 구현.**
  - `OrderShippingMethodTabs`: `grid grid-cols-2` 안에 `button[role=tab]` 두 개, `h-11 rounded-[4px] border border-black/10 text-body-3`, 선택은 `bg-black text-white font-semibold`. 라벨 `t("shipping_method_home")`/`t("shipping_method_cvs")`.
  - `OrderCvsStoreCard`: `isLoading` → `Skeleton`(`@seoul-moment/ui`) `h-24`; `isExpired` → `text-danger text-body-4`로 `cvs_store_expired`; `store` 없음 → `text-neutral text-body-4`로 `cvs_store_empty`; `store` 있음 → `rounded-[4px] border border-black/10 p-4` 카드에 1행 `font-semibold`(`{getCvsChainLabel(store.chain)} {store.storeName} · {store.storeId}`), 2행 주소, 3행 `button`(`text-body-4 text-primary`) `{t("cvs_store_reselect")} ›`.
  - `OrderCvsPickupPanel`: `FieldLabel` 스타일로 `t("cvs_chain")` 라벨, `Chip`(`@shared/ui/chip`) 세 개에 `active={chain === item.chain}` + `aria-pressed`, `onClick={() => onOpenMap(item.chain)}`. 아래 `OrderCvsStoreCard`. 아래 2열 격자(`TWO_COLUMN_CLASS`와 같은 클래스)에 받는 분(`placeholder={t("cvs_recipient_placeholder")}`), 휴대폰(`inputMode="tel"`, `placeholder="0912345678"`, `+886` 접두 없음). 에러는 `CVS_ERROR_KEY`로 `FieldError`.
  - `OrderShippingSection`: 맨 위에 `OrderShippingMethodTabs`(`mb-4`). `shippingMethod === "CVS"`면 `OrderCvsPickupPanel`만, 아니면 기존 본문(체크박스·주소·요청사항) 그대로. `FieldLabel`·`FieldError`·`TWO_COLUMN_CLASS`는 패널에서도 쓰므로 `ui/orderFields.tsx`로 옮겨 두 파일이 import 한다 (export 이름 유지).
  - `features/order/index.tsx`에 새 컴포넌트와 `useOrderCvsReturn`, `getCvsChainLabel`, 타입 `OrderPreviewShipping`·`OrderSubmitShipping` export.

- [ ] **Step 5: 통과 확인** — PASS. `pnpm --filter @seoul-moment/web exec eslint --fix src/features/order` 깨끗.

- [ ] **Step 6: 커밋** — `feat(web): add shipping method tabs and cvs pickup panel to the order form`

---

### Task 6: `OrderPage` 배선과 편의점 지역 라벨

**Files:**
- Modify: `apps/web/src/views/order/ui/OrderPage.tsx`

**Interfaces:**
- Consumes: Task 3 `useOrderCvsReturn`, Task 4 `useOrderShipping({ profile, userInfo, source })`·`useOrderItems({ source, previewShipping })`, Task 5 컴포넌트, `useOrderSource` (`@entities/order`), `getCvsChainLabel` (Task 1 — `@features/order`에서 export)

- [ ] **Step 1: 배선.**
  - `const source = useOrderSource();` 를 페이지에서 한 번 부른다.
  - `const { isRedirecting } = useOrderCvsReturn(source);` — `isRedirecting`이면 `OrderSkeleton`을 그린다(빈 화면 깜박임 방지).
  - `useOrderShipping({ profile, userInfo, source })`, `useOrderItems({ source, previewShipping: shipping.previewShipping })`. 페이지의 `paymentMethod` `useState`를 지우고 `shipping.paymentMethod`/`shipping.setPaymentMethod`를 `OrderPaymentSection`에 넘긴다.
  - `OrderShippingSection`에 `shippingMethod`, `onShippingMethodChange`, `cvs` 전달.
  - `regionLabel`: `isShippingFixed`일 때 `shipping.shippingMethod === "CVS" && shipping.cvs.store` 면 `` `${getCvsChainLabel(store.chain)} ${store.storeName} · ${t(preview.isRemoteIsland ? "remote_island" : "main_island")}` ``, 아니면 기존 縣市·區 문자열.
  - `canSubmit={shipping.isValid}` 는 그대로.

- [ ] **Step 2: 검증** — `pnpm --filter @seoul-moment/web typecheck` 통과, `pnpm --filter @seoul-moment/web exec eslint src/views/order src/features/order src/entities/order` 깨끗, `cd apps/web && pnpm vitest run src/features/order src/entities/order` PASS.

- [ ] **Step 3: 로컬 수동 확인** (스펙 "지도 왕복 수동 확인" 절차). 시트에 키가 아직 없으면 `pnpm --filter @seoul-moment/web exec next dev --turbopack`으로 띄운다.
  1. 장바구니 → 주문서. 탭 두 개가 보이고 택배가 기본, 택배 화면은 이전과 같다.
  2. 편의점 픽업 → 칩 `7-ELEVEN` 클릭 → dev API 지도 → ECPay 테스트 페이지 "選定門市" → 서버 페이지의 `token=…` 복사.
  3. `http://localhost:3000/ko/order?cvsStoreToken={토큰}` 접속 → `/ko/order?cart=…`로 돌아오고 편의점 탭·칩·매장 카드·받는 분·휴대폰·결제수단이 모두 복원된다. 금액 영역에 `7-ELEVEN {매장명} · 본섬`과 배송비가 확정된다.
  4. 택배 탭으로 전환 → 주소 기준 배송비. 다시 편의점 탭 → 매장 유지.
  5. 받는 분에 `李`를 넣고 포커스를 떼면 에러 문구, `李佳蓉`이면 결제하기 활성.
  6. 1시간 지난 토큰(또는 아무 문자열)으로 3번을 하면 만료 문구가 뜨고 결제하기는 비활성.

- [ ] **Step 4: 커밋** — `feat(web): wire shipping method selection into the order page`

---

### Task 7: 마무리 — i18n 시트 반영과 PR 준비

**Files:** 없음 (절차)

- [ ] **Step 1:** Google Sheet에 Task 5의 키 9개를 ko/en/zh-TW 열과 함께 추가한다(브라우저로 편집). 그 뒤 `pnpm i18n:sync`를 돌려 세 JSON이 커밋된 내용과 같은지 `git diff --stat apps/web/src/i18n/messages`로 확인한다. 차이가 있으면 시트 쪽을 고친다.
- [ ] **Step 2:** `pnpm --filter @seoul-moment/web build`가 `MISSING_MESSAGE` 없이 통과하는지 확인한다.
- [ ] **Step 3:** 브랜치 `feat/web-order-payment-logistics-api`에서 PR을 연다(제목·본문 영문). 본문에 스펙 링크, 로컬 수동 확인 절차, 릴리스 전 체크 "dev 프론트에서 자동 복귀 확인", 백엔드 요청 "dev `returnUrl` 허용 목록에 `http://localhost:3000` 추가"를 적는다.
