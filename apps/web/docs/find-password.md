# 비밀번호 찾기 페이지 (`/find-password`)

비밀번호 찾기 2단계 흐름 (계정 입력 → 6자리 OTP 인증) 구현 문서. login·signup과 동일한 외곽 레이아웃을 공유한다.

- 라우트: `apps/web/src/app/[locale]/find-password/page.tsx` → `/[locale]/find-password`
- 인증 흐름 내 위치: [Login](./login.md) → **Find Password** → (TODO: 새 비밀번호 설정)
- 관련 PR: `feat(web): add find-password page with verification step` (`a4e2848`)

## 파일 구조

```
apps/web/src/
├── app/[locale]/find-password/page.tsx       # 라우트 진입점 (5줄 pass-through)
├── views/find-password/
│   ├── index.tsx                             # barrel
│   └── ui/FindPasswordPage.tsx               # "use client", step state 관리 + 폼 교체
└── features/find-password/
    ├── index.tsx                             # 3개 default export 묶음
    ├── model/schema.ts                       # zod requestSchema, 상수
    └── ui/
        ├── FindPasswordHeader.tsx            # step prop 분기 헤더
        ├── RequestCodeForm.tsx               # step 1, 계정 입력 + 마스킹
        └── VerifyCodeForm.tsx                # step 2, 6칸 OTP + 28초 타이머
```

## 컴포넌트 책임

| 컴포넌트 | 책임 | 주요 props / 콜백 | 의존성 |
| --- | --- | --- | --- |
| `FindPasswordPage` | step state(`"request" \| "verify"`)와 마스킹 계정 보관, 헤더+폼 합성 | (none) | `VStack`, `useState` |
| `FindPasswordHeader` | step별 제목/설명 분기 | `step: Step`, `maskedAccount?: string` | `VStack` |
| `RequestCodeForm` | 휴대폰/이메일 입력 + zod 검증 + 송출 시 마스킹해 콜백 | `onSent(maskedAccount: string): void` | `react-hook-form`, `zod`, `Input`, `VStack` |
| `VerifyCodeForm` | 6칸 OTP + 자동 focus + 28초 카운트다운 + 재발송 | (none, 자체 상태) | `useState`, `useRef`, `useEffect`, `Flex`, `Button` |

## 상태 / 데이터 흐름

`FindPasswordPage`가 두 개의 useState로 흐름을 잡는다.

```tsx
const [step, setStep] = useState<"request" | "verify">("request");
const [maskedAccount, setMaskedAccount] = useState<string | undefined>();

const handleSent = (masked: string) => {
  setMaskedAccount(masked);
  setStep("verify");
};
```

전체 시퀀스:

```
User → RequestCodeForm
  Input "01012345678" 입력 → "送出" 클릭
RequestCodeForm
  zodResolver(requestSchema) 통과 → maskAccount("01012345678") = "0101****5678"
RequestCodeForm.onSent("0101****5678")
  ↓
FindPasswordPage.handleSent
  setMaskedAccount("0101****5678")
  setStep("verify")
  ↓
FindPasswordHeader (step="verify", maskedAccount="0101****5678")
  → "인증코드 입력" + "인증코드를 회원님의..." + "0101****5678"
VerifyCodeForm (자체 상태)
  6칸 OTP 입력 → 자동 focus 다음 칸
  28초 카운트다운 → 0이 되면 "재발송" 활성화
  6칸 채워지면 "확인" 활성화 (현재 onSubmit은 TODO)
```

## OTP 입력 동작 명세

`VerifyCodeForm`은 6개 native `<input>`을 `Flex gap={10}`로 정렬하고 다음 동작을 구현한다.

| 동작 | 트리거 | 처리 |
| --- | --- | --- |
| 한 자 입력 | `onChange` | `value.replace(/\D/g, "").slice(-1)`로 숫자 한 자만 추출, 다음 칸으로 `focusInput(index + 1)` |
| 빈 칸에서 Backspace | `onKeyDown` | `code[index]`가 빈 문자열이면 `focusInput(index - 1)` |
| 클립보드 paste | `onPaste` | `e.preventDefault()` 후 숫자만 6자 추출해 6칸에 분배, 마지막 채워진 칸으로 focus |
| 재발송 클릭 | 카운트다운 0 | `setCode(EMPTY_CODE)`, `setSeconds(28)`, `focusInput(0)` |
| 확인 활성화 | `code.every((c) => c.length === 1)` | `disabled={!isValid}` |

