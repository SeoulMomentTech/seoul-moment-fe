# 회원가입 페이지 (`/signup`)

`apps/web`의 회원가입 화면 구현 문서. login·find-password와 동일한 외곽 레이아웃 컨벤션을 공유하며, 비밀번호 5개 규칙을 zod로 검증하고 실시간 체크리스트로 노출한다.

- 라우트: `apps/web/src/app/[locale]/signup/page.tsx` → `/[locale]/signup`
- 인증 흐름 내 위치: [Login](./login.md) ↔ **Signup**
- 관련 PR: `feat(web): add signup page UI with password validation` (`e200333`)

## 파일 구조

```
apps/web/src/
├── app/[locale]/signup/page.tsx              # 라우트 진입점 (5줄 pass-through)
├── views/signup/
│   ├── index.tsx                             # barrel
│   └── ui/SignupPage.tsx                     # "use client", 외곽 레이아웃 + 4개 섹션 합성
└── features/signup/
    ├── index.tsx                             # 4개 default export 묶음
    ├── model/
    │   ├── schema.ts                         # PASSWORD_RULES, signupSchema, signupFormResolver
    │   └── usePasswordRules.ts               # 입력값에 대한 5개 규칙 통과 여부 계산 훅
    └── ui/
        ├── SignupHeader.tsx                  # 타이틀 "立即註冊"
        ├── SignupForm.tsx                    # 계정 input + PasswordField × 2 + 立即註冊 버튼 (react-hook-form + zod)
        ├── PasswordField.tsx                 # 패스워드 input + 표시 토글 + 조건부 PasswordChecklist
        ├── PasswordChecklist.tsx             # 5개 규칙 통과 상태 시각화
        ├── SignupTerms.tsx                   # 약관 안내 + 회원약관 버튼
        └── LoginPrompt.tsx                   # 로그인 안내 + /login 링크
```

> `PasswordField`와 `PasswordChecklist`는 `features/signup/index.tsx` barrel에 노출되지 **않는다**. SignupForm 내부 구현 디테일이며 외부에서 직접 import할 일이 없다.

## 컴포넌트 책임

| 컴포넌트 | 책임 | 주요 props / 콜백 | 의존성 |
| --- | --- | --- | --- |
| `SignupPage` | 외곽 레이아웃 + 4개 섹션 수직 합성 | (none) | `VStack` |
| `SignupHeader` | 타이틀 "立即註冊" 노출 | (none) | `VStack` |
| `SignupForm` | account + password + passwordConfirm 입력 + 일치/규칙 검증 + 立即註冊 button | (none, 자체 form 상태) | `react-hook-form`, `zod`, `Input`, `VStack` |
| `PasswordField` | 패스워드 input(`type` 토글) + 조건부 `PasswordChecklist` | `value: string`, `showChecklist?: boolean`, 그 외 native input props | `useState`, `Eye`/`EyeOff` from `lucide-react`, `Input` |
| `PasswordChecklist` | 5개 규칙 항목별 통과 여부 시각화 (Check 아이콘 색상 변화) | `value: string` | `usePasswordRules`, `Check` from `lucide-react`, `VStack`, `HStack` |
| `SignupTerms` | 약관 안내 + 회원약관 버튼 | (none) | `VStack` |
| `LoginPrompt` | "已經擁有 ... 帳號嗎？" + `Link href="/login"` | (none) | `Link` from `@/i18n/navigation` |

## 비밀번호 검증 모델

### `PASSWORD_RULES` (`model/schema.ts`)

5개 규칙을 동일한 시그니처(`(value: string) => boolean`)로 모은 객체. zod refine과 `usePasswordRules`가 동일 객체를 공유해 단일 출처 보장.

```ts
export const PASSWORD_RULES = {
  minLength: (value: string) => value.length >= 8,
  hasUpper: (value: string) => /[A-Z]/.test(value),
  hasLower: (value: string) => /[a-z]/.test(value),
  hasNumber: (value: string) => /\d/.test(value),
  hasSpecial: (value: string) => /[~#@$%&!*_?\-<>]/.test(value),
} as const;
```

### `signupSchema` (`model/schema.ts`)

```ts
const passwordSchema = z
  .string()
  .refine(PASSWORD_RULES.minLength)
  .refine(PASSWORD_RULES.hasUpper)
  .refine(PASSWORD_RULES.hasLower)
  .refine(PASSWORD_RULES.hasNumber)
  .refine(PASSWORD_RULES.hasSpecial);

export const signupSchema = z
  .object({
    account: z.string().min(1),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
  });

export const signupFormResolver = zodResolver(signupSchema);
```

### `usePasswordRules` (`model/usePasswordRules.ts`)

`useMemo`로 5개 규칙의 통과 여부를 한 번에 계산. PasswordChecklist에서 시각화에 사용.

