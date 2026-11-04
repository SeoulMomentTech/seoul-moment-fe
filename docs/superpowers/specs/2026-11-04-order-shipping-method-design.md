# 주문서 배송 방법 선택(택배 / 편의점 픽업) 설계

날짜: 2026-11-04
대상 앱: `apps/web`
관련 커밋: `f931d54a` (주문·결제·물류 API 서비스와 훅)

## 의도

대만 사용자에게 편의점 픽업(超商取貨)은 택배만큼 흔한 수령 방식이다. 서버가 ECPay 물류
연동(`/logistics/cvs/*`)과 주문 생성의 `shippingType: "CVS"`를 열었으므로, 주문서에서
택배와 편의점 픽업 중 하나를 고를 수 있게 한다.

## 범위

**이번 작업**

- 배송지 섹션 상단의 탭(택배 / 편의점 픽업)과 각 탭의 입력 화면
- 편의점 체인 선택 → ECPay 전자지도 왕복 → 고른 매장 표시
- 지도로 떠났다 돌아와도 주문서 입력값이 남아 있게 하는 임시 저장
- 편의점 픽업일 때 배송비 미리보기(`cvsStoreToken`) 연결
- 편의점 픽업용 받는 분·휴대폰 검증과 `결제하기` 활성 조건
- 새 문구의 i18n 키(ko / en / zh-TW)

**다음 작업 (비목표)**

- `결제하기` 버튼이 실제로 주문을 만들고 결제를 시작하는 연결
  (`useCreateUserOrderMutation` → `useUserOrderPaymentMutation` → PG 이동)
- 결제 결과 페이지(`/payment/result`)
- 전자발표(電子發票) 입력

**안티목표**

- 편의점 픽업을 골랐는데 택배 주소 검증에 걸려 결제 버튼이 안 켜지는 것
- 지도에서 돌아왔더니 받는 분·결제수단 등 입력이 비어 있는 것
- 만료된 매장 토큰(1시간)으로 주문을 시도하게 두는 것

## 서버 규칙 (제약)

`apps/web/src/shared/services/userOrder.ts`, `logistics.ts` 참고.

- 미리보기 `POST user/order/preview`: 택배는 `city`·`district`, 편의점은
  `shippingType: "CVS"` + `cvsStoreToken`. 생략하면 본섬 기준 예상값
  (`isShippingEstimated: true`). 離島 매장이면 외섬 요금.
- 주문 생성 `POST user/order`: 편의점은 `shippingType: "CVS"` + `cvsPickup
  { storeToken, recipientName, phone }`. `useDefaultShipping`·`shipping`은 보내지 않는다.
  - `recipientName`: 중문 2–5자 또는 영문 4–10자, 공백·숫자 불가 (수령 시 신분증 대조)
  - `phone`: `09`로 시작하는 10자리 (택배의 `+886…` E.164 형식과 다르다)
- 전자지도 `GET logistics/cvs/map?chain=&returnUrl=`: JSON이 아니라 **브라우저를 같은
  탭으로 보내는 URL**. 매장을 고르면 `{returnUrl}?cvsStoreToken={token}`으로 돌아온다.
  `returnUrl`은 프론트 도메인(서버의 `STOREFRONT_BASE_URL`)으로 시작해야 하며, 아니면
  서버가 무시하고 자기 페이지에서 매장을 보여준다. ECPay 테스트 환경에서는 지도 없이
  고정 매장이 돌아온다.
- 매장 조회 `GET logistics/cvs/store/{token}`: 1시간 지나면 404.
- 체인: `UNIMART`(7-ELEVEN) / `FAMI`(全家) / `HILIFE`(萊爾富). Hi-Life는
  `isOutsideIsland`를 항상 false로 준다.

## 화면 흐름

### 배송지 섹션 상단 탭

섹션 제목 "배송지" 아래, 지금의 "기본 배송지 사용" 체크 위에 탭 두 개를 둔다.
**택배** / **편의점 픽업**. 기본값은 택배.