## 상수

`features/find-password/model/schema.ts`에 정의된다.

```ts
export const VERIFY_CODE_LENGTH = 6;          // OTP 자리 수
export const RESEND_INITIAL_SECONDS = 28;     // 재발송 카운트다운 초기값
```

`VerifyCodeForm` 내부 상수:

```ts
const EMPTY_CODE = Array<string>(VERIFY_CODE_LENGTH).fill("");
const SLOT_IDS = ["a", "b", "c", "d", "e", "f"] as const;
//   ESLint react/no-array-index-key 회피용 안정 키 (6칸 고정 가정)
```

## 마스킹 규칙 (`maskAccount`)

`RequestCodeForm.tsx` 내부 모듈-스코프 헬퍼. 호출 직전에 view로 전달할 표시용 문자열을 생성.

| 입력 | 출력 | 규칙 |
| --- | --- | --- |
| `"01012345678"` | `"0101****5678"` | 숫자 8자 이상이면 앞 4 + `****` + 뒤 4 |
| `"test@example.com"` | `"te**@example.com"` | `@` 포함 시 local part 앞 2자 노출 + 나머지 `*` |
| `"abc"` | `"abc"` | 8자 미만 숫자, `@` 없음 → 원문 |

## 사용 예제

### 라우트 → view → step 분기

```tsx
// apps/web/src/app/[locale]/find-password/page.tsx
import { FindPasswordPage } from "@/views/find-password";

export default function FindPassword() {
  return <FindPasswordPage />;
}
```

```tsx
// apps/web/src/views/find-password/ui/FindPasswordPage.tsx
"use client";

import { useState } from "react";

import {
  FindPasswordHeader,
  RequestCodeForm,
  VerifyCodeForm,
} from "@features/find-password";
import { VStack } from "@seoul-moment/ui";

type Step = "request" | "verify";

export function FindPasswordPage() {
  const [step, setStep] = useState<Step>("request");
  const [maskedAccount, setMaskedAccount] = useState<string | undefined>();

  const handleSent = (masked: string) => {
    setMaskedAccount(masked);
    setStep("verify");
  };

  return (
    <VStack className="w-full px-4 pb-[122px] pt-[136px] max-md:pb-[90px] max-md:pt-[136px]">
      <VStack className="w-full max-w-[414px]">
        <FindPasswordHeader maskedAccount={maskedAccount} step={step} />
        {step === "request" ? (
          <RequestCodeForm onSent={handleSent} />
        ) : (
          <VerifyCodeForm />
        )}
      </VStack>
    </VStack>
  );
}
```

### features barrel

```ts
import {
  FindPasswordHeader,
  RequestCodeForm,
  VerifyCodeForm,
} from "@features/find-password";
```

## 레이아웃 패턴 (login·signup 공유)

```
외곽 VStack: w-full px-4 pb-[122px] pt-[136px] max-md:pt-[136px]   ← find-password는 max-md:pt도 136px 유지
                                                                       (login/signup은 max-md:pt-[106px])
내부 VStack: w-full max-w-[414px]
```

> find-password는 `max-md:pt-[136px]` (mobile에서도 데스크톱과 동일한 위 여백)를 사용한다. 헤더 높이가 짧아 모바일에서도 위쪽 공백을 충분히 확보하기 위함. 다른 인증 페이지와 의도적으로 다른 값.

## 인증 라우트 간 연결

| 출발 | 컴포넌트·요소 | 목적지 | 처리 |
| --- | --- | --- | --- |
| `/login` | `LoginForm`의 "忘記密碼" `Link` | `/find-password` | 비밀번호 찾기 진입 |
| `/find-password` (verify 후) | `VerifyCodeForm` 확인 버튼 | (TODO) `/find-password/reset` 또는 step 3 | API 연동 시 결정 |
| `/find-password` (verify 후) | (TODO) "로그인으로 돌아가기" | `/login` | 비밀번호 재설정 완료 후 자동 이동 검토 |

## 알려진 제약 / TODO

- **API 3개 미연동**:
  1. `RequestCodeForm.onSubmit` — 인증코드 발송 요청
  2. `VerifyCodeForm.handleSubmit` — 인증코드 검증
  3. `VerifyCodeForm.handleResend` — 인증코드 재발송