```ts
export function usePasswordRules(value: string): PasswordRuleStatus {
  return useMemo(
    () => ({
      minLength: PASSWORD_RULES.minLength(value),
      hasUpper: PASSWORD_RULES.hasUpper(value),
      hasLower: PASSWORD_RULES.hasLower(value),
      hasNumber: PASSWORD_RULES.hasNumber(value),
      hasSpecial: PASSWORD_RULES.hasSpecial(value),
    }),
    [value],
  );
}
```

## PasswordChecklist 표시 항목

`PasswordChecklist.tsx`의 `RULE_ORDER` 상수 순서대로 노출 (한국어 라벨).

| key | 라벨 | 통과 조건 |
| --- | --- | --- |
| `minLength` | 최소 8자 | 8자 이상 |
| `hasUpper` | 적어도 하나의 대문자 영어 단어 | `/[A-Z]/` 매칭 |
| `hasLower` | 적어도 하나의 소문자 영어 단어 | `/[a-z]/` 매칭 |
| `hasNumber` | 적어도 하나의 숫자 | `/\d/` 매칭 |
| `hasSpecial` | 특수 문자 하나 이상 포함 : ~#@$%&!*_?-<>등 | `/[~#@$%&!*_?\-<>]/` 매칭 |

각 항목은 `Check` 아이콘으로 표시되며, 통과 시 `text-foreground`, 미통과 시 `text-black/40`으로 색이 바뀐다.

## 폼 데이터 흐름

```
User → SignupForm
  account / password / passwordConfirm 입력
SignupForm
  useForm({ resolver: signupFormResolver, mode: "onChange" })
  watch("password") / watch("passwordConfirm") 로 매 입력마다 동기화
PasswordField (password 필드용)
  showChecklist={password.length > 0}  ← 입력 시작 시점부터 체크리스트 노출
  PasswordChecklist value={password}
    usePasswordRules(password) → 5개 규칙 통과 상태
PasswordField (passwordConfirm 필드용)
  showChecklist 미전달 → 체크리스트 미노출 (확인 필드는 일치만 검증)
SignupForm 버튼
  disabled={!isValid}    ← form 전체 valid (5개 규칙 + 일치 + account 비어있지 않음) 시 활성화
```

## 사용 예제

### 라우트 → view → features

```tsx
// apps/web/src/app/[locale]/signup/page.tsx
import { SignupPage } from "@/views/signup";

export default function Signup() {
  return <SignupPage />;
}
```

```tsx
// apps/web/src/views/signup/ui/SignupPage.tsx
"use client";

import {
  LoginPrompt,
  SignupForm,
  SignupHeader,
  SignupTerms,
} from "@features/signup";
import { VStack } from "@seoul-moment/ui";

export function SignupPage() {
  return (
    <VStack className="w-full px-4 pb-[122px] pt-[136px] max-md:pb-[50px] max-md:pt-[106px]">
      <VStack className="w-full max-w-[414px]">
        <SignupHeader />
        <SignupForm />
        <SignupTerms />
        <LoginPrompt />
      </VStack>
    </VStack>
  );
}
```

### react-hook-form 통합 패턴

```tsx
// SignupForm.tsx (요약)
const {
  register,
  handleSubmit,
  watch,
  formState: { isValid },
} = useForm<SignupFormValues>({
  resolver: signupFormResolver,
  mode: "onChange",
  defaultValues: { account: "", password: "", passwordConfirm: "" },
});

const password = watch("password");
const passwordConfirm = watch("passwordConfirm");

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <Input {...register("account")} />
    <PasswordField
      showChecklist={password.length > 0}
      value={password}
      {...register("password")}
    />
    <PasswordField value={passwordConfirm} {...register("passwordConfirm")} />
    <button disabled={!isValid} type="submit">立即註冊</button>
  </form>
);
```

## 레이아웃 패턴 (login·find-password 공유)

```
외곽 VStack: w-full px-4 pb-[122px] pt-[136px] max-md:pb-[50px] max-md:pt-[106px]
내부 VStack: w-full max-w-[414px]
```