탭은 두 개뿐이고 역할이 "입력 방식 전환"이라 `role="tablist"` 마크업의 세그먼트
컨트롤로 만든다. `@seoul-moment/ui`에 Tabs 컴포넌트가 없고 `shared/ui`에도 없으므로
`features/order/ui`에 작은 세그먼트 컴포넌트를 둔다. (제 판단. 다른 화면에서 또 쓰게
되면 그때 `shared/ui`로 올린다.)

탭을 바꿔도 **각 탭의 입력값은 버리지 않는다**. 택배 주소를 다 채운 뒤 편의점을 눌러봤다
돌아왔을 때 주소가 비어 있으면 안 된다.

### 택배 탭

지금 화면 그대로. 기본 배송지 체크, 받는 분·연락처, 우편번호·縣市·區·상세주소, 배송
요청사항. 코드도 `OrderShippingSection`의 현재 내용을 택배 패널로 감싸는 수준으로 둔다.

### 편의점 픽업 탭

위에서 아래로:

1. **체인 칩** — "편의점" 라벨 아래 `7-ELEVEN` · `全家` · `萊爾富` 세 개.
   `shared/ui/chip.tsx`(`active` prop)를 쓴다. 칩 라벨은 번역하지 않는 브랜드명이라
   i18n 키 없이 상수로 둔다.
   - 아직 매장이 없거나 **다른** 체인의 칩을 누르면 → 즉시 그 체인의 전자지도로 이동
     (같은 탭). 별도의 "매장 고르기" 버튼은 두지 않는다. 칩이 곧 진입점이다. (제 판단)
   - 이미 고른 매장의 체인 칩을 다시 누르면 아무 일도 없다. 다시 고르려면 카드의
     "매장 다시 고르기"를 쓴다.
2. **매장 카드** — 매장을 골랐으면 참고 시안대로:
   - 1행: `{체인 표시명} {storeName} · {storeId}` (7-ELEVEN 建盛門市 · 131386)
   - 2행: `storeAddress`
   - 3행: 링크 "매장 다시 고르기 ›" → 같은 체인의 전자지도로 이동
   - 매장이 없으면 카드 자리에 안내 한 줄: "편의점을 골라 매장을 선택해 주세요"
     (제 판단. 빈 카드 테두리는 그리지 않는다.)
   - 매장 조회가 로딩 중이면 카드 높이의 스켈레톤. 404(만료)면 카드 자리에
     "매장 선택이 만료되었어요. 다시 골라 주세요"와 함께 매장을 비운다.
3. **받는 분 · 휴대폰** — 택배와 같은 2열 격자, 라벨도 같은 키(`recipient_name`,
   `recipient_phone`). 단 검증과 placeholder가 다르다.
   - 받는 분: placeholder "실명 (중문 2–5자 / 영문 4–10자)". 에러 문구 "수령 시 신분증과
     대조하니 실명을 중문 2–5자 또는 영문 4–10자로 입력해 주세요".
   - 휴대폰: `+886` 접두 없이 `09xxxxxxxx` 10자리 그대로 받는다. placeholder
     "0912345678". 에러 문구 "09로 시작하는 10자리 휴대폰 번호를 입력해 주세요".
   - 초기값은 프로필 이름과 `userInfo.phone`에서 채운다. 전화는 E.164(`+886912…`)로
     저장돼 있을 수 있으므로 `0` + 국내 9자리로 변환해 넣는다 (`schema.ts`의
     `toLocalMobile` 재사용).
   - "기본 배송지 사용" 체크는 편의점 탭에서 **보이지 않는다**. 서버도 CVS에서는 그
     값을 보지 않는다.
   - 배송 요청사항은 편의점 탭에 없다. 서버 `cvsPickup`에 해당 필드가 없다.

### 배송비·금액 표시

