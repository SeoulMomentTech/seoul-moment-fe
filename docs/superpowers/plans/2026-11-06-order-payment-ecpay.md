# 주문서 결제 흐름(ECPay) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 주문서의 "결제하기" 를 주문 생성 → 결제 시작(ECPAY) → ECPay 결제창으로 잇고, PG 에서 돌아오는 `/payment/result?h=` 결과 페이지와 LINE 쪽 대기 화면을 만든다.

**Architecture:** 제출 흐름은 `features/order/model/useOrderSubmit.ts` 한 훅이 쥔다(전자발표 확인 대기 → 주문 기억 조회 → 주문 생성 → 결제 시작 → 결제창 분기). 순수 모듈 셋이 그 밑을 받친다: `pendingOrder.ts`(sessionStorage 주문 기억), `paymentWindow.ts`(LIFF/LINE 인앱/일반 분기), `shared/lib/liff.ts`(LIFF 초기화 공유). 결과 페이지는 `views/payment-result` + `features/payment`(상태별 뷰·은행명·대만 시각)이고 기존 `usePaymentResultQuery` 를 쓴다.

**Tech Stack:** Next.js 16 App Router, React 19, TanStack Query(`useAppQuery`/`useAppMutation` + `useQueryClient`), nuqs, next-intl, `@line/liff`(동적 import), sonner, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-06-order-payment-ecpay-design.md`

## Global Constraints

- FSD 하향 import 만. 라우팅은 `@/i18n/navigation`. `useQuery`/`useMutation` 직접 사용 금지(`useQueryClient` 는 허용).
- ECPay 만. LINE_PAY 라디오는 `disabled` + `coming_soon`, 기본값·복원값 모두 `ECPAY`.
- 주문 생성은 같은 입력(+미리보기 스냅샷)에 대해 한 번. `order:pending` 24시간.
- `handoffUrl` 은 30분·1회. "다시 열기" 없음, "다시 결제하기"(결제 시작 재호출)만.
- 결과 페이지는 로그인 불필요(`AuthOnly` 없음). `payment.status` 로 화면을 가른다.
- i18n 키 `payment_` 접두. 은행명은 중문 고정. 시트 반영은 마지막 Task.
- 토스트는 `sonner` 의 `toast.error`. 주문 생성·결제 시작 mutation 은 `toastOnError: false` 로 두고 핸들러가 분기한다.
- 커밋은 영문 Conventional Commits. 로컬 dev 는 `pnpm --filter @seoul-moment/web exec next dev --turbopack`(시트 반영 전 sync 가 키를 지운다).

## Review Focus

1. 결제창에서 브라우저 뒤로가기로 주문서에 돌아와 같은 입력으로 다시 결제하기 → 주문 생성 없이 결제 시작만 호출된다. (Task 3·5)
2. 장바구니 수량을 바꾸고 돌아와 결제하기 → 미리보기 스냅샷이 달라 새 주문이 생긴다. (Task 3·5)
3. 결제 시작이 500 → 토스트만 뜨고, 다음 클릭은 주문 생성 없이 결제 시작만 다시 부른다. (Task 5)
4. 결과 페이지를 `h` 없이 열거나 만료 토큰으로 열기 → "찾을 수 없어요" 화면이고 콘솔 에러 없음. (Task 7)
5. `expireAt` 이 UTC `2026-11-06T15:59:59Z` → 화면은 대만 시각 `2026/11/07 00:00` 이 아니라 `2026/11/06 23:59`. (Task 7)

---

### Task 1: 에러 본문 `data` 읽기 + 결과 폴링 `READY`

**Files:**
- Modify: `apps/web/src/shared/lib/utils/error.ts`
- Modify: `apps/web/src/entities/payment/api/usePaymentResultQuery.ts`
- Test: `apps/web/src/shared/lib/utils/error.test.ts` (없으면 생성), `apps/web/src/entities/payment/api/usePaymentResultQuery.test.tsx` (생성)

**Interfaces:**
- Produces:
  ```ts
  // error.ts
  export interface ApiErrorData { field?: string; productVariantIds?: number[] }
  export interface ApiErrorBody { message?; code?; traceId?; data?: ApiErrorData }
  export interface ErrorInfo { …기존, data?: ApiErrorData }   // readErrorInfo 가 채운다
  ```
  `usePaymentResultQuery`: `refetchInterval` 이 `REQUESTED | READY` 에서 3000.

- [ ] **Step 1: 실패하는 테스트**

```ts
// error.test.ts
it("readErrorInfo 는 본문의 data 를 그대로 넘긴다", async () => {
  const error = new HTTPError(new Response(JSON.stringify({ message: "m", code: "CONFLICT", data: { productVariantIds: [101] } }), { status: 409 }), new Request("https://x"), {} as never);
  await expect(readErrorInfo(error)).resolves.toMatchObject({ status: 409, code: "CONFLICT", data: { productVariantIds: [101] } });
});
// usePaymentResultQuery.test.tsx — getPaymentResult 를 vi.mock, QueryClientProvider wrapper
it("READY 도 폴링 대상이다", async () => {
  getPaymentResult.mockResolvedValueOnce(ok({ payment: { status: "READY" }, … })).mockResolvedValueOnce(ok({ payment: { status: "PAID" }, … }));
  vi.useFakeTimers(); render("tok"); await waitFor(() => expect(result.current.data?.payment.status).toBe("READY"));
  await act(() => vi.advanceTimersByTimeAsync(3100)); await waitFor(() => expect(result.current.data?.payment.status).toBe("PAID"));
  expect(getPaymentResult).toHaveBeenCalledTimes(2);
});
```
(HTTPError 생성자 시그니처는 `ky` 버전에 맞춘다. 복잡하면 `isHTTPError` 가 참이 되는 최소 객체를 만들어도 된다.)

- [ ] **Step 2: 실패 확인** — Run: `cd apps/web && npx vitest run src/shared/lib/utils/error.test.ts src/entities/payment`. Expected: `data` undefined / READY 에서 재호출 없음.
- [ ] **Step 3: 구현** — `readApiErrorBody` 결과의 `data` 를 `ErrorInfo.data` 로. 폴링 조건에 `READY` 추가.
- [ ] **Step 4: 통과 확인** — PASS.
- [ ] **Step 5: 커밋** — `git commit -m "feat(web): expose error body data and poll payment results while READY"`

---

### Task 2: LIFF 초기화 공유 + 결제창 분기

**Files:**
- Create: `apps/web/src/shared/lib/liff.ts` (lineIdentity 의 `ensureLiff`·`LIFF_ID`·`isLineLoginConfigured` 를 여기로 옮기고 lineIdentity 는 re-export/import)
- Modify: `apps/web/src/features/login/lib/lineIdentity.ts`
- Create: `apps/web/src/features/order/model/paymentWindow.ts`
- Test: `apps/web/src/features/order/model/paymentWindow.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // shared/lib/liff.ts
  export const isLiffConfigured = (): boolean;
  export const ensureLiff = (): Promise<Liff>;        // 기존 동작 그대로(1회 init, 실패 시 캐시 해제)
  // paymentWindow.ts
  export type PaymentWindowMode = "same-tab" | "external";
  export const isLineInAppBrowser = (userAgent?: string): boolean;   // /\bLine\//
  export const withExternalBrowser = (url: string): string;          // ?openExternalBrowser=1 을 URL 객체로 추가
  export const openPaymentWindow = (handoffUrl: string): Promise<PaymentWindowMode>;
  ```
  규칙: LINE UA 가 아니면 `navigateTo(url)` → `"same-tab"`. LINE UA 이고 `isLiffConfigured()` 이면 `ensureLiff()` 뒤 `liff.isInClient()` 가 참일 때 `liff.openWindow({ url, external: true })` → `"external"`; 거짓이거나 init 실패면 `navigateTo(withExternalBrowser(url))` → `"external"`. LINE UA 인데 LIFF 미설정이면 바로 후자.

- [ ] **Step 1: 실패하는 테스트** — `./navigate` 와 `@shared/lib/liff` 를 `vi.mock`, `navigator.userAgent` 는 `vi.stubGlobal` 또는 인자.

```ts
it("일반 브라우저는 같은 탭으로 간다", async () => { await expect(openPaymentWindow(url)).resolves.toBe("same-tab"); expect(navigateTo).toHaveBeenCalledWith(url); });
it("LINE 인앱(LIFF 아님)은 openExternalBrowser=1 을 붙여 간다", …toHaveBeenCalledWith("https://pg.test/handoff/x?openExternalBrowser=1"));
it("이미 쿼리가 있는 URL 에도 & 로 붙는다", () => expect(withExternalBrowser("https://a/b?c=1")).toBe("https://a/b?c=1&openExternalBrowser=1"));
it("LIFF 클라이언트는 liff.openWindow external 로 연다", … ensureLiff → { isInClient: () => true, openWindow } → expect(openWindow).toHaveBeenCalledWith({ url, external: true }); navigateTo 미호출; "external");
it("LIFF init 이 실패하면 인앱 분기로 떨어진다", … ensureLiff rejects → navigateTo(withExternalBrowser(url)));
it("LINE UA 판정", () => { expect(isLineInAppBrowser("Mozilla/5.0 … Line/14.0.0")).toBe(true); expect(isLineInAppBrowser("Mozilla/5.0 Safari")).toBe(false); });
```

- [ ] **Step 2: 실패 확인** — Run: `npx vitest run src/features/order/model/paymentWindow.test.ts`. Expected: 모듈 없음.
- [ ] **Step 3: 구현** — 위 규칙. `lineIdentity.ts` 는 `ensureLiff`/`isLineLoginConfigured` 를 `@shared/lib/liff` 에서 가져오도록 바꾸고 기존 export 이름은 유지.
- [ ] **Step 4: 통과 확인** — PASS, 그리고 `npx vitest run src/features/login` 기존 테스트 PASS.
- [ ] **Step 5: 커밋** — `git commit -m "feat(web): share LIFF init and add the payment window branch for LINE"`

---

### Task 3: 주문 기억(`order:pending`)

**Files:**
- Create: `apps/web/src/features/order/model/pendingOrder.ts`
- Test: `apps/web/src/features/order/model/pendingOrder.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const PENDING_ORDER_KEY = "order:pending";
  export const PENDING_ORDER_TTL_MS = 24 * 60 * 60 * 1000;
  export interface PendingOrder { sourceHref: string; bodyKey: string; orderId: number; orderNumber: string; totalAmount: number; resultToken?: string; savedAt: number }
  /** 주문 생성 body + 미리보기 스냅샷(라인 `productVariantId:quantity` 정렬 + totalAmount) */
  export const toPendingBodyKey = (body: CreateUserOrderVariables, preview: PostUserOrderPreviewRes): string;
  export const savePendingOrder = (order: Omit<PendingOrder, "savedAt">): void;
  export const findPendingOrder = (sourceHref: string, bodyKey: string): PendingOrder | null;  // 불일치·만료·손상 → null(만료·손상은 지움)
  export const updatePendingOrder = (patch: Partial<Pick<PendingOrder, "resultToken">>): void;
  export const clearPendingOrder = (): void;
  ```

- [ ] **Step 1: 실패하는 테스트** (`orderDraft.test.ts` 와 같은 틀: fake timers, sessionStorage.clear)

```ts
it("같은 source·bodyKey 면 돌려준다", …);
it("bodyKey 가 다르면 null", …);
it("source 가 다르면 null", …);
it("24시간이 지나면 null 이고 지운다", … advance 24h+1ms → null, sessionStorage.getItem(KEY) null);
it("손상된 JSON 은 null 이고 지운다", …);
it("toPendingBodyKey 는 라인 순서와 무관하게 같다", () => expect(toPendingBodyKey(body, previewA)).toBe(toPendingBodyKey(body, { ...previewA, brandGroups: reversed })));
it("수량이 바뀌면 bodyKey 가 달라진다", …);
it("updatePendingOrder 는 resultToken 만 덧쓴다", …);
```

- [ ] **Step 2: 실패 확인** — 모듈 없음.
- [ ] **Step 3: 구현** — `orderDraft.ts` 의 storage 접근 패턴(try/catch)을 그대로.
- [ ] **Step 4: 통과 확인** — PASS.
- [ ] **Step 5: 커밋** — `git commit -m "feat(web): remember the pending order per order sheet input to avoid duplicate orders"`

---

### Task 4: 제출 전 확인(`ensureChecked`), 매장 만료 노출, LINE Pay 비활성

**Files:**
- Create: `apps/web/src/entities/invoice/api/fetchUserInvoiceCheck.ts` (+ `entities/invoice/index.ts` export)
- Modify: `apps/web/src/features/order/model/useOrderInvoice.ts`
- Modify: `apps/web/src/features/order/model/useOrderShipping.ts` (`expireStore` 노출, 기본·복원 paymentMethod `ECPAY`)
- Modify: `apps/web/src/features/order/ui/OrderPaymentSection.tsx` (LINE_PAY `disabled`, 설명 자리에 `coming_soon`)
- Test: `useOrderInvoice.test.tsx`, `useOrderShipping.test.ts`, `OrderPaymentSection.test.tsx`(생성)

**Interfaces:**
- Produces:
  ```ts
  // entities/invoice
  export const fetchUserInvoiceCheck = (queryClient: QueryClient, type: "MOBILE_BARCODE" | "DONATION" | "COMPANY", value: string): Promise<GetUserInvoiceCheckRes>;
  // useOrderInvoice (추가)
  isSubmittable: boolean;   // 형식 통과 && check.status !== "invalid" && 활성 칸에 폼 에러 없음
  ensureChecked(): Promise<{ ok: true; invoice: UserOrderInvoice | undefined } | { ok: false }>;
  // useOrderShipping (추가)
  cvs.expireStore(): void;   // isStoreExpired=true, storeToken=null (기존 expireStore effect 와 같은 처리)
  ```
  `ensureChecked`: 형식 불통과 → `{ok:false}`. 확인 대상 아님 → `{ok:true, invoice: toSubmitInvoice(values)}`. 확인 대상이면 현재 값을 `checked` 에 확정하고 `fetchUserInvoiceCheck`(같은 쿼리 키·`staleTime` 1h·`retry:false`) 를 기다린다. `valid:false` → `{ok:false}`. 실패(throw)·`verified:false` → ok. `fetchUserInvoiceCheck` 는 `queryClient.fetchQuery` 로 `userInvoiceQueryKeys.*Check(value)` + 해당 서비스 함수.

- [ ] **Step 1: 실패하는 테스트**

```ts
// useOrderInvoice.test.tsx
it("ensureChecked 는 blur 없이도 확인을 한 번 부르고 결과를 준다", async () => { mobileCheck valid/verified; setType, setValue("/abc1234"); await expect(result.current.ensureChecked()).resolves.toEqual({ ok: true, invoice: { type: "MOBILE_BARCODE", carrierNum: "/ABC1234" } }); expect(mobileCheck).toHaveBeenCalledTimes(1); await waitFor(() => expect(result.current.check.status).toBe("valid")); });
it("ensureChecked 는 valid:false 면 ok:false", …);
it("ensureChecked 는 API 실패면 ok:true", … mockRejectedValue);
it("ensureChecked 는 MEMBER_CARRIER 면 호출 없이 invoice undefined", …);
it("isSubmittable 은 형식만 맞으면 blur 전에도 true, invalid 면 false", …);
// useOrderShipping.test.ts
it("기본 결제수단은 ECPAY 다", () => expect(result.current.paymentMethod).toBe("ECPAY"));
it("draft 의 LINE_PAY 는 ECPAY 로 복원된다", … saveOrderDraft({ ...cvsDraft, paymentMethod: "LINE_PAY" }) → "ECPAY");
it("expireStore 는 매장을 만료 처리한다", … store 로드 뒤 act(expireStore) → isStoreExpired true, storeToken null, submitShipping null);
// OrderPaymentSection.test.tsx (NextIntlClientProvider + ko)
it("LINE Pay 는 비활성이고 준비 중 문구가 붙는다", () => { expect(screen.getByRole("radio", { name: /LINE Pay/ })).toBeDisabled(); expect(screen.getByText(ko.coming_soon)).toBeInTheDocument(); });
```

- [ ] **Step 2: 실패 확인** — 각 파일 FAIL(함수 없음 / 기본값 LINE_PAY / 활성).
- [ ] **Step 3: 구현** — Interfaces 대로. `useOrderInvoice` 는 `useQueryClient()` 사용.
- [ ] **Step 4: 통과 확인** — `npx vitest run src/features/order src/entities/invoice` PASS.
- [ ] **Step 5: 커밋** — `git commit -m "feat(web): add submit-time invoice check, store expiry control, and disable LINE Pay for now"`

---

### Task 5: 제출 훅 `useOrderSubmit`

**Files:**
- Create: `apps/web/src/features/order/model/useOrderSubmit.ts`
- Modify: `apps/web/src/entities/order/api/useUserOrder.ts` (`useUserOrderDetailQuery` 에 `refetchInterval?: number | false` 옵션)
- Test: `apps/web/src/features/order/model/useOrderSubmit.test.tsx`

**Interfaces:**
- Consumes: Task 1~4 전부, `useCreateUserOrderMutation`/`useUserOrderPaymentMutation`(`toastOnError: false`), `toOrderHref`, `toOrderSourceBody`.
- Produces:
  ```ts
  export interface ExternalPayment { orderId: number; orderNumber: string; paymentId: number; resultToken: string }
  export interface StockShortage { productVariantIds: number[] }
  interface UseOrderSubmitParams {
    source: OrderSource | null;
    preview: PostUserOrderPreviewRes | undefined;
    paymentMethod: UserOrderPaymentMethod;
    submitShipping: OrderSubmitShipping | null;
    invoice: Pick<ReturnType<typeof useOrderInvoice>, "ensureChecked" | "applyServerFieldError">;
    onStoreExpired(): void;      // shipping.cvs.expireStore
    onPreviewStale(): void;      // 409 구매 불가 라인 → 미리보기 refetch
  }
  export const useOrderSubmit = (params) => ({
    submit(): Promise<void>,
    isSubmitting: boolean,
    stockShortage: StockShortage | null,
    external: ExternalPayment | null,     // 외부 브라우저로 넘긴 뒤의 대기 화면 정보
    retryPayment(): Promise<void>,        // 대기 화면의 "다시 결제하기": 결제 시작만 다시, 409 면 조용히 종료
  });
  ```
  `submit()` 순서(스펙 03): 진행 중이면 무시 → `ensureChecked` `ok:false` 면 종료 → `source`·`preview`·`submitShipping` 없으면 종료 → body = `{ ...toOrderSourceBody(source), paymentMethod, ...submitShipping, invoice }`(invoice undefined 면 키 생략) → `bodyKey = toPendingBodyKey(body, preview)` → `findPendingOrder(toOrderHref(source), bodyKey)` 있으면 그 orderId, 없으면 생성 후 `savePendingOrder` → 결제 시작 → `updatePendingOrder({ resultToken })` → `clearOrderDraft()` → `openPaymentWindow(handoffUrl)`; `"external"` 이면 `external` 세팅.
  에러 분기(`readErrorInfo`): 생성 400 `data.field ∈ {carrierNum, loveCode, companyTaxId}` → `applyServerFieldError`; 생성 400 `data.field === "storeToken"` 또는 (`field` 없고 `message` 가 /store|token|매장/i) → `onStoreExpired`; 생성 409 → 토스트 + `onPreviewStale`; 시작 409 `data.productVariantIds` → `stockShortage` + `clearPendingOrder`; 시작 409 그 밖 → `clearPendingOrder` + 토스트; 시작 5xx·네트워크 → 토스트 `payment_start_failed`(기억 유지); 그 밖 → 서버 `message` 토스트(없으면 `please_try_again`). `stockShortage` 는 다음 `submit` 시작 때 null 로.

- [ ] **Step 1: 실패하는 테스트** — `@shared/services/userOrder` 의 `createUserOrder`·`postUserOrderPayment` 와 `./paymentWindow` 의 `openPaymentWindow`, `sonner` 의 `toast` 를 `vi.mock`. wrapper 는 QueryClientProvider. `invoice.ensureChecked` 는 `vi.fn().mockResolvedValue({ ok: true, invoice: undefined })`.

```ts
it("생성 → 시작 → 결제창 순서로 부르고 draft 를 지운다", async () => { … createUserOrder 1회 with body(shippingType·paymentMethod·cartItemIds); postUserOrderPayment with ({ orderId: 481, languageCode }); openPaymentWindow(handoffUrl); sessionStorage order:draft null; });
it("ensureChecked 가 ok:false 면 아무것도 부르지 않는다", …);
it("연타해도 주문 생성은 한 번이다", … submit() 두 번 동시 → createUserOrder 1회);
it("같은 입력의 주문이 기억돼 있으면 생성을 건너뛴다", … savePendingOrder 선행 → createUserOrder 미호출, postUserOrderPayment(481));
it("미리보기 수량이 달라지면 새 주문을 만든다", …);
it("생성 400 data.field=carrierNum 이면 applyServerFieldError 를 부르고 멈춘다", …);
it("생성 400 data.field=storeToken 이면 onStoreExpired", …);
it("시작 409 productVariantIds 면 stockShortage 를 두고 기억을 지운다", … → stockShortage {productVariantIds:[101]}, findPendingOrder null, openPaymentWindow 미호출);
it("시작 500 이면 토스트하고 기억은 남겨 다음 클릭은 시작만 부른다", … 두 번째 submit → createUserOrder 여전히 1회, postUserOrderPayment 2회);
it("external 이면 대기 정보를 내놓는다", … openPaymentWindow → "external" → external { orderId, orderNumber, paymentId, resultToken });
it("retryPayment 는 시작만 다시 부르고 409 면 조용히 끝난다", …);
```

- [ ] **Step 2: 실패 확인** — 모듈 없음.
- [ ] **Step 3: 구현** — 위 순서·분기. `isSubmitting` 은 `useRef` 가드 + state.
- [ ] **Step 4: 통과 확인** — `npx vitest run src/features/order` PASS.
- [ ] **Step 5: 커밋** — `git commit -m "feat(web): add the order submit flow: create order, start ECPay payment, open the payment window"`

---

### Task 6: 주문서 UI 연결 (버튼·재고 부족·대기 화면) + i18n 키

**Files:**
- Modify: `apps/web/src/features/order/ui/OrderSummary.tsx`, `OrderBar.tsx` (`onSubmit`, `isSubmitting`; `coming_soon` 문구 제거)
- Create: `apps/web/src/features/order/ui/OrderStockShortage.tsx`
- Create: `apps/web/src/features/order/ui/OrderPaymentWaiting.tsx`
- Modify: `apps/web/src/views/order/ui/OrderPage.tsx`, `apps/web/src/features/order/index.tsx`
- Modify: `apps/web/src/i18n/messages/{ko,en,zh-TW}.json` (아래 키, 파일 끝에 같은 순서로)
- Test: `OrderStockShortage.test.tsx`, `OrderPaymentWaiting.test.tsx`, 기존 `OrderSummary`/`OrderBar` 테스트가 있으면 갱신

**Interfaces:**
- Produces:
  ```ts
  // OrderSummary / OrderBar props 추가
  onSubmit(): void; isSubmitting: boolean;
  // OrderStockShortage
  interface Props { shortage: StockShortage; groups: ReadonlyArray<UserOrderPreviewBrandGroup>; source: OrderSource }
  // 라인명: groups 에서 productVariantId 일치 → `${productName} (${optionText})`; 링크: source.type==="cart" → /cart (go_to_cart), "direct" → /product/{productItemId} (payment_go_to_product), productItemId 못 찾으면 링크 없음
  // OrderPaymentWaiting
  interface Props { external: ExternalPayment; onRetry(): void; isRetrying: boolean }
  // useUserOrderDetailQuery(orderId, { refetchInterval: 4000 }); status PAID|PAYMENT_WAITING → router.replace(`/payment/result?h=${resultToken}`);
  // payment?.paymentId === external.paymentId && payment.status ∈ FAILED|CANCELED|EXPIRED → 제목을 payment_failed_title, 보조 문구 payment_not_paid_retry_hint
  // onRetry 가 끝나면(409 포함) 주문 상세를 즉시 refetch 한다 — 이미 결제된 경우 폴링 지연 없이 결과로 넘어간다
  ```
  `OrderPage`: `const submit = useOrderSubmit({...})`; `submit.external` 이면 본문·사이드·바 대신 `<OrderPaymentWaiting>`; `canSubmit = shipping.isValid && invoice.isSubmittable && !submit.isSubmitting`; 재고 부족 박스는 데스크톱 `OrderSummary` 위, 모바일 금액 섹션 아래.

  i18n 키(ko / en / zh-TW):
  | key | ko | en | zh-TW |
  | --- | --- | --- | --- |
  | payment_processing | 처리 중… | Processing… | 處理中… |
  | payment_external_title | 외부 브라우저에서 결제 중 | Paying in your external browser | 正在外部瀏覽器付款 |
  | payment_external_hint | 결제를 마치면 이 화면이 자동으로 바뀝니다 | This screen updates automatically once payment is done | 完成付款後，此畫面會自動更新 |
  | payment_retry | 다시 결제하기 | Pay again | 重新付款 |
  | payment_not_paid_retry_hint | 결제되지 않았습니다. 다시 결제할 수 있어요 | The payment didn't go through. You can pay again | 付款未完成，您可以重新付款 |
  | payment_start_failed | 결제를 시작할 수 없어요. 다시 시도해 주세요 | We couldn't start the payment. Please try again | 無法開始付款，請再試一次 |
  | payment_stock_shortage_title | 재고가 부족한 상품이 있어요 | Some items are out of stock | 部分商品庫存不足 |
  | payment_stock_shortage_hint | 수량을 바꾸거나 빼고 다시 결제해 주세요 | Change the quantity or remove the item, then pay again | 請調整數量或移除商品後重新付款 |
  | payment_go_to_product | 상품 보러 가기 | View product | 查看商品 |
  | payment_order_number | 주문번호 | Order number | 訂單編號 |

- [ ] **Step 1: 실패하는 테스트**

```ts
// OrderStockShortage.test.tsx
it("부족한 라인의 상품명·옵션과 장바구니 링크를 그린다", … groups 에 variant 101 "크롭 후드 집업"/"베이지 / FREE" → getByText(/크롭 후드 집업 \(베이지 \/ FREE\)/), link href /ko/cart);
it("바로 구매면 상품 페이지 링크다", … source direct → href /ko/product/{productItemId});
// OrderPaymentWaiting.test.tsx (getUserOrderDetail mock, 인증 스토어 id 세팅, router.replace mock)
it("PENDING 이면 외부 결제 중 문구와 주문번호를 그린다", …);
it("PAID 가 되면 결과 페이지로 replace 한다", … → "/payment/result?h=tok");
it("이번 시도가 CANCELED 면 결제되지 않았다는 문구로 바뀐다", …);
it("다시 결제하기는 onRetry 를 부른다", …);
```

- [ ] **Step 2: 실패 확인** — 모듈 없음.
- [ ] **Step 3: 구현** — Interfaces 대로. `OrderSummary`/`OrderBar` 버튼: `onClick={onSubmit}`, `disabled={!canSubmit}`, 문구 `isSubmitting ? t("payment_processing") : t("pay_now")`; 힌트 `<p>` 와 `coming_soon` 제거(`aria-describedby` 도 제거).
- [ ] **Step 4: 통과 확인** — `npx vitest run` 전부 PASS, `pnpm typecheck` 깨끗.
- [ ] **Step 5: 수동 확인** — dev API 로 `/ko/order?cart=…` → 결제하기 → ECPay stage 결제창으로 이동(같은 탭). 뒤로가기 → 같은 입력으로 다시 결제하기 → 네트워크에 `user/order` 생성 요청이 없고 `payment` 만.
- [ ] **Step 6: 커밋** — `git commit -m "feat(web): wire the pay button to the ECPay flow with stock-shortage and external-browser waiting states"`

---

### Task 7: 결제 결과 페이지

**Files:**
- Create: `apps/web/src/app/[locale]/payment/result/page.tsx` (metadata noindex, `Suspense fallback={null}`)
- Create: `apps/web/src/views/payment-result/index.tsx`, `ui/PaymentResultPage.tsx`
- Create: `apps/web/src/features/payment/model/bankName.ts`, `taipeiTime.ts`, `ui/PaymentResultView.tsx`, `index.tsx`
- Modify: i18n 세 파일(아래 키)
- Test: `features/payment/model/bankName.test.ts`, `taipeiTime.test.ts`, `features/payment/ui/PaymentResultView.test.tsx`, `views/payment-result/ui/PaymentResultPage.test.tsx`

**Interfaces:**
- Consumes: `usePaymentResultQuery`(Task 1), `userCartQueryKeys.all`, `useUserAuthStore`, `clearPendingOrder`·`clearOrderDraft`.
- Produces:
  ```ts
  export const getBankName = (bankCode: string): string;   // 004 臺灣銀行 · 005 土地銀行 · 007 第一銀行 · 008 華南銀行 · 009 彰化銀行 · 012 台北富邦 · 013 國泰世華 · 017 兆豐銀行 · 700 中華郵政 · 803 聯邦銀行 · 805 遠東銀行 · 806 元大銀行 · 807 永豐銀行 · 808 玉山銀行 · 812 台新銀行 · 822 中國信託 ; 없으면 코드 그대로
  export const formatTaipeiDateTime = (iso: string): string;  // "YYYY/MM/DD HH:mm", Intl.DateTimeFormat("en-CA"|"zh-TW", { timeZone: "Asia/Taipei", … }) 로 파트 조립
  export type PaymentResultState = { kind: "loading" } | { kind: "not-found" } | { kind: "checking"; delayed: boolean } | { kind: "paid"; result } | { kind: "waiting"; result } | { kind: "failed"; result; reason: "canceled" | "expired" | "failed" };
  export const toPaymentResultState = (query: { data?: GetPaymentResultRes; isPending: boolean; isError: boolean; error?: HTTPError | null }, delayed: boolean): PaymentResultState;
  export function PaymentResultView({ state }: { state: PaymentResultState }): JSX.Element;
  ```
  `PaymentResultPage`: `useQueryState("h")` → `usePaymentResultQuery(h)`; 1분 타이머로 `delayed`; `paid`/`waiting` 가 되면 `clearPendingOrder()`, `clearOrderDraft()`, 로그인돼 있으면 `queryClient.invalidateQueries({ queryKey: userCartQueryKeys.all })`. `h` 없음 → `not-found`.
  뷰(스펙 04·05): paid — ✓ `payment_paid_title`, 주문번호, `{method} · NT$amount`, `payment_paid_line_hint`; waiting — ⏱ `payment_waiting_title`, 주문번호, `depositInfo.paymentType` `ATM_*` → 은행명 + `payment_virtual_account` + `account` + `payment_amount`, `CVS_*` → `payment_cvs_code_label` + `paymentNo`; `payment_deadline` with `{date}` = `formatTaipeiDateTime(expireAt)`; failed — `payment_failed_title`, 사유 키(`payment_reason_*`), `failureCode` 작게, `payment_order_kept`; checking — 스피너 + `payment_checking_title`, delayed 면 `payment_checking_delayed`; not-found — `payment_result_not_found`. 버튼: 항상 `payment_continue_shopping`(`/`), failed 면 `go_to_cart`(`/cart`) 추가.

  i18n 키:
  | key | ko | en | zh-TW |
  | --- | --- | --- | --- |
  | payment_result_title | 결제 결과 | Payment result | 付款結果 |
  | payment_checking_title | 결제 확인 중… 잠시만 기다려 주세요 | Confirming your payment… please wait | 正在確認付款，請稍候 |
  | payment_checking_delayed | 확인이 늦어지고 있어요. 잠시 뒤 주문 내역에서 확인해 주세요 | This is taking longer than usual. Please check your orders a little later | 確認時間較長，請稍後至訂單查看 |
  | payment_paid_title | 결제가 완료되었습니다 | Payment complete | 付款完成 |
  | payment_paid_line_hint | LINE에서 오셨다면 그쪽 화면의 주문도 완료로 바뀌어 있어요 | If you came from LINE, the order there now shows as complete | 若您從 LINE 前來，該畫面的訂單已顯示完成 |
  | payment_waiting_title | 입금을 기다리고 있어요 | Waiting for your deposit | 等待您的付款 |
  | payment_virtual_account | 가상계좌 | Virtual account | 虛擬帳號 |
  | payment_cvs_code_label | 超商代碼 (편의점 납부 코드) | 超商代碼 (convenience store payment code) | 超商代碼 |
  | payment_deadline | 입금 기한 {date} · 지나면 주문이 자동 취소됩니다 | Pay by {date} · the order is cancelled automatically after that | 繳費期限 {date}・逾期訂單將自動取消 |
  | payment_failed_title | 결제되지 않았습니다 | Payment not completed | 付款未完成 |
  | payment_reason_canceled | 결제창에서 취소했어요 | The payment was cancelled | 已在付款頁面取消 |
  | payment_reason_expired | 결제 시간이 지났어요 | The payment session expired | 付款已逾時 |
  | payment_reason_failed | 결제가 거절됐어요 | The payment was declined | 付款遭拒 |
  | payment_order_kept | 주문은 남아 있어요. 다시 결제할 수 있어요 | Your order is saved. You can pay again | 訂單已保留，您可以重新付款 |
  | payment_result_not_found | 결제 정보를 찾을 수 없어요. 링크가 잘못됐거나 7일이 지났어요 | We couldn't find this payment. The link may be wrong or older than 7 days | 找不到付款資訊，連結可能有誤或已超過 7 天 |
  | payment_continue_shopping | 쇼핑 계속하기 | Continue shopping | 繼續購物 |
  | seo_payment_result_title | 결제 결과 \| Seoul Moment | Payment result \| Seoul Moment | 付款結果 \| Seoul Moment |
  (`seo_order_title` 패턴을 따른다. `payment_amount`·`go_to_cart`·`payment_order_number` 는 기존/Task 6 키.)

- [ ] **Step 1: 실패하는 테스트**

```ts
// bankName.test.ts
it.each([["005", "土地銀行"], ["822", "中國信託"]])("코드 %s → %s", (code, name) => expect(getBankName(code)).toBe(name)); it("모르는 코드는 그대로", () => expect(getBankName("999")).toBe("999"));
// taipeiTime.test.ts
it("UTC 를 대만 시각으로 바꾼다", () => expect(formatTaipeiDateTime("2026-11-06T15:59:59Z")).toBe("2026/11/06 23:59"));
it("자정을 넘기는 경우", () => expect(formatTaipeiDateTime("2026-11-06T16:30:00Z")).toBe("2026/11/07 00:30"));
// PaymentResultView.test.tsx (상태별)
it("paid 는 완료 제목·주문번호·수단·금액", …); it("waiting ATM 은 은행명·가상계좌·금액·기한", … bankCode "005" → "土地銀行", account, "2026/11/06 23:59");
it("waiting CVS 는 납부 코드", …); it("failed CANCELED 는 취소 사유와 장바구니 버튼", …); it("checking delayed 는 늦어진다는 문구", …); it("not-found", …);
// PaymentResultPage.test.tsx (NuqsTestingAdapter h=tok, getPaymentResult mock)
it("REQUESTED → PAID 로 바뀌면 완료 화면이고 pending·draft 를 지운다", …);
it("404 면 찾을 수 없음", …); it("h 가 없으면 찾을 수 없음이고 호출하지 않는다", …);
it("1분이 지나도 REQUESTED 면 늦어진다는 문구", … fake timers advance 60_000);
```

- [ ] **Step 2: 실패 확인** — 모듈 없음.
- [ ] **Step 3: 구현** — Interfaces 대로. 라우트 `page.tsx` 는 `order/page.tsx` 를 본뜬다(Suspense, `robots: { index:false, follow:false }`).
- [ ] **Step 4: 통과 확인** — `npx vitest run` 전부 PASS, `pnpm typecheck`, `npx eslint src/features/payment src/views/payment-result src/app`.
- [ ] **Step 5: 수동 확인** — 서버가 그린 결과 페이지(로컬은 303 이 안 됨)의 URL 에서 `h` 를 복사해 `http://localhost:3000/ko/payment/result?h=…` 로 열어 PAID 또는 ATM 입금 안내가 뜨는지 본다.
- [ ] **Step 6: 커밋** — `git commit -m "feat(web): add the payment result page with checking, paid, deposit-waiting, and failed states"`

---

### Task 8: 시트 반영·빌드·마무리

- [ ] **Step 1: 시트** — Task 6·7 의 키 27개를 `language-pack` 탭 595행부터 TSV 로 붙여 넣는다(이름 상자는 **cmd+j** 로 연다 — 좌표 클릭은 A1 을 덮은 적이 있다). API 로 재조회해 확인.
- [ ] **Step 2: 왕복** — `pnpm --filter @seoul-moment/web i18n:sync && git status --short` → 변경 없음.
- [ ] **Step 3: 빌드** — `pnpm --filter @seoul-moment/web build` 성공, `MISSING_MESSAGE` 없음.
- [ ] **Step 4: 마무리** — superpowers:finishing-a-development-branch (base `develop`). PR 본문 영문: 스펙 링크, 수동 테스트 절차, 백엔드 의존(`STOREFRONT_BASE_URL` = `https://dev-seoulmoment.netlify.app`), Follow-ups(LINE Pay, 주문 상세, "주문 상세" 버튼).
