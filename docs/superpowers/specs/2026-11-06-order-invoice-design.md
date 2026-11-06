# 주문서 전자발표(電子發票) 섹션 설계

날짜: 2026-11-06 · 대상: `apps/web` 주문서(`/order`) · 상태: 승인됨

결제 연동 3단계 중 1단계. 2단계(결제하기 → PG → 결과 페이지)와 3단계(주문 상세)는 별도 스펙.

## 의도와 이유

대만은 모든 거래에 전자발표(電子發票, 전자 영수증)를 발행해야 하고, 받는 방법을 구매자가 고른다.
서버는 주문 생성(`POST user/order`)의 `invoice` 로 그 선택을 받아 결제 확정 뒤 자동 발행한다.
지금 주문서에는 이 입력이 없어 모든 주문이 기본값(회원 이메일 載具)으로만 발행된다.
구매자가 다섯 가지 방법 중 고를 수 있게 주문서에 섹션을 추가한다.

근거 문서: 백엔드가 준 `payment-ui-api-map.html` 의 02 "주문서 — 전자발표" 카드.
API 함수(`shared/services/userInvoice.ts`)와 훅(`entities/invoice`)은 이미 있다. 이번에 만드는 것은
주문서 UI·폼 모델·draft 저장이다.

## 목표 / 비목표 / 실패 조건

**목표**
- 주문서에서 발표 받는 방법 5종 중 하나를 고르고, 타입별 값을 입력한다.
- 입력을 마쳤을 때(blur) 서버 확인 API 로 검증하고 결과를 칸 아래 보여준다.
- 결제하기 버튼은 고른 타입의 값이 유효할 때만 눌린다(배송지 유효성과 AND).
- 편의점 지도 왕복 draft 에 발표 입력을 함께 저장·복원한다.
- 주문 생성 body 의 `invoice` 를 만드는 값(`submitInvoice`)을 모델이 내놓는다. 실제 호출은 2단계.

**비목표**
- 결제하기 버튼의 동작(주문 생성·결제 시작). 2단계.
- 주문 상세의 발표 번호 표시. 3단계.
- 마지막 선택을 다음 주문까지 기억하기(localStorage). 서버가 회원 기본값을 두지 않는 한 하지 않는다.
- 統一編號 검사코드(체크섬) 로컬 계산. 서버 확인 API 가 한다.

**실패 조건(기술적으로 동작해도 실패)**
- 키 입력마다 확인 API 가 나간다.
- 재정부 장애(`valid: true, verified: false`)에서 주문이 막힌다.
- 지도에 다녀오면 발표 입력이 사라진다.
- 기본값(會員載具)만 두고 결제하는 사용자에게 추가 입력이나 문구가 늘어난다.

## 화면

주문서 본문에서 **배송지 섹션과 결제 수단 섹션 사이**에 `OrderSection` 하나를 추가한다
(백엔드 문서의 01 → 02 → 03 순서). 제목은 "電子發票", 제목 옆 보조 문구 "결제 후 자동 발행".

섹션 안은 `OrderPaymentSection` 과 같은 세로 라디오 카드 5개다. 고른 카드 **바로 아래**에 그 타입의
입력칸이 펼쳐진다(다른 카드 아래는 비어 있다). 라디오 라벨은 중문 용어를 그대로 쓰고 괄호나
보조 문구로 뜻을 붙인다 — 대만 사용자는 이 용어로 안다.

| 타입 | 라벨(ko 기준) | 펼쳐지는 칸 | blur 확인 |
| --- | --- | --- | --- |
| `MEMBER_CARRIER` (기본) | 會員載具 · 회원 이메일로 받기 | 없음. 안내 한 줄 "따로 고르지 않으면 회원 이메일로 발행됩니다" | 없음 |
| `MOBILE_BARCODE` | 手機條碼 | `carrierNum` 1칸, placeholder `/ABC1234` | 바코드 확인 API |
| `CITIZEN_CERT` | 自然人憑證 | `carrierNum` 1칸, placeholder `AB12345678901234` | 없음(형식만) |
| `DONATION` | 捐贈發票 · 기부 | `loveCode` 1칸, placeholder `168001` | 愛心碼 확인 API → 기부처 이름 표시 |
| `COMPANY` | 公司 · 統一編號 | `companyTaxId` 1칸 + `companyName` 1칸 | 統一編號 확인 API → 회사명 자동 채움(수정 가능) |