- 택배: 지금처럼 縣市·區가 다 있을 때만 확정.
- 편의점: 매장 토큰이 있을 때만 확정. 지역 라벨은 `"{체인 표시명} {storeName} · 본섬/외섬"`.
  매장 전이거나 조회 실패면 택배와 같은 "확정 전" 표시(배송비 `null`).
- 미리보기에 `cvsStoreToken`을 넣는 것은 **매장 조회가 성공한 뒤**다. 만료·무효 토큰에
  미리보기가 어떻게 답하는지 스웨거에 없고, 미리보기가 에러를 주면 `OrderPage`의 `isError`
  분기가 주문서 전체를 비워 버린다. 매장 조회(404 처리 가능)를 먼저 통과시키면 그 위험이
  없다. 왕복이 한 번 늘고 그동안 "확정 전"으로 보이는 것은 감수한다. (제 판단)
- 탭을 바꾸면 미리보기 키가 바뀌어 자동 재조회된다. 직전 값은 `keepPreviousData`로
  유지되는 기존 동작을 그대로 쓴다.

### 결제하기 활성 조건 (`canSubmit`)

- 택배: 기존 `orderShippingSchema` 통과.
- 편의점: 매장 토큰이 있고(조회 성공 상태), 받는 분·휴대폰이 편의점 스키마를 통과.

실제 제출은 다음 작업이지만, 이번에 `useOrderShipping`이 **제출용 값**을 함께 돌려준다.
택배면 `{ shippingType: "HOME", useDefaultShipping, shipping }`, 편의점이면
`{ shippingType: "CVS", cvsPickup }`. 타입은 서비스의 `CreateUserOrderReq` 분기와
맞춘다. 다음 작업이 이 값을 그대로 `createUserOrder`에 넘기면 된다. (제 판단)

## 지도 왕복과 임시 저장

전자지도는 페이지를 떠난다. React 상태는 전부 사라지므로 떠나기 **직전**에 주문서
입력을 `sessionStorage`에 저장하고, 돌아와서 복원한다.

- 키: `order:draft`. 값은 JSON 하나:
  ```ts
  interface OrderDraft {
    /** 어느 주문서의 임시값인지. 다른 주문 대상이면 무시한다 */
    sourceHref: string;             // toOrderHref(source)
    shippingMethod: "HOME" | "CVS";
    home: { useDefaultShipping: boolean; values: OrderShippingValues };
    cvs: { chain: CvsChain | null; storeToken: string | null;
           recipientName: string; phone: string };
    paymentMethod: UserOrderPaymentMethod;
    savedAt: number;                // Date.now()
  }
  ```
- TTL 1시간 (매장 토큰 수명과 같다). 지나면 버린다.
- 저장 시점: 칩 또는 "매장 다시 고르기"로 지도에 가기 직전 한 번. 입력할 때마다 저장하지
  않는다.
- 복원 시점: 주문서 마운트 시 draft가 있고 `sourceHref`가 현재 주문 대상과 같으면 복원하고
  **즉시 삭제**한다. SNS 로그인의 `linePending`처럼 "읽으면서 지우기" 때문에 생긴 버그를
  피하려고 삭제를 미루지는 않는다. 여기서는 LIFF 같은 이중 리다이렉트가 없고,
  StrictMode 이중 실행은 `useRef`로 한 번만 처리한다. (제 판단)
- `returnUrl`은 **쿼리 없는** 주문서 경로다: `{origin}/{locale}/order`. 서버가
  `{returnUrl}?cvsStoreToken=…`을 문자 그대로 붙이는지 `&`로 합치는지 알 수 없으므로
  쿼리가 있는 URL을 넘기지 않는다. 주문 대상은 draft의 `sourceHref`가 들고 있다.
  (제 판단 — 어느 쪽이든 깨지지 않는 쪽을 골랐다.)
