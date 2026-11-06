# 주문서 결제 흐름(ECPay) 설계

날짜: 2026-11-06 · 대상: `apps/web` 주문서(`/order`) + 결제 결과(`/payment/result`) · 상태: 승인됨(2026-11-06)

결제 연동 3단계 중 2단계. 1단계(전자발표 입력, PR #332)와 배송 방법(PR #331)이 선행됐다.
LINE Pay 는 샌드박스 키가 없어 결제 시작이 500 이라 **이번 범위에서 뺀다**(다음 단계).
주문 상세 화면(백엔드 문서 06)도 3단계.

## 의도와 이유

주문서의 "결제하기" 는 지금 아무것도 하지 않는다("준비 중" 문구). 백엔드가 주문 생성 →
결제 시작 → ECPay 결제창 → 결과 조회 API 를 모두 열었으므로(문서 `payment-ui-api-map.html`
03·04·05), 버튼을 실제 결제로 잇고 PG 에서 돌아오는 결과 페이지를 만든다.

근거: 백엔드 문서 03 "결제수단 · 결제하기", 04 "결제 결과", 05 "입금 대기".
서비스 함수·훅은 이미 있다: `useCreateUserOrderMutation`, `useUserOrderPaymentMutation`,
`usePaymentResultQuery`(REQUESTED 동안 3초 폴링), `useUserOrderDetailQuery`.

## 목표 / 비목표 / 실패 조건

**목표**
- 결제하기 한 번 = 주문 생성 → 결제 시작(ECPAY) → `handoffUrl` 로 이동. 버튼 연타·중복 주문 방지.
- LINE 안(LIFF·인앱 브라우저)에서는 외부 브라우저로 넘기고, 원래 화면은 "외부 브라우저에서
  결제 중" 대기 화면으로 바뀌어 주문 상태를 폴링한다.
- `/payment/result?h=` 결과 페이지: 로그인 없이 토큰으로 열고, 확인 중·완료·입금 안내·실패를
  `payment.status` 로 가른다.
- 결제 시작 409(재고 부족)를 해당 상품명과 함께 보여주고 장바구니로 보낸다.
- 주문 생성 400 의 `data.field` 를 전자발표 칸에 건다(1단계의 `applyServerFieldError`).

**비목표**
- LINE Pay(`paymentUrl`/`appUrl`). 라디오는 남기되 비활성 + "준비 중".
- 주문 상세 페이지, 결과 페이지의 "주문 상세" 버튼(3단계).
- 결제 중 주문서 입력 편집(이동한 뒤의 일).
- 입금 완료를 브라우저가 알아채기(PG 가 서버로만 알린다. 문서 05).

**실패 조건**
- 주문 생성이 두 번 나가 PENDING 주문이 둘 생긴다.
- 결제창에서 이탈해 돌아온 뒤 다시 누르면 새 주문이 또 생긴다(같은 입력이면 결제 시작만 다시).
- LINE 인앱 브라우저에서 ECPay 창이 그 안에서 열려 결제가 깨진다.
- 결과 페이지가 로그인을 요구한다.
- REQUESTED 가 영원히 "확인 중" 으로 남는다(1분 뒤 안내로 바뀌어야).

## 화면

### 주문서 — 결제하기 (03)

- 결제 수단 라디오: ECPAY 가 기본값. LINE_PAY 카드는 보이되 `disabled` + 설명 자리에 "준비 중"
  (기존 키 `coming_soon`). 옛 draft 가 `LINE_PAY` 를 복원해도 `ECPAY` 로 바꾼다.
  (제 판단 — 숨기면 "LINE Pay 는 없나" 로 읽히고, 켜 두면 500 을 본다.)
- `OrderSummary`(데스크톱)·`OrderBar`(모바일)의 버튼이 `onSubmit` 을 받고 `isSubmitting` 동안
  `disabled` + 문구 "처리 중…". "준비 중" 안내 문구(`coming_soon`)는 지운다.
- 버튼 활성 조건: `shipping.isValid && invoice.isSubmittable && !isSubmitting`.
  `invoice.isSubmittable` = 형식 통과 AND `check.status !== "invalid"` — 아직 blur 로 확인되지 않은
  값도 허용한다. 제출 핸들러가 확인을 끝내고 기다린다(아래). 이 완화는 1단계 리뷰어가 짚은
  "iOS 에서 비활성 버튼 탭은 blur 를 일으키지 않는다" 를 푸는 것이다.
- 제출 순서:
  1. `invoice.ensureChecked()` — 현재 값을 확정하고 확인 쿼리가 끝날 때까지 기다린다.
     결과가 `invalid` 면 중단(칸에 문구가 이미 떠 있다).
  2. 같은 입력의 PENDING 주문이 기억돼 있으면 주문 생성을 건너뛴다(아래 "주문 기억").
     아니면 `POST user/order` — body 는 `source` + `paymentMethod` + `submitShipping` + `submitInvoice`.
     - 400 에 `data.field` 가 `carrierNum`·`loveCode`·`companyTaxId` 면 `invoice.applyServerFieldError(field)` 후 중단.
     - 400 에 `data.field` 가 `storeToken`(매장 만료)이면 `shipping.cvs.expireStore()` — 기존 만료 카드
       ("매장 선택이 만료되었어요" + 다시 고르기)로 바뀌고 버튼이 닫힌다. `useOrderShipping` 이
       `expireStore` 를 내놓는다. 필드명이 다르면 400 의 `message` 에 토큰·매장 관련 단어가 있을 때
       같은 처리(빌더가 dev 응답으로 확인).
     - 그 밖 400·409·5xx 는 서버 `message` 를 토스트. 409(구매 불가 라인)는 미리보기도 다시 부른다.
  3. `POST user/order/{id}/payment`.
     - 409 에 `data.productVariantIds` → 재고 부족 안내(아래). 기억한 주문은 지운다.
     - 409 그 밖(결제 불가 상태 — 이미 결제됨·입금 대기 중) → 기억한 주문을 지우고 토스트. 다음 클릭은 새 주문.
     - 500 → 토스트("결제를 시작할 수 없어요. 다시 시도해 주세요"), 주문은 기억한 채로(재시도는 결제 시작만).
  4. `handoffUrl` 로 이동(아래 "결제창으로 보내기"). 이동 직전 `order:draft`(지도 왕복용)는 지운다.
- 재고 부족 안내: 결제 버튼 위(모바일은 금액 섹션 아래)에 빨간 박스 — "재고가 부족한 상품이 있어요 —
  {상품명 (옵션)}" + "수량을 바꾸거나 빼고 다시 결제해 주세요" + 링크. 상품명은
  `preview.brandGroups` 의 라인에서 `productVariantId` 로 찾고, 못 찾으면 상품명 없이 문구만.
  링크는 장바구니 주문(`?cart=`)이면 "장바구니로 가기", 바로 구매(`?buy=`)면 그 상품 페이지로
  (라인의 상품 id). (제 판단)
- 토스트는 기존 `sonner` (`useAppMutation` 의 `toastOnError` 는 끄고 핸들러가 직접 띄운다 —
  400 분기를 가려야 해서).

### 주문 기억 (중복 주문 방지)

`sessionStorage` `order:pending` = `{ sourceHref, bodyKey, orderId, orderNumber, totalAmount, resultToken?, savedAt }`.
`bodyKey` 는 주문 생성 body **와 미리보기 스냅샷**(라인별 `productVariantId:quantity` 목록 + `totalAmount`)을
`JSON.stringify` 한 값 — 장바구니 주문은 body 에 수량·금액이 없어, 결제창에서 이탈해 장바구니 수량을
고치고 돌아오면 같은 body 로 옛 금액의 주문을 다시 결제하게 된다(PENDING 주문은 서버 스냅샷). 제출 때
`sourceHref`·`bodyKey` 가 같고 24시간(서버가 PENDING 을 닫는 시간) 안이면 그 `orderId` 로 결제 시작만
부른다. 입력이나 미리보기가 바뀌면 새 주문. 결과 페이지가 `PAID`·`WAITING_DEPOSIT` 를 보면 지운다.
저장 실패는 조용히 넘긴다(중복 주문이 생길 뿐 — 서버가 24시간 뒤 취소).

### 결제창으로 보내기

`features/order/model/paymentWindow.ts`:
- `isLineInAppBrowser()`: `navigator.userAgent` 에 `Line/` 포함(LIFF 안도 이 UA 다).
- `isLiffClient()`: `isLineInAppBrowser()` 이고 LIFF 가 설정돼 있을 때만(`NEXT_PUBLIC_LINE_LIFF_ID`)
  SDK 를 초기화해 `liff.isInClient()` 를 본다. LINE 밖 사용자는 결제 경로에서 SDK 를 내려받지 않는다.
  초기화는 `features/login/lib/lineIdentity.ts` 의 `ensureLiff` 를 공통 유틸(`shared/lib/liff.ts`)로
  끌어올려 공유한다. 스토어가 LIFF 뷰로 열리는지는 확인되지 않았다 — 두 분기를 모두 두되 UA 로
  가려 비용을 없앤다. (제 판단)
- `openPaymentWindow(handoffUrl)`:
  - LIFF → `liff.openWindow({ url, external: true })`, 반환 `"external"`.
  - LINE 인앱(비 LIFF) → `navigateTo(url + openExternalBrowser=1)`(URL 객체로 쿼리 추가), 반환 `"external"`.
  - 그 밖 → `navigateTo(url)`, 반환 `"same-tab"`.
- `"external"` 이면 주문서가 대기 화면으로 바뀐다.

`handoffUrl` 은 30분 안에 한 번만 열린다. 대기 화면에서 "다시 열기" 는 두지 않는다 —
실패하면 결제 시작을 다시 부르는 "다시 결제하기" 버튼만 둔다(서버가 이전 시도를 닫는다).

### 대기 화면 (LINE 쪽, 03-④)

주문서 본문 전체를 대신한다: ↗ 아이콘, "외부 브라우저에서 결제 중", "결제를 마치면 이 화면이
자동으로 바뀝니다", 주문번호, "다시 결제하기" 버튼(결제 시작 재호출 → 다시 외부로).
`useUserOrderDetailQuery(orderId)` 를 4초 간격으로 폴링하다가:
- `status` 가 `PAID` 또는 `PAYMENT_WAITING` → `router.replace("/payment/result?h={resultToken}")`.
  `resultToken` 은 결제 시작 응답에 있다.
- `payment.paymentId` 가 이번 시도의 것이고 `payment.status` 가 `FAILED`·`CANCELED`·`EXPIRED` →
  같은 자리의 문구를 "결제되지 않았습니다 — 다시 결제할 수 있어요" 로 바꾼다. 버튼은 그대로
  "다시 결제하기". 주문은 PENDING 이라 폼으로 돌아가지 않는다(돌아가면 중복 주문을 부른다).
- "다시 결제하기" 가 409 면(이미 결제됨 — 폴링 지연) 토스트 없이 즉시 refetch 해 결과로 넘어간다.
폴링 상한 없음(사용자가 떠나면 끝).

### 결제 결과 (`/payment/result?h=`, 04·05)

라우트 `app/[locale]/payment/result/page.tsx`(noindex, Suspense) → `views/payment-result`.
로그인 불필요(`AuthOnly` 없음). `h` 는 nuqs. 없거나 404 → "결제 정보를 찾을 수 없어요 (7일 지남·잘못된 링크)".

`payment.status` 별:

| status | 화면 |
| --- | --- |
| `REQUESTED` · `READY` | 스피너 + "결제 확인 중… 잠시만 기다려 주세요". 폴링(훅이 3초). 1분 지나도 그대로면 "확인이 늦어지고 있어요. 잠시 뒤 주문 내역에서 확인해 주세요" 로 문구 교체(폴링은 계속). |
| `PAID` | ✓ "결제가 완료되었습니다", 주문번호, `method · NT$금액`. 로그인 상태면 장바구니 쿼리 무효화(서버가 비웠다). |
| `WAITING_DEPOSIT` | ⏱ "입금을 기다리고 있어요", 주문번호. `depositInfo.paymentType` 이 `ATM_` 으로 시작: 은행명(코드 매핑, 없으면 코드)·가상계좌·금액. `CVS_` 로 시작: 납부 코드(`paymentNo`) 크게. 입금 기한 `expireAt` 을 대만 시각(`Asia/Taipei`)으로 "YYYY/MM/DD HH:mm · 지나면 주문이 자동 취소됩니다". |
| `FAILED` · `CANCELED` · `EXPIRED` | "결제되지 않았습니다" + 사유 한 줄(CANCELED: 결제창에서 취소했어요 / EXPIRED: 결제 시간이 지났어요 / FAILED: 결제가 거절됐어요 — `failureCode` 가 있으면 작게 표기). "주문은 남아 있어요. 다시 결제할 수 있어요". |

버튼(모든 상태 공통, 아래쪽): "쇼핑 계속하기"(홈). 실패 상태면 "장바구니로 가기" 도 둔다(주문이
PENDING 이라 장바구니는 그대로다). "LINE 으로 돌아가기" 는 두지 않는다 — LIFF 의 Endpoint URL 이
로그인 화면이라 결제한 사용자를 엉뚱한 곳에 내려놓고, LINE 쪽 원래 탭은 이미 폴링으로 결과를
보여준다. 외부 브라우저 사용자에게는 완료 화면에 "LINE 으로 돌아가면 주문이 완료로 바뀌어 있어요"
한 줄을 둔다(LINE 밖에서도 거슬리지 않는 문구). "주문 상세" 는 3단계 뒤에 붙인다. (제 판단)

`PAID`·`WAITING_DEPOSIT` 를 보면 `order:pending` 과 `order:draft` 를 지운다(같은 탭이면 같은 저장소).

### 은행 코드

ECPay ATM 은행 코드 → 이름 매핑을 `features/payment/model/bankName.ts` 에 둔다(臺灣銀行 004 ·
土地銀行 005 · 中國信託 822 · 國泰世華 013 · 台北富邦 012 · 玉山 808 · 台新 812 · 中華郵政 700 ·
第一 007 · 華南 008 · 彰化 009 · 兆豐 017 · 永豐 807 · 元大 806 · 聯邦 803 · 遠東 805). 없으면 코드만.

## 서버 설정 의존

- PG 에서 프론트로 303 리다이렉트되려면 백엔드 `STOREFRONT_BASE_URL` 이 프론트 주소여야 한다.
  dev 는 `https://dev-seoulmoment.netlify.app` (returnUrl 허용 목록과 같은 값). 로컬은 서버가 그린
  결과 페이지가 대신 뜨고 URL 에 `h` 가 있으니 `http://localhost:3000/ko/payment/result?h=…` 로
  직접 열어 확인한다.
- dev ECPay 는 공용 테스트 상점이라 실제 결제 없이 성공·ATM 발급을 시험할 수 있다.

## i18n

새 키는 `payment_` 접두. 결제 중, 외부 브라우저 안내, 재고 부족, 결과 페이지 상태 문구·사유·
버튼, 입금 안내 라벨(가상계좌·납부 코드·입금 기한), 은행명은 중문 고정. 시트 반영은 마지막 Task.

## 테스트

- `paymentWindow`: LIFF → openWindow external, LINE UA → `?openExternalBrowser=1`, 그 밖 → 같은 탭.
- `pendingOrder`: 같은 body 면 재사용, 다른 body·24시간·다른 source 면 새로, 삭제.
- `useOrderSubmit`(제출 훅): ensureChecked invalid 면 중단·호출 없음; 생성→시작→이동 순서;
  연타 시 생성 1회; 400 field → applyServerFieldError; 시작 409 재고 → 안내 + 기억 삭제;
  시작 500 → 주문 기억 유지, 재클릭은 시작만; external 이면 대기 상태.
- `useOrderInvoice.ensureChecked`: 확정 없이 바로 부르면 쿼리 1회 뒤 결과 반환.
- 결과 페이지: 상태 5종 렌더, 404, 1분 경과 문구, ATM/CVS 입금 안내, 대만 시각 변환, LINE 버튼 조건.
- `OrderPaymentSection`: LINE_PAY 비활성, 기본 ECPAY.

## 알려진 사실

- `usePaymentResultQuery` 는 `REQUESTED` 에서만 폴링한다. `READY` 도 폴링하도록 고친다.
- ky 에러 본문 유틸(`readErrorInfo`)은 `data` 를 내놓지 않는다. `data?: { field?; productVariantIds? }` 를
  읽도록 넓힌다.
- 백엔드가 리다이렉트하는 `/payment/result?h=` 에는 locale 이 없다. `proxy.ts` 가 Accept-Language 로
  `/{locale}` 을 붙이며 쿼리를 보존하므로 `h` 는 살아남는다.

## 빌더에게 맡기는 것

- 제출 훅의 파일 분할(`useOrderSubmit` 하나에 둘지, 주문 기억·결제창 분기를 모듈로 뺄지 — 위 이름은 제안).
- `ensureChecked` 의 구현 방식(`queryClient.fetchQuery` 로 같은 키를 기다리는 것을 권장).
- 대기 화면·결과 페이지의 아이콘(lucide)과 여백.
- 1분 타이머 구현(`useEffect` + `setTimeout`).