- **새로고침 시 step 손실** — `useState` 기반이라 `/find-password` 새로고침 시 항상 step 1로 복귀. URL에 step 보존이 요구되면 nuqs로 마이그레이션
- **Step 3 미구현** — 인증 성공 후 새 비밀번호 설정 화면이 Figma에는 없음. backend 스펙 확정 시 추가
- **Resend의 step 1 복귀 미지원** — "다른 계정으로 다시 시도하기" 같은 동선 없음. 현재 `재발송`은 같은 계정에 OTP만 재요청
- **i18n 미적용** — login·signup과 동일하게 인라인 한국어/번체중국어. 일괄 정비 작업으로 분리

## 설계 결정 (ADR)

| 결정 | 대안 | 채택 이유 | 영향 / 향후 |
| --- | --- | --- | --- |
| **Step 관리에 `useState` 채택** | `nuqs` `?step=verify` URL 상태 / `/find-password/verify` 별도 라우트 | 새로고침/뒤로가기로 step 보존이 요구사항이 아니고, 마스킹된 account를 URL에 노출하지 않는 편이 안전. View 내부에서 단일 책임으로 묶임 | deep link 요구가 생기면 nuqs로 전환 (state 그대로 유지하기 쉬움) |
| **OTP를 6개 분리 input으로** | 단일 hidden input + 6개 표시 박스 / 외부 OTP 라이브러리 | 의존성 추가 없이 ~50줄 내 구현 가능. paste/Backspace/auto-focus가 native input 동작과 자연스럽게 결합. Figma 디자인과 1:1 매핑 | 4자리·8자리 OTP가 필요해지면 `VERIFY_CODE_LENGTH` 상수만 변경 + `SLOT_IDS` 일반화 |
| **`VerifyCodeForm`은 react-hook-form 미사용** | `RequestCodeForm`처럼 `useForm` + zod 도입 | 6칸 array 동기화 + ref 관리가 `register()`와 충돌이 잦고, validation은 단순(`every(c => c.length === 1)`)이라 useState 직관성이 더 큼 | RequestCodeForm은 zod 스키마 일관성 유지 위해 react-hook-form 사용 |
| **`maskAccount()`를 RequestCodeForm 내부 모듈-스코프** | `features/find-password/lib/maskAccount.ts` 분리 | 호출처가 단 한 곳, 17줄짜리 순수 함수라 위치 비용 < 이동 비용 | 두 번째 호출처가 생기면 `lib/`로 승격 |
| **`SLOT_IDS = ["a", ..., "f"] as const`** | `code.map((_, i) => key={i})` | ESLint `react/no-array-index-key` 만족하면서 6칸 고정 가정을 명시적으로 표현. 가독성도 양호 | 가변 길이 OTP가 필요해지면 `Array.from({length: N}, (_, i) => i.toString())`로 일반화 |
| **API 미연동을 본 PR에서 함께 처리하지 않음** | service 함수 + `useAppMutation` 훅까지 일괄 작업 | login/signup도 동일하게 미연동 상태이며 backend 스펙 미확정. UI 검토를 한 번에 받고, 인증 흐름 전체의 API 연동을 후속 PR로 묶는 편이 리뷰 비용이 낮음 | TODO 주석으로 진입점 표시. 후속 PR에서 `services/auth/findPassword.ts` 등 신설 |
| **외곽 padding을 login과 살짝 다르게** (`max-md:pt-[136px]` vs login의 `max-md:pt-[106px]`) | login과 동일하게 통일 | find-password는 헤더가 2줄로 짧아 모바일에서도 데스크톱과 동일한 위 여백이 필요. Figma 디자인 기준에 충실 | 외곽 레이아웃 위젯화 시 props로 padding 토큰을 받도록 일반화 |

## 참고

- 외곽 레이아웃 컨벤션 공유: [Login 문서 - 레이아웃 패턴](./login.md#레이아웃-패턴-signupfind-password-공유)
- 비밀번호 찾기 진입 동선: [Login 문서 - 인증 라우트 간 연결](./login.md#인증-라우트-간-연결)
- 본 페이지 구현 계획서: `~/.claude/plans/reflective-spinning-pike.md` (작성 시점 스냅샷, 저장소 외부)
- FSD 전반 규칙: `apps/web/.claude/CLAUDE.md`