- 복귀 처리: `/order?cvsStoreToken=x`로 돌아오면 URL에 주문 대상이 없으므로 draft를 먼저
  읽는다. draft가 있으면 토큰을 draft의 `cvs.storeToken`에 넣고 `router.replace(sourceHref)`로
  원래 주문서(`?cart=`/`?buy=`)로 옮긴 뒤, 거기서 draft를 복원한다. draft가 없거나 만료면
  토큰을 버리고 기존 "주문할 것이 없음" 화면이 그대로 뜬다. 토큰은 URL에서 draft로 옮긴
  뒤 지워지므로 새로고침·뒤로가기로 다시 흘러들지 않는다.
- 로컬 개발(`localhost`)에서는 서버의 `STOREFRONT_BASE_URL`과 달라 서버 페이지에 매장이
  표시되는 데서 끝날 수 있다. 이건 환경 제약이라 코드로 우회하지 않는다.
- 기본 배송지 체크가 켜진 상태에서 돌아오면 프로필 재주입 효과(`fillFromProfile`)가
  복원값을 덮는다. 복원 뒤에만 프로필 주입이 돌도록 순서를 보장한다.

로그인 상태는 `useUserAuthStore`(persist)가 이미 유지하므로 추가 작업 없음.

## 상태 모델

`useOrderShipping`을 확장한다. 바깥 API는 지금 것에 다음을 더한다.

```ts
shippingMethod: "HOME" | "CVS";
setShippingMethod(next): void;
cvs: {
  chain: CvsChain | null;
  storeToken: string | null;
  store: GetLogisticsCvsStoreRes | undefined;   // useLogisticsCvsStoreQuery
  isStoreLoading: boolean;
  isStoreExpired: boolean;                      // 404
  form: UseFormReturn<OrderCvsPickupValues>;
  openMap(chain: CvsChain): void;               // draft 저장 → location.assign(mapUrl)
};
/** 미리보기 입력. useOrderItems 에 그대로 넘긴다 */
previewShipping:
  | { shippingType: "HOME"; city?: string; district?: string }
  | { shippingType: "CVS"; cvsStoreToken?: string };
isValid: boolean;                               // 탭에 맞는 스키마로 판정
submitShipping: UserOrderShippingOption | null; // 제출용 값 (다음 작업이 쓴다)
```

훅이 커지면 `useOrderCvsPickup`으로 편의점 부분을 쪼개도 된다. 파일 구조는 빌더가 정한다.

`useOrderItems`는 `{ city, district }` 대신 `previewShipping`을 받아
`useOrderPreviewQuery`의 `shippingType`/`cvsStoreToken`으로 넘긴다.

### 편의점 스키마 (`features/order/model/schema.ts`에 추가)

```ts
export const orderCvsPickupSchema = z.object({
  recipientName: z.string().trim().refine(isValidCvsRecipientName),
  phone: z.string().refine((v) => /^09\d{8}$/.test(toPhoneDigits(v))),
});
// 중문 2–5자: /^[一-鿿]{2,5}$/  영문 4–10자: /^[A-Za-z]{4,10}$/
```

에러 키 맵도 `SHIPPING_ERROR_KEY`처럼 분리해 둔다.

받는 분 규칙은 스웨거 문구(중문 2–5자 또는 영문 4–10자, 공백·숫자 불가)를 그대로 옮긴
것이고 서버의 실제 정규식은 확인하지 못했다. 다음 작업(주문 생성 연결)에서 400 응답의
`message`를 받는 분 필드 에러로 보여 주는 자리를 마련해, 클라이언트 규칙이 서버보다
느슨해도 사용자가 이유를 알 수 있게 한다. (제 판단)

## 컴포넌트 구조