칸 아래 상태 문구(한 줄, `FieldError` 자리에):
- 형식 오류: 타입별 형식 안내(빨강).
- 확인 중: "확인 중…"(회색).
- `valid: false`: "등록되지 않은 값" 계열 문구(빨강). 결제 막힘.
- `valid: true, verified: true`: "✓ 확인되었어요"(초록). 愛心碼는 대신 기부처 이름, 統一編號는 회사명 칸을 채운다.
- `valid: true, verified: false`: "지금은 확인이 어려워 형식만 검사했어요. 그대로 주문할 수 있어요"(회색). 결제 허용.
- 확인 API 가 네트워크·4xx·5xx 로 실패: `verified: false` 와 같은 문구, 결제 허용. 주문 생성이 다시 검사한다.
  (없는 愛心碼·統一編號는 4xx 가 아니라 200 `valid: false` 로 온다.)

모바일(`max-sm`)에서도 같은 세로 구조다. 입력칸은 배송지와 같은 `INPUT_CLASS`.

## 입력 규칙 (프론트 형식 검사)

서버 규칙을 그대로 옮긴다. 형식이 맞을 때만 확인 API 를 켠다(`enabled`).

| 값 | 정규화 | 형식 |
| --- | --- | --- |
| `carrierNum` (手機條碼) | trim, 대문자화 | `/^\/[A-Z0-9+\-.]{7}$/` |
| `carrierNum` (自然人憑證) | trim, 대문자화 | `/^[A-Z]{2}\d{14}$/` |
| `loveCode` | trim, 숫자만 | `/^\d{3,7}$/` |
| `companyTaxId` | trim, 숫자만 | `/^\d{8}$/` |
| `companyName` | trim | 선택, 60자 이하. 서버가 요구하지 않으므로(공개 데이터에 없는 회사도 있다) 비워도 결제된다 (제 판단) |

모델은 zod discriminated union(`type` 기준) 하나로 두고, react-hook-form 한 인스턴스가 `type` 과
모든 칸을 같이 들고 있는다. 타입을 바꿔도 다른 타입의 입력값은 지우지 않는다 — 실수로 바꿨다
돌아오는 경우가 흔하다. 검증·제출은 현재 `type` 의 칸만 본다.

폼 값은 타입마다 칸을 따로 둔다: `{ type, mobileBarcode, citizenCert, loveCode, companyTaxId,
companyName }`. API 의 `carrierNum` 은 手機條碼·自然人憑證이 공유하지만 폼에서 한 칸을 같이 쓰면
타입을 바꿀 때 서로 덮어써 "다른 타입의 값은 지우지 않는다" 가 깨진다. 제출 때 현재 타입의 칸을
`carrierNum` 으로 옮긴다 (제 판단).

## 확인 API 호출 규칙

- `entities/invoice` 의 `useUserInvoice*CheckQuery(value, { enabled })` 를 그대로 쓴다.
  키는 값 자체라 같은 값은 1시간 캐시되고 재호출되지 않는다.
- 호출 시점은 **blur** 다. 입력 중에는 로컬 형식 검사만 돈다. 구현은 "blur 때 확정된 값"을
  별도 상태(`checkedValue`)로 들고 그 값으로 쿼리를 켜는 방식(제 판단 — 키 입력마다 키가 바뀌어
  쿼리가 나가는 것을 막는 가장 단순한 길).
- 제출 직전에도 같은 값이면 다시 부르지 않는다(캐시). blur 없이 바로 결제를 누르면
  `checkedValue` 를 현재 값으로 맞춰 한 번 부르고 결과를 기다린다 — 이 "기다림"은 2단계가
  결제 버튼을 붙일 때 `isInvoiceChecking` 으로 막는다. 1단계에서는 `isValid` 가 확인 중일 때
  false 다.
- 자동 채움: 統一編號 확인 결과 `name` 이 오면 회사명 칸이 **비어 있을 때만** 채운다.
  사용자가 이미 적은 값은 덮지 않는다.

## 유효성과 제출값

`useOrderInvoice()` (새 훅, `features/order/model/useOrderInvoice.ts`)가 내놓는 것:

- `form` (react-hook-form), `type`, `setType`
- `check`: 현재 타입의 확인 상태 `{ status: "idle" | "checking" | "valid" | "invalid" | "unverified", name?: string }`
- `isValid`: 형식 통과 AND `check.status !== "invalid" && check.status !== "checking"`.
  `MEMBER_CARRIER` 와 `CITIZEN_CERT` 는 형식만.
- `submitInvoice: UserOrderInvoice | undefined`: `MEMBER_CARRIER` 면 `undefined`(서버 기본값이라
  body 에서 뺀다), 그 밖에는 정규화된 값으로 만든 유니온 멤버. `COMPANY` 의 `companyName` 은
  비어 있으면 빼고 보낸다.
