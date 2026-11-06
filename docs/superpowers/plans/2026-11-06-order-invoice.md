# 주문서 전자발표(電子發票) 섹션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 주문서에 전자발표 받는 방법 5종을 고르고 타입별 값을 입력·확인하는 섹션을 붙이고, 주문 생성 body 의 `invoice` 값과 지도 왕복 draft 저장을 준비한다.

**Architecture:** 폼 모델(`features/order/model/invoiceSchema.ts`)이 정규화·형식 검사·제출값 변환을 순수 함수로 갖고, `useOrderInvoice` 훅이 react-hook-form 한 인스턴스 + 기존 `entities/invoice` 확인 쿼리 3개를 묶어 `check`/`isValid`/`submitInvoice` 를 내놓는다. `OrderInvoiceSection` 은 `OrderPaymentSection` 과 같은 라디오 카드 5개이고, `OrderPage` 가 `useOrderShipping` 에 draft 연결 콜백을 넘겨 지도 왕복에 발표 입력을 싣는다.

**Tech Stack:** Next.js 16 App Router, React 19, react-hook-form + zod(`@hookform/resolvers/zod`), TanStack Query(`useAppQuery` 래퍼), next-intl, `@seoul-moment/ui`(RadioGroup·Label·Input), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-06-order-invoice-design.md`

## Global Constraints

- FSD 하향 import 만(`views → features → entities → shared`). 라우팅 헬퍼는 `@/i18n/navigation`.
- `@tanstack/react-query` 직접 사용 금지. `entities/invoice` 의 `useUserInvoice*CheckQuery` 만 쓴다.
- i18n 키는 `invoice_` 접두. 용어 라벨은 세 언어 중문 고정 + ko/en 괄호 설명, 안내·오류 문구는 세 언어 번역.
- 확인 API 는 blur 때 한 번. 키 입력마다 호출 금지. 형식이 맞을 때만 `enabled`.
- `valid: false` 만 결제를 막는다. `verified: false` 와 API 실패(4xx·5xx·네트워크)는 통과.
- `MEMBER_CARRIER` 면 `submitInvoice` 는 `undefined`.
- 회사명은 선택(60자 이하). 統一編號 확인 결과 `name` 은 회사명 칸이 비어 있을 때만 채운다.
- 手機條碼·自然人憑證은 폼 칸을 따로 둔다(`mobileBarcode`·`citizenCert`). 제출 때 `carrierNum` 으로 옮긴다.
- 타입을 바꿔도 다른 타입의 입력값은 지우지 않는다.
- 커밋 메시지 영문 Conventional Commits. `pnpm dev:web` 은 i18n sync 로 로컬 JSON 을 덮으므로 Task 6 전까지 `pnpm --filter @seoul-moment/web exec next dev --turbopack` 으로 띄운다.

## Review Focus

1. 手機條碼에 소문자·앞뒤 공백(` /abc1234 `)을 넣고 blur → 대문자 `/ABC1234` 로 확인 API 가 나가고 제출값도 대문자다. (Task 1·3 테스트)
2. 統一編號 확인이 끝나기 전에 사용자가 회사명을 직접 적었다 → 자동 채움이 덮지 않는다. (Task 3 테스트)
3. 捐贈에서 愛心碼를 확인한 뒤 公司로 바꿨다가 다시 捐贈으로 돌아옴 → 값과 기부처 이름이 그대로고 재호출 없음(캐시). (Task 3 테스트)
4. 지도에 다녀온 뒤 복원 → 발표 타입·값이 그대로고, 확인 호출이 한 번 나간 뒤 `isValid` 가 돌아온다. (Task 5 테스트)
5. 확인 API 가 500 → 문구는 "확인이 어려워…" 이고 결제는 막히지 않는다. (Task 3 테스트)

---

### Task 1: 발표 폼 스키마·제출값 변환·i18n 키

**Files:**
- Create: `apps/web/src/features/order/model/invoiceSchema.ts`
- Modify: `apps/web/src/shared/services/userOrder.ts` (타입 1줄 추가)
- Modify: `apps/web/src/i18n/messages/{ko,en,zh-TW}.json` (키 21개, 파일 끝에 추가 — 시트 순서와 같게)
- Test: `apps/web/src/features/order/model/invoiceSchema.test.ts`

**Interfaces:**
- Consumes: `UserOrderInvoice` (`@shared/services/userOrder`).
- Produces:
  ```ts
  // userOrder.ts
  export type UserOrderInvoiceType = UserOrderInvoice["type"];

  // invoiceSchema.ts
  export const INVOICE_TYPES: ReadonlyArray<UserOrderInvoiceType>; // 순서: MEMBER_CARRIER, MOBILE_BARCODE, CITIZEN_CERT, DONATION, COMPANY
  export const toMobileBarcode = (value: string): string;   // trim + 대문자
  export const toCitizenCert = (value: string): string;     // trim + 대문자
  export const toDigits = (value: string): string;          // 숫자만
  export const isValidMobileBarcode = (value: string): boolean; // /^\/[A-Z0-9+\-.]{7}$/
  export const isValidCitizenCert = (value: string): boolean;   // /^[A-Z]{2}\d{14}$/
  export const isValidLoveCode = (value: string): boolean;      // /^\d{3,7}$/
  export const isValidCompanyTaxId = (value: string): boolean;  // /^\d{8}$/
  export const INVOICE_COMPANY_NAME_MAX = 60;
  export const orderInvoiceSchema: z.ZodType<OrderInvoiceValues>; // object + superRefine: 현재 type 의 칸만 검사
  export interface OrderInvoiceValues {
    type: UserOrderInvoiceType;
    mobileBarcode: string; citizenCert: string; loveCode: string;
    companyTaxId: string; companyName: string;
  }
  export const INVOICE_DEFAULT_VALUES: OrderInvoiceValues; // type MEMBER_CARRIER, 나머지 ""
  export const orderInvoiceResolver: Resolver<OrderInvoiceValues>;
  /** 타입별로 확인 대상이 되는 폼 칸. MEMBER_CARRIER 는 null */
  export const INVOICE_CHECK_FIELD: Record<UserOrderInvoiceType, keyof OrderInvoiceValues | null>;
  /** 서버 400 data.field → 폼 칸. carrierNum 은 현재 type 에 따라 mobileBarcode 또는 citizenCert */
  export const toInvoiceFormField = (field: "carrierNum" | "loveCode" | "companyTaxId", type: UserOrderInvoiceType): keyof OrderInvoiceValues | null;
  export const INVOICE_ERROR_KEY: Record<Exclude<keyof OrderInvoiceValues, "type">, string>;
  // mobileBarcode→"invoice_mobile_barcode_invalid", citizenCert→"invoice_citizen_cert_invalid",
  // loveCode→"invoice_love_code_invalid", companyTaxId→"invoice_company_tax_id_invalid", companyName→"invoice_company_name_too_long"
  export const toSubmitInvoice = (values: OrderInvoiceValues): UserOrderInvoice | undefined;
  ```

- [ ] **Step 1: 실패하는 테스트 작성** (`invoiceSchema.test.ts`)

```ts
describe("정규화", () => {
  it("手機條碼는 trim 하고 대문자로 바꾼다", () => expect(toMobileBarcode(" /abc1234 ")).toBe("/ABC1234"));
  it("自然人憑證도 같다", () => expect(toCitizenCert("ab12345678901234")).toBe("AB12345678901234"));
  it("숫자만 남긴다", () => expect(toDigits("16-8001")).toBe("168001"));
});
describe("형식", () => {
  it.each(["/ABC1234", "/A1+-.B2"])("手機條碼 %s 통과", (v) => expect(isValidMobileBarcode(v)).toBe(true));
  it.each(["ABC1234", "/abc1234", "/ABC12345", "/ABC 123"])("手機條碼 %s 거절", (v) => expect(isValidMobileBarcode(v)).toBe(false));
  it.each(["AB12345678901234"])("自然人憑證 %s 통과", ...);
  it.each(["A123456789012345", "AB1234567890123", "ab12345678901234"])("自然人憑證 %s 거절", ...);
  it.each(["168", "1680011"])("愛心碼 %s 통과", ...);  it.each(["16", "16800112", "16a"])("愛心碼 %s 거절", ...);
  it.each(["97025978"])("統一編號 %s 통과", ...);      it.each(["9702597", "970259781", "9702597A"])("統一編號 %s 거절", ...);
});
describe("orderInvoiceSchema", () => {
  it("MEMBER_CARRIER 는 다른 칸이 비어도 통과한다", () => expect(orderInvoiceSchema.safeParse(INVOICE_DEFAULT_VALUES).success).toBe(true));
  it("MOBILE_BARCODE 는 mobileBarcode 만 본다 — 다른 칸의 쓰레기값은 무시", () => {
    const r = orderInvoiceSchema.safeParse({ ...INVOICE_DEFAULT_VALUES, type: "MOBILE_BARCODE", mobileBarcode: "/ABC1234", loveCode: "x" });
    expect(r.success).toBe(true);
  });
  it("MOBILE_BARCODE 에 형식이 틀리면 mobileBarcode 에 에러", () => {
    const r = orderInvoiceSchema.safeParse({ ...INVOICE_DEFAULT_VALUES, type: "MOBILE_BARCODE", mobileBarcode: "ABC" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["mobileBarcode"]);
  });
  it("COMPANY 는 統一編號 필수, 회사명은 선택이되 60자 초과면 에러", () => {
    expect(orderInvoiceSchema.safeParse({ ...INVOICE_DEFAULT_VALUES, type: "COMPANY", companyTaxId: "97025978" }).success).toBe(true);
    const r = orderInvoiceSchema.safeParse({ ...INVOICE_DEFAULT_VALUES, type: "COMPANY", companyTaxId: "97025978", companyName: "a".repeat(61) });
    expect(r.error?.issues[0]?.path).toEqual(["companyName"]);
  });
  it("CITIZEN_CERT 는 citizenCert 를 본다", ...); it("DONATION 은 loveCode 를 본다", ...);
});
describe("toSubmitInvoice", () => {
  it("MEMBER_CARRIER 는 undefined", () => expect(toSubmitInvoice(INVOICE_DEFAULT_VALUES)).toBeUndefined());
  it("MOBILE_BARCODE 는 정규화한 carrierNum", () => expect(toSubmitInvoice({ ...INVOICE_DEFAULT_VALUES, type: "MOBILE_BARCODE", mobileBarcode: " /abc1234" })).toEqual({ type: "MOBILE_BARCODE", carrierNum: "/ABC1234" }));
  it("CITIZEN_CERT 는 citizenCert 를 carrierNum 으로", ...);
  it("DONATION 은 loveCode", () => expect(toSubmitInvoice({ ...INVOICE_DEFAULT_VALUES, type: "DONATION", loveCode: "168001" })).toEqual({ type: "DONATION", loveCode: "168001" }));
  it("COMPANY 는 회사명이 비면 키를 뺀다", () => expect(toSubmitInvoice({ ...INVOICE_DEFAULT_VALUES, type: "COMPANY", companyTaxId: "97025978", companyName: "  " })).toEqual({ type: "COMPANY", companyTaxId: "97025978" }));
  it("COMPANY 는 회사명을 trim 해서 보낸다", ...);
});
describe("toInvoiceFormField", () => {
  it("carrierNum 은 type 에 따라 갈린다", () => {
    expect(toInvoiceFormField("carrierNum", "MOBILE_BARCODE")).toBe("mobileBarcode");
    expect(toInvoiceFormField("carrierNum", "CITIZEN_CERT")).toBe("citizenCert");
    expect(toInvoiceFormField("carrierNum", "DONATION")).toBeNull();
  });
  it("loveCode·companyTaxId 는 그대로", ...);
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd apps/web && npx vitest run src/features/order/model/invoiceSchema.test.ts`
Expected: FAIL — `invoiceSchema` 모듈 없음.

- [ ] **Step 3: 구현** — `invoiceSchema.ts` 에 위 Interfaces 대로. `orderInvoiceSchema` 는 `z.object({ type: z.enum(INVOICE_TYPES), 나머지 z.string() })` 에 `superRefine` 으로 현재 `type` 의 칸만 검사(정규화 후 `isValid*`), `companyName` 은 trim 길이 > 60 일 때만 issue. 에러 `message` 는 `INVOICE_ERROR_KEY` 의 키 문자열. `userOrder.ts` 에 `UserOrderInvoiceType` 추가.

- [ ] **Step 4: 통과 확인**

Run: 위 명령. Expected: PASS (전부).

- [ ] **Step 5: i18n 키 추가** — 세 JSON 파일 끝(`cvs_store_empty_title` 뒤)에 아래 21개를 같은 순서로 추가.

| key | ko | en | zh-TW |
| --- | --- | --- | --- |
| invoice_section_title | 電子發票 | 電子發票 | 電子發票 |
| invoice_auto_issue_note | 결제 후 자동 발행 | Issued automatically after payment | 付款後自動開立 |
| invoice_type_member_carrier | 會員載具 (회원 이메일로 받기) | 會員載具 (sent to your member email) | 會員載具 |
| invoice_member_carrier_hint | 따로 고르지 않으면 회원 이메일로 발행됩니다 | If you don't choose another option, the invoice is issued to your member email | 未選擇其他方式時，發票將開立至會員信箱 |
| invoice_type_mobile_barcode | 手機條碼 (휴대폰 바코드) | 手機條碼 (mobile barcode) | 手機條碼 |
| invoice_type_citizen_cert | 自然人憑證 (자연인 인증서) | 自然人憑證 (Citizen Digital Certificate) | 自然人憑證 |
| invoice_type_donation | 捐贈發票 (기부) | 捐贈發票 (donate) | 捐贈發票 |
| invoice_type_company | 公司 (統一編號) | 公司 (company, 統一編號) | 公司（統一編號） |
| invoice_love_code_label | 愛心碼 | 愛心碼 | 愛心碼 |
| invoice_company_tax_id_label | 統一編號 | 統一編號 | 統一編號 |
| invoice_company_name_label | 公司名稱 (회사명) | 公司名稱 (company name) | 公司名稱 |
| invoice_mobile_barcode_invalid | / 로 시작하는 8자리 바코드를 입력해 주세요 (예: /ABC1234) | Enter the 8-character barcode starting with / (e.g. /ABC1234) | 請輸入以 / 開頭的 8 碼手機條碼（例：/ABC1234） |
| invoice_citizen_cert_invalid | 영문 대문자 2자 + 숫자 14자리로 입력해 주세요 | Enter 2 uppercase letters followed by 14 digits | 請輸入 2 碼大寫英文加 14 碼數字 |
| invoice_love_code_invalid | 愛心碼는 숫자 3~7자리예요 | 愛心碼 is 3 to 7 digits | 愛心碼為 3 至 7 碼數字 |
| invoice_company_tax_id_invalid | 統一編號는 숫자 8자리예요 | 統一編號 is 8 digits | 統一編號為 8 碼數字 |
| invoice_company_name_too_long | 회사명은 60자까지 입력할 수 있어요 | Company name can be up to 60 characters | 公司名稱最多 60 字 |
| invoice_check_not_found | 등록되지 않은 값이에요. 다시 확인해 주세요 | This value isn't registered. Please check it again | 查無此資料，請再確認 |
| invoice_checking | 확인 중… | Checking… | 確認中… |
| invoice_check_verified | ✓ 확인되었어요 | ✓ Verified | ✓ 已確認 |
| invoice_check_unverified | 지금은 확인이 어려워 형식만 검사했어요. 그대로 주문할 수 있어요 | We couldn't verify it right now, so only the format was checked. You can still order | 目前無法即時確認，僅檢查了格式，仍可下單 |
| invoice_company_name_placeholder | 확인 후 자동으로 채워져요. 직접 입력해도 돼요 | Filled in after the check. You can also type it | 確認後自動帶入，也可自行輸入 |

- [ ] **Step 6: 커밋**

```bash
git add apps/web/src/features/order/model/invoiceSchema.ts apps/web/src/features/order/model/invoiceSchema.test.ts apps/web/src/shared/services/userOrder.ts apps/web/src/i18n/messages
git commit -m "feat(web): add e-invoice form schema, submit mapping, and i18n keys for the order form"
```

---

### Task 2: draft 에 발표 입력 추가

**Files:**
- Modify: `apps/web/src/features/order/model/orderDraft.ts`
- Test: `apps/web/src/features/order/model/orderDraft.test.ts`

**Interfaces:**
- Consumes: `OrderInvoiceValues` (Task 1).
- Produces: `OrderDraft.invoice?: OrderInvoiceValues` (옛 draft 호환으로 선택). `saveOrderDraft` 의 인자 타입도 같이 바뀐다 — 호출부(`useOrderShipping.leaveForMap`, `useOrderCvsReturn`)는 그대로 컴파일된다(선택 필드).

- [ ] **Step 1: 실패하는 테스트** — `orderDraft.test.ts` 에 추가

```ts
it("invoice 를 저장하고 그대로 돌려준다", () => {
  saveOrderDraft({ ...baseDraft, invoice: { ...INVOICE_DEFAULT_VALUES, type: "DONATION", loveCode: "168001" } });
  expect(takeOrderDraft(baseDraft.sourceHref)?.invoice).toEqual({ ...INVOICE_DEFAULT_VALUES, type: "DONATION", loveCode: "168001" });
});
it("invoice 가 없는 옛 draft 도 읽힌다", () => {
  sessionStorage.setItem(ORDER_DRAFT_KEY, JSON.stringify({ ...baseDraft, savedAt: Date.now() }));
  expect(peekOrderDraft()?.invoice).toBeUndefined();
});
```
(`baseDraft` 는 파일에 이미 있는 draft 픽스처 이름에 맞춘다.)

- [ ] **Step 2: 실패 확인** — Run: `npx vitest run src/features/order/model/orderDraft.test.ts`. Expected: 타입 에러 또는 `invoice` 가 저장되지 않아 FAIL.
- [ ] **Step 3: 구현** — `OrderDraft` 에 `invoice?: OrderInvoiceValues` 추가, JSDoc "2026-11-06 이전 draft 에는 없다".
- [ ] **Step 4: 통과 확인** — 같은 명령, PASS.
- [ ] **Step 5: 커밋** — `git commit -m "feat(web): carry e-invoice values in the order draft"`

---

### Task 3: `useOrderInvoice` 훅

**Files:**
- Create: `apps/web/src/features/order/model/useOrderInvoice.ts`
- Test: `apps/web/src/features/order/model/useOrderInvoice.test.tsx`

**Interfaces:**
- Consumes: Task 1 전부, `useUserInvoiceMobileBarcodeCheckQuery` / `useUserInvoiceLoveCodeCheckQuery` / `useUserInvoiceCompanyCheckQuery` (`@entities/invoice`), `OrderInvoiceValues`.
- Produces:
  ```ts
  export type InvoiceCheckStatus = "idle" | "checking" | "valid" | "invalid" | "unverified";
  export interface InvoiceCheckState { status: InvoiceCheckStatus; name?: string | null }
  export type InvoiceServerField = "carrierNum" | "loveCode" | "companyTaxId";
  export const useOrderInvoice = () => ({
    form: UseFormReturn<OrderInvoiceValues>,
    type: UserOrderInvoiceType,
    setType(type: UserOrderInvoiceType): void,       // form.setValue("type") + 현재 타입 칸의 checkedValue 를 그 칸의 현재값으로
    confirmField(): void,                             // blur: 현재 type 의 칸 값을 정규화해 checkedValue 로 확정
    check: InvoiceCheckState,
    isValid: boolean,
    submitInvoice: UserOrderInvoice | undefined,
    applyServerFieldError(field: InvoiceServerField): void,
    getDraft(): OrderInvoiceValues,
    restoreDraft(values: OrderInvoiceValues | undefined): void, // reset + 확인 대상 칸의 checkedValue 를 복원값으로
  });
  ```
  동작 규칙:
  - `checkedValue` 는 `{ MOBILE_BARCODE, DONATION, COMPANY }` 세 타입별 string 상태. 쿼리는 `checkedValue[type]` 으로 호출하고 `enabled` 는 `type` 이 그 타입이고 형식이 맞을 때만.
  - `check` 도출: 현재 type 이 `MEMBER_CARRIER`·`CITIZEN_CERT` → `idle`. 확인 대상 타입이면 쿼리 상태로: 값이 비었거나 형식 틀림 → `idle`; `isFetching` → `checking`; `isError` → `unverified`; `data.valid === false` → `invalid`; `valid && verified` → `valid`(+`name`); `valid && !verified` → `unverified`.
  - `isValid` = `orderInvoiceSchema.safeParse(values).success && check.status !== "invalid" && check.status !== "checking"`. 단, 확인 대상 타입인데 `checkedValue` 가 현재 입력값(정규화)과 다르면(아직 blur 안 함) `false` — blur 없이 결제로 가는 길을 막는다. **Ruling 여지**: 이 규칙이 UX 상 과하면 `confirmField` 를 제출 직전에 부르도록 2단계가 바꾼다. 여기서는 스펙대로 "확인 중이면 false".
  - 회사명 자동 채움: `type === "COMPANY"` 이고 `check.status === "valid"` 이고 `name` 이 있고 `companyName.trim() === ""` 일 때 `setValue("companyName", name)`. effect 는 `name` 이 바뀔 때만 돈다.
  - `applyServerFieldError(field)`: `toInvoiceFormField(field, type)` 이 null 이 아니면 `setError(그 칸, { type: "server", message: INVOICE_ERROR_KEY[그 칸] })`. 단 message 는 미등록 문구 `"invoice_check_not_found"` 를 쓴다.

- [ ] **Step 1: 실패하는 테스트** — `useOrderInvoice.test.tsx`. `useOrderShipping.test.ts` 의 `QueryClientProvider` wrapper 패턴을 그대로 쓰고 `@shared/services/userInvoice` 를 `vi.mock` 한다(`getUserInvoiceMobileBarcodeCheck` 등 세 함수를 `vi.fn()`).

```ts
it("기본값은 MEMBER_CARRIER 이고 유효하며 제출값이 없다", () => {
  const { result } = render();
  expect(result.current.type).toBe("MEMBER_CARRIER");
  expect(result.current.isValid).toBe(true);
  expect(result.current.submitInvoice).toBeUndefined();
  expect(mobileCheck).not.toHaveBeenCalled();
});
it("手機條碼는 입력만으로는 확인 API 가 나가지 않는다", () => {
  act(() => result.current.setType("MOBILE_BARCODE"));
  act(() => result.current.form.setValue("mobileBarcode", "/ABC1234"));
  expect(mobileCheck).not.toHaveBeenCalled();
  expect(result.current.isValid).toBe(false);   // 아직 확인 전
});
it("blur 하면 정규화한 값으로 한 번 부르고, 확인되면 유효하다", async () => {
  mobileCheck.mockResolvedValue({ result: true, data: { valid: true, verified: true } });
  ... setType, setValue(" /abc1234 "), act(() => result.current.confirmField());
  await waitFor(() => expect(result.current.check.status).toBe("valid"));
  expect(mobileCheck).toHaveBeenCalledTimes(1); expect(mobileCheck).toHaveBeenCalledWith("/ABC1234");
  expect(result.current.isValid).toBe(true);
  expect(result.current.submitInvoice).toEqual({ type: "MOBILE_BARCODE", carrierNum: "/ABC1234" });
});
it("형식이 틀리면 blur 해도 부르지 않는다", ...setValue("ABC"), confirmField → mobileCheck not called, check.status "idle", isValid false);
it("valid:false 면 invalid 이고 결제가 막힌다", ... data { valid:false, verified:true } → status "invalid", isValid false);
it("verified:false 면 unverified 이고 결제는 된다", ... → status "unverified", isValid true);
it("확인 API 가 실패해도 unverified 이고 결제는 된다", mobileCheck.mockRejectedValue(new Error("500")) → "unverified", isValid true);
it("같은 값을 다시 blur 해도 재호출하지 않는다", ... confirmField 두 번 → toHaveBeenCalledTimes(1));
it("愛心碼가 확인되면 기부처 이름이 온다", loveCheck → { valid, verified, name: "財團法人台灣兒童暨家庭扶助基金會" } → check.name);
it("타입을 바꿨다 돌아와도 값과 확인 결과가 남는다", DONATION 확인 → setType("COMPANY") → setType("DONATION") → loveCode 그대로, status "valid", loveCheck 1회);
it("統一編號가 확인되면 비어 있는 회사명을 채운다", companyCheck → name "首爾映像有限公司" → form.getValues("companyName") === "首爾映像有限公司");
it("회사명을 이미 적었으면 덮지 않는다", setValue("companyName","내 회사") 먼저 → 그대로);
it("applyServerFieldError 는 현재 타입의 칸에 에러를 건다", setType("MOBILE_BARCODE") → applyServerFieldError("carrierNum") → form.formState.errors.mobileBarcode?.message === "invoice_check_not_found");
it("restoreDraft 는 값을 복원하고 확인을 한 번 부른다", restoreDraft({ ...INVOICE_DEFAULT_VALUES, type:"DONATION", loveCode:"168001" }) → loveCheck 1회, waitFor status "valid");
```

- [ ] **Step 2: 실패 확인** — Run: `npx vitest run src/features/order/model/useOrderInvoice.test.tsx`. Expected: FAIL — 모듈 없음.
- [ ] **Step 3: 구현** — Interfaces 와 동작 규칙대로. `useForm({ resolver: orderInvoiceResolver, defaultValues: INVOICE_DEFAULT_VALUES, mode: "onBlur" })`. 세 쿼리는 항상 호출(훅 규칙)하고 `enabled` 로 가른다.
- [ ] **Step 4: 통과 확인** — PASS. 그리고 `npx vitest run src/features/order` 전부 PASS.
- [ ] **Step 5: 커밋** — `git commit -m "feat(web): add the e-invoice form model with blur-time checks and submit mapping"`

---

### Task 4: `OrderInvoiceSection` UI

**Files:**
- Create: `apps/web/src/features/order/ui/OrderInvoiceSection.tsx`
- Modify: `apps/web/src/features/order/ui/OrderSection.tsx` (`description?: string` prop: 제목 오른쪽 `text-body-4 text-neutral font-normal ml-2`)
- Modify: `apps/web/src/features/order/index.tsx` (export 추가)
- Test: `apps/web/src/features/order/ui/OrderInvoiceSection.test.tsx`

**Interfaces:**
- Consumes: `ReturnType<typeof useOrderInvoice>` (Task 3), `INVOICE_TYPES`·`INVOICE_ERROR_KEY` (Task 1), `FieldLabel`·`FieldError`·`INPUT_CLASS`·`TWO_COLUMN_CLASS` (`./orderFields`), `RadioGroup`·`RadioGroupItem`·`Label`·`Input` (`@seoul-moment/ui`).
- Produces:
  ```ts
  interface OrderInvoiceSectionProps { invoice: ReturnType<typeof useOrderInvoice> }
  export function OrderInvoiceSection({ invoice }: OrderInvoiceSectionProps): JSX.Element
  ```
  구조: `OrderPaymentSection` 과 같은 라디오 카드 5개(`Label` 카드 + `RadioGroupItem`), 라벨 키 `invoice_type_*`. 고른 카드의 `Label` 아래(같은 카드 안, `mt-3` 블록)에 타입별 패널:
  - MEMBER_CARRIER: `<p class="text-body-5 text-neutral">{invoice_member_carrier_hint}</p>`
  - MOBILE_BARCODE: `Input id="order-invoice-mobile-barcode"`, placeholder `/ABC1234`, `autoCapitalize="characters"`, `onBlur` → `register.onBlur` + `invoice.confirmField()`.
  - CITIZEN_CERT: `Input id="order-invoice-citizen-cert"`, placeholder `AB12345678901234`.
  - DONATION: `FieldLabel` `invoice_love_code_label` + `Input id="order-invoice-love-code"` `inputMode="numeric"` placeholder `168001`, onBlur 확인.
  - COMPANY: `TWO_COLUMN_CLASS` 로 `統一編號`(id `order-invoice-company-tax-id`, numeric, placeholder `97025978`, onBlur 확인) + `公司名稱`(id `order-invoice-company-name`, placeholder `invoice_company_name_placeholder`).
  - 상태 문구 한 줄(`FieldError` 자리, `id="{inputId}-status"`, 입력의 `aria-describedby`): 우선순위 폼 에러(빨강 `text-danger`, `t(errors[field].message)`) → `check.status` 별: `checking` → `invoice_checking`(`text-neutral`) / `invalid` → `invoice_check_not_found`(`text-danger`) / `valid` → DONATION 이면 `check.name`, 그 밖엔 `invoice_check_verified`(`text-black`) / `unverified` → `invoice_check_unverified`(`text-neutral`) / `idle` → 없음.

- [ ] **Step 1: 실패하는 테스트** — `OrderInvoiceSection.test.tsx`. `OrderCvsPickupPanel.test.tsx` 의 `NextIntlClientProvider` + `ko.json` 패턴. `invoice` prop 은 실제 `useOrderInvoice` 를 쓰는 작은 `Harness` 컴포넌트로 만들고 `@shared/services/userInvoice` 를 mock 한다.

```ts
it("라디오 5개를 그리고 기본은 會員載具 이며 안내 한 줄만 보인다", () => {
  expect(screen.getAllByRole("radio")).toHaveLength(5);
  expect(screen.getByRole("radio", { name: ko.invoice_type_member_carrier })).toBeChecked();
  expect(screen.getByText(ko.invoice_member_carrier_hint)).toBeInTheDocument();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
});
it("手機條碼를 고르면 그 아래에만 입력칸이 펼쳐진다", () => { click radio → getByLabelText/placeholder "/ABC1234" 1개, 다른 placeholder 없음 });
it("형식이 틀린 채 blur 하면 형식 안내가 빨갛게 뜬다", () => { type "ABC", blur → getByText(ko.invoice_mobile_barcode_invalid) has class text-danger });
it("확인되면 ✓ 문구가 뜬다", () => { mock valid/verified, type "/ABC1234", blur → findByText(ko.invoice_check_verified) });
it("愛心碼가 확인되면 기부처 이름이 뜬다", () => { mock name → findByText("財團法人台灣兒童暨家庭扶助基金會") });
it("公司는 두 칸이고 統一編號 확인 뒤 회사명이 채워진다", () => { mock name "首爾映像有限公司" → findByDisplayValue("首爾映像有限公司") });
it("섹션 제목 옆에 보조 문구가 온다", () => { render(<OrderSection title="t" description="d" />) → getByText("d") });
```

- [ ] **Step 2: 실패 확인** — Run: `npx vitest run src/features/order/ui/OrderInvoiceSection.test.tsx`. Expected: FAIL — 모듈 없음.
- [ ] **Step 3: 구현** — 위 구조대로. `index.tsx` 에 `OrderInvoiceSection`, `useOrderInvoice`, `INVOICE_TYPES` export.
- [ ] **Step 4: 통과 확인** — PASS, `npx eslint src/features/order` 깨끗.
- [ ] **Step 5: 커밋** — `git commit -m "feat(web): add the e-invoice section with per-type inputs and check status to the order form"`

---

### Task 5: 주문서 연결 + draft 왕복

**Files:**
- Modify: `apps/web/src/features/order/model/useOrderShipping.ts` (params에 `invoice` 콜백, `leaveForMap` 저장, `restoreDraft` 복원)
- Modify: `apps/web/src/views/order/ui/OrderPage.tsx`
- Test: `apps/web/src/features/order/model/useOrderShipping.test.ts` (2건 추가)

**Interfaces:**
- Consumes: `useOrderInvoice` 의 `getDraft`/`restoreDraft`/`isValid` (Task 3), `OrderInvoiceSection` (Task 4), `OrderDraft.invoice` (Task 2).
- Produces:
  ```ts
  interface UseOrderShippingParams {
    profile?: UserProfile; userInfo?: UserInfo; source: OrderSource | null;
    /** 지도 왕복 draft 에 같이 싣는 다른 섹션의 입력. 저장 때 getDraft, 복원 때 restoreDraft 를 부른다 */
    invoice?: { getDraft(): OrderInvoiceValues; restoreDraft(values: OrderInvoiceValues | undefined): void };
  }
  ```
  `OrderPage`: `const invoice = useOrderInvoice();` 를 `useOrderShipping` **앞에** 부르고 `useOrderShipping({ profile, userInfo, source, invoice })`. 배송지 섹션 다음에
  `<OrderSection title={t("invoice_section_title")} description={t("invoice_auto_issue_note")}><OrderInvoiceSection invoice={invoice} /></OrderSection>`.
  `canSubmit={shipping.isValid && invoice.isValid}` (OrderSummary·OrderBar 둘 다).

- [ ] **Step 1: 실패하는 테스트** — `useOrderShipping.test.ts` 에 추가

```ts
it("지도로 떠날 때 invoice draft 를 같이 저장한다", () => {
  const invoiceValues = { ...INVOICE_DEFAULT_VALUES, type: "DONATION" as const, loveCode: "168001" };
  const { result } = render({ source, profile, userInfo, invoice: { getDraft: () => invoiceValues, restoreDraft: vi.fn() } });
  act(() => result.current.cvs.openCvsMap("FAMI"));
  expect(peekOrderDraft()?.invoice).toEqual(invoiceValues);
});
it("돌아와서 복원할 때 invoice 를 restoreDraft 로 넘긴다", async () => {
  saveOrderDraft({ ...cvsDraft, invoice: invoiceValues });
  const restoreDraft = vi.fn();
  render({ source, profile, userInfo, invoice: { getDraft: () => INVOICE_DEFAULT_VALUES, restoreDraft } });
  await waitFor(() => expect(restoreDraft).toHaveBeenCalledWith(invoiceValues));
});
```

- [ ] **Step 2: 실패 확인** — Run: `npx vitest run src/features/order/model/useOrderShipping.test.ts`. Expected: 두 테스트 FAIL.
- [ ] **Step 3: 구현** — `leaveForMap` 의 `saveOrderDraft` 에 `invoice: invoice?.getDraft()`, `restoreDraft` 에 `invoice?.restoreDraft(draft.invoice)`. 의존성 배열에 `invoice` 추가(호출부는 `useMemo` 로 안정된 객체를 넘긴다 — `OrderPage` 에서 `useMemo(() => ({ getDraft: invoice.getDraft, restoreDraft: invoice.restoreDraft }), [...])`; `useOrderInvoice` 의 두 함수는 `useCallback` 으로 안정).
- [ ] **Step 4: 통과 확인** — PASS. 전체: `npx vitest run` 전부 PASS, `pnpm typecheck` 깨끗.
- [ ] **Step 5: OrderPage 연결** — Interfaces 대로. 수동 확인: `pnpm --filter @seoul-moment/web exec next dev --turbopack` 으로 띄워 `/ko/order?cart=…` 에서 섹션이 배송지와 결제 수단 사이에 보이고, 手機條碼에 `/abc1234` blur → "✓ 확인되었어요"(dev API), 편의점 칩 → 지도 → 복귀 후 발표 입력 유지.
- [ ] **Step 6: 커밋** — `git commit -m "feat(web): wire the e-invoice section into the order page and the map round-trip draft"`

---

### Task 6: i18n 시트 반영·빌드·마무리

**Files:** 없음(시트·검증).

- [ ] **Step 1: 시트에 키 21개 추가** — `language-pack` 탭 574행부터, TSV(key/ko/en/zh-TW) `pbcopy` → 이름 상자 `A574` → `cmd+v`. 지난 작업 메모리 `i18n-sheet-write-needs-browser` 절차.
- [ ] **Step 2: 왕복 확인** — Run: `pnpm --filter @seoul-moment/web i18n:sync && git diff --stat apps/web/src/i18n/messages`. Expected: 파일 끝 줄바꿈 차이만(또는 0). 내용 차이가 있으면 시트 값을 고친다.
- [ ] **Step 3: 빌드** — Run: `pnpm --filter @seoul-moment/web build`. Expected: 성공, `MISSING_MESSAGE` 없음.
- [ ] **Step 4: 마무리** — superpowers:finishing-a-development-branch (base: `develop`). PR 본문 영문, 스펙 링크, "2단계에서 결제 버튼에 `invoice.submitInvoice` 와 `applyServerFieldError` 를 연결" 을 Follow-ups 로.