```
features/order/
 ├─ model/
 │   ├─ schema.ts              (+ orderCvsPickupSchema, CVS_ERROR_KEY, isValidCvsRecipientName)
 │   ├─ useOrderShipping.ts    (확장: shippingMethod, cvs, previewShipping, submitShipping)
 │   ├─ useOrderItems.ts       (previewShipping 받기)
 │   ├─ orderDraft.ts          (sessionStorage 저장·복원·TTL)
 │   └─ cvsChain.ts            (CVS_CHAINS: 체인 → 표시명 상수)
 └─ ui/
     ├─ OrderShippingSection.tsx    (탭 + 두 패널 분기; 택배 패널은 기존 내용)
     ├─ OrderShippingMethodTabs.tsx (세그먼트 컨트롤)
     ├─ OrderCvsPickupPanel.tsx     (칩 + 매장 카드 + 받는 분/휴대폰)
     └─ OrderCvsStoreCard.tsx       (카드 / 빈 안내 / 만료 / 스켈레톤)
```

`views/order/ui/OrderPage.tsx`는 `useOrderShipping`의 새 값을 섹션과 `useOrderItems`에
꽂고, 지역 라벨 계산을 탭에 따라 분기한다. `paymentMethod` 상태는 draft에 넣기 위해
`useOrderShipping` 쪽으로 옮기거나 draft 저장 함수에 인자로 넘긴다. 어느 쪽이든 빌더가
정한다.

## i18n

새 키(ko 기준, en·zh-TW 번역 포함). 실제 키 이름은 기존 네이밍(`snake_case`)을 따른다.

| 키 | ko |
| --- | --- |
| `shipping_method_home` | 택배 |
| `shipping_method_cvs` | 편의점 픽업 |
| `cvs_chain` | 편의점 |
| `cvs_store_empty` | 편의점을 골라 매장을 선택해 주세요 |
| `cvs_store_expired` | 매장 선택이 만료되었어요. 다시 골라 주세요 |
| `cvs_store_reselect` | 매장 다시 고르기 |
| `cvs_recipient_placeholder` | 실명 (중문 2–5자 / 영문 4–10자) |
| `cvs_recipient_invalid` | 수령 시 신분증과 대조하니 실명을 중문 2–5자 또는 영문 4–10자로 입력해 주세요 |
| `cvs_phone_invalid` | 09로 시작하는 10자리 휴대폰 번호를 입력해 주세요 |

번역 원본은 Google Sheet다. 서비스 계정은 읽기 전용이라 키 추가는 브라우저(Chrome 확장)로
시트에 붙여넣은 뒤 `pnpm i18n:sync`로 내려받는다. 커밋되지 않은 키는 `next build`를
`MISSING_MESSAGE`로 깨뜨리므로, 시트 반영 → sync → 커밋 순서를 지킨다.

## 테스트

- `schema.test.ts`: 편의점 이름(중문/영문/공백/숫자 경계)·휴대폰(09 시작 10자리, E.164
  입력 변환) 케이스.
- `orderDraft.test.ts`: 저장·복원, TTL 초과, 다른 `sourceHref` 무시, 복원 후 삭제.
- `useOrderShipping.test.ts`: 탭 전환 시 양쪽 값 보존, 편의점 `isValid`가 매장 토큰 +
  스키마에 의존, `previewShipping`은 매장 조회 성공 뒤에만 토큰을 품음,
  `submitShipping` 분기.
- 복귀 처리: `/order?cvsStoreToken=x` + draft 있음 → `sourceHref`로 replace, draft 없음 →
  토큰 폐기. 실제 서버 왕복이 안 되는 환경에서도 URL을 손으로 만들어 재현할 수 있게
  이 경로를 모델 단위로 분리한다.
- 화면 테스트는 기존 관행(모델 단위 Vitest)을 따르고, 지도 왕복은 수동 확인(dev API 는
  테스트 환경이라 고정 매장이 돌아온다).

## 빌더에게 맡기는 것

- 세그먼트 컨트롤의 정확한 스타일(프로젝트 토큰 안에서), 칩 간격, 카드 여백
- `useOrderShipping`을 쪼갤지, `paymentMethod`를 어디서 들고 있을지
- `location.assign` 직전에 저장 실패(sessionStorage 불가)를 어떻게 다룰지 — 저장이
  안 돼도 지도 이동은 막지 않는다
- 체인 표시명 상수의 위치(`features/order/model` 또는 `entities/logistics`)