- `applyServerFieldError(field)`: 주문 생성 400 의 `data.field`(`carrierNum` · `loveCode` ·
  `companyTaxId`)를 받아 그 칸에 `setError` 를 건다. 2단계가 부른다. 이번에는 함수와 테스트만.

`OrderPage` 의 `canSubmit` 은 `shipping.isValid && invoice.isValid` 가 된다.

## draft (지도 왕복)

`OrderDraft` 에 `invoice: { type, mobileBarcode, citizenCert, loveCode, companyTaxId, companyName }` 를
더한다(폼 값과 같은 모양).
`leaveForMap` 이 저장하고 `restoreDraft` 가 복원한다. 복원 뒤 확인 API 는 캐시가 있으면 즉시,
없으면 복원된 값으로 한 번 부른다(blur 와 같은 경로: `checkedValue` 를 복원값으로 둔다).

기존 draft(발표 없음)는 `invoice` 가 없을 수 있다 — 없으면 `MEMBER_CARRIER` 로 둔다.

## i18n

새 키는 `language-pack` 시트에 넣고 sync 한다. 키 이름은 `invoice_` 접두. 정확한 문구는 계획에서
정하고 시트 반영은 마지막 Task 로 둔다(지난 작업과 같은 절차).

- **용어 라벨**(電子發票 · 會員載具 · 手機條碼 · 自然人憑證 · 捐贈發票 · 公司/統一編號 · 愛心碼 · 公司名稱)은
  세 언어 모두 중문을 그대로 쓰고, ko/en 에만 괄호로 짧은 뜻을 붙인다. 예: ko "手機條碼 (휴대폰 바코드)",
  en "手機條碼 (mobile barcode)", zh-TW "手機條碼". 대만 제도의 고유 명칭이라 번역하면 오히려 못 알아본다. (2026-11-06 합의)
  단, **섹션 제목**은 번역어를 앞에 둔다: ko "전자 영수증 (電子發票)", en "E-invoice (電子發票)", zh-TW "電子發票".
  섹션 제목은 이 화면이 무엇인지 알리는 자리라 중문만 있으면 번역이 빠진 것처럼 보인다. (2026-11-06 사용자 요청)
- **안내·오류 문구**(결제 후 자동 발행, 기본값 안내, 타입별 형식 오류, 미등록, 확인 중, 확인됨, 미확인 안내,
  회사명 길이 초과)는 세 언어 모두 번역한다. zh-TW 는 추후 현지 검수 대상.
- 상태: 승인됨(2026-11-06).

## 테스트

- `schema`: 타입별 정규화·형식 검사, discriminated union parse.
- `useOrderInvoice`: blur 전에는 쿼리가 안 나감, blur 뒤 한 번, 같은 값 재blur 는 재호출 없음,
  `valid:false` 면 `isValid` false, `verified:false` 면 true, API 에러면 true, 회사명 자동 채움은
  빈 칸일 때만, `submitInvoice` 타입별 결과, `applyServerFieldError` 가 칸에 에러를 건다.
- `OrderInvoiceSection` 렌더: 라디오 5개, 고른 것 아래만 칸이 펼쳐짐, 상태 문구 분기.
- `orderDraft`: `invoice` 저장·복원, 없는 옛 draft 는 기본값.
- 기존 `useOrderShipping` 테스트는 `leaveForMap` 저장값에 `invoice` 가 들어가는지 한 건 추가.

## 빌더에게 맡기는 것

- 라디오 카드 안에서 펼쳐지는 칸의 여백·애니메이션(없어도 됨).
- `useOrderInvoice` 를 `useOrderShipping` 과 어떻게 묶을지(별도 훅으로 두고 `OrderPage` 가
  둘을 합치는 쪽을 권장).
- 확인 중 표시를 스피너로 할지 문구로 할지.
- 상태 문구의 정확한 색 토큰(`text-danger` · `text-neutral` · 성공색은 프로젝트 토큰 중 택).
- 섹션 제목 옆 보조 문구를 `OrderSection` 에 어떤 prop 으로 넣을지(`badge` 는 개수용 스타일이라 다른 prop).
- `useOrderInvoice` 와 `useOrderShipping` 의 draft 연결 방식(저장 때 값 getter, 복원 때 콜백을 넘기는 식).

## 알려진 사실

- 지도 왕복 뒤에는 페이지가 새로 뜨므로 TanStack 캐시가 비어 있다. 복원 때 확인 호출이 한 번 나가는 것은 의도된 동작.
- dev 스웨거의 `POST user/order` 400 스키마에는 `data.field` 가 아직 없다. 백엔드 문서가 약속한 값이라
  `applyServerFieldError` 는 그 이름으로 만들고, 실제 연결(2단계)에서 응답을 다시 확인한다.