login과 동일. find-password만 모바일 padding이 일부 다르며 ([find-password 문서](./find-password.md#레이아웃-패턴-loginsignup-공유) 참조), signup은 login과 100% 동일.

> `LoginPrompt`는 외곽 레이아웃과 별개로 자체 `mt-10 pt-10 border-t` (mobile은 `mt-0 border-t-0 pt-[50px]`)를 가진다. 데스크톱에서 위쪽 구분선으로 회원가입과 로그인 진입을 시각적으로 분리하기 위함.

## 인증 라우트 간 연결

| 출발 | 컴포넌트·요소 | 목적지 | 처리 |
| --- | --- | --- | --- |
| `/signup` | `LoginPrompt`의 "立即登入" `Link` | `/login` | 로그인 진입 |
| `/login` | `Register`의 "立即註冊" `Link` | `/signup` | 회원가입 진입 |
| `/signup` (가입 후) | (TODO) | `/login` 또는 자동 로그인 | API 연동 시 결정 |

## 알려진 제약 / TODO

- **API 미연동** — `SignupForm.onSubmit`에 `// TODO: API 연동` 주석. 실제 회원가입 service 호출 미구현
- **계정 검증 부재** — `account: z.string().min(1)`만 있어 휴대폰 형식이나 이메일 형식 별도 검증 없음. 백엔드 정책 확정 후 정규식·중복 확인 추가
- **회원약관 버튼 동작 없음** — `SignupTerms`의 약관 버튼은 모달/페이지 이동 미정
- **i18n 미적용** — 약관 문구·버튼 라벨 모두 인라인 번체중국어. PasswordChecklist 라벨은 한국어 — 다국어 일괄 정비 필요
- **패스워드 규칙 위반 메시지 미표시** — checklist는 통과 여부만 색으로 표현. zod 에러 message는 비어 있으며 인라인 에러 텍스트 없음
- **확인 필드 불일치 알림 미표시** — `passwordConfirm` 불일치 시 form-level isValid만 false. 사용자에게 명시적 메시지 없음

## 설계 결정 (ADR)

| 결정 | 대안 | 채택 이유 | 영향 / 향후 |
| --- | --- | --- | --- |
| **`PASSWORD_RULES`를 객체 + `(value) => boolean` 시그니처로 통일** | 단일 정규식 / zod 내부 inline 함수 / 별도 validator 파일 | 동일 객체를 zod refine 체인과 `usePasswordRules`가 공유 → 규칙 정의가 한 곳에서 단일 출처. 5개 규칙을 모두 5번 검증해야 PasswordChecklist에서 항목별 색을 칠할 수 있어 합쳐쓰는 정규식은 부적합 | 규칙 추가/삭제 시 `PASSWORD_RULES` + `usePasswordRules` + `RULE_ORDER` 3곳 수정 (의도된 명시성) |
| **5개 규칙을 zod `refine` 체이닝** | 단일 `refine` 안에서 모든 규칙 검사 / `superRefine` 사용 | 규칙별로 메시지·path를 독립적으로 줄 수 있어 향후 항목별 인라인 에러 추가가 용이. 현재는 메시지 비어 있음 | 항목별 메시지 도입 시 각 `refine`에 `{ message }` 추가하면 됨 |
| **`PasswordField` visibility를 컴포넌트 내부 `useState`로 관리** | 부모(SignupForm)에서 visible state 보유 후 prop으로 주입 | 두 PasswordField가 각자 독립 토글되어야 하고, 이 상태는 SignupForm 입장에선 무의미. 컴포넌트 내부 상태가 적절 | 부모가 토글 제어를 원하면 controlled 패턴(visible/onVisibleChange)으로 확장 가능 |
| **`PasswordChecklist` 조건부 렌더 (`showChecklist` prop)** | 항상 렌더 + value 비어 있을 때 hidden 처리 | 빈 입력 시 5개 회색 체크 박스가 노출되면 시각적 노이즈가 큼. 한 글자라도 입력하면 노출되는 편이 사용성 향상. confirmation 필드는 체크리스트가 의미 없으므로 default false | 비밀번호 변경 페이지처럼 confirmation에도 체크리스트가 필요해지면 prop을 명시적으로 전달 |
| **features barrel에 `PasswordField`/`PasswordChecklist` 미노출** | 4개 컴포넌트 모두 노출 | SignupForm 내부 합성 디테일이며 다른 페이지에서 재사용 의도 없음. barrel을 작게 유지해 외부 의존을 최소화 | 다른 인증 흐름에서 동일 패스워드 UI가 필요해지면 `widgets/password-field`로 승격 |
| **`mode: "onChange"`** | 기본값 `onSubmit` / `onBlur` | 5개 규칙 체크리스트가 입력 즉시 색을 바꿔야 사용성이 좋음. valid 상태도 매 키 입력마다 평가되어 submit 버튼 disabled 토글이 자연스러움 | 큰 폼에서는 성능 비용이 있을 수 있음. 회원가입은 필드가 3개라 비용 무시 가능 |
| **`account` 필드를 단순 `min(1)` 검증** | 정규식으로 휴대폰/이메일 형식 강제 | 백엔드가 어느 형식을 받을지 미확정. UI 우선 작업이라 형식 강제는 후속 작업으로 미룸 | API 연동 시 zod 스키마에 `.regex` 또는 `.email().or(phoneRegex)` 추가 |

## 참고

- 외곽 레이아웃 컨벤션 공유: [Login 문서 - 레이아웃 패턴](./login.md#레이아웃-패턴-signupfind-password-공유)
- 비밀번호 찾기 진입 동선: [Find Password 문서](./find-password.md#인증-라우트-간-연결)
- FSD 전반 규칙: `apps/web/.claude/CLAUDE.md`
