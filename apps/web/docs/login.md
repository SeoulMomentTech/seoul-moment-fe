# 로그인 페이지 (`/login`)

`apps/web`의 로그인 화면 구현 문서. FSD(Feature-Sliced Design) 레이어를 따르며 signup·find-password와 동일한 외곽 레이아웃 컨벤션을 공유한다.

- 라우트: `apps/web/src/app/[locale]/login/page.tsx` → `/[locale]/login` (예: `/ko/login`)
- 인증 흐름 내 위치: **Login** ↔ [Signup](#) ↔ [Find Password](./find-password.md)
- 관련 PR: `feat(web): add login page with section components` (`ad956b8`)

## 파일 구조

```
apps/web/src/
├── app/[locale]/login/page.tsx           # 라우트 진입점 (5줄 pass-through)
├── views/login/
│   ├── index.tsx                         # barrel
│   └── ui/LoginPage.tsx                  # "use client", 외곽 레이아웃 + 5개 섹션 합성
└── features/login/
    ├── index.tsx                         # 5개 default export 묶음
    └── ui/
        ├── LoginHeader.tsx               # 로고 + 환영 문구
        ├── LoginForm.tsx                 # 계정 input + 帳號 체크박스 + 忘記密碼 링크 + 로그인 버튼
        ├── LoginTerms.tsx                # 약관 안내 + 회원약관 버튼
        ├── SocialLoginButtons.tsx        # Google + LINE OAuth 버튼
        └── Register.tsx                  # 회원가입 안내 + /signup 링크
```

## 컴포넌트 책임

| 컴포넌트 | 책임 | 주요 의존성 |
| --- | --- | --- |
| `LoginPage` | 외곽 레이아웃 + 5개 섹션 수직 합성 | `VStack` |
| `LoginHeader` | `next/image`로 `/logo.png` 노출 + 환영 문구 (한국어 하드코딩) | `next/image`, `VStack` |
| `LoginForm` | 단일 input(휴대폰/이메일), 帳號 체크박스, 忘記密碼 `Link`, 로그인 button. **현재 placeholder 상태(상태/검증 미연동)** | `Input`, `HStack`, `Link` from `@/i18n/navigation` |
| `LoginTerms` | 약관 안내 문구 + 회원약관 버튼. `useTranslations()` 호출하지만 i18n 키 누락 | `next-intl`, `VStack` |
| `SocialLoginButtons` | Google · LINE 로그인 버튼. 아이콘은 `/public/login/{google.svg, line.png}` | `next/image`, `Button` from `@seoul-moment/ui`, `next-intl` |
| `Register` | "沒有 PChome 24h購物帳號？" + `Link href="/signup"` | `Link` from `@/i18n/navigation` |

## 레이아웃 패턴 (signup·find-password 공유)

```tsx
// LoginPage.tsx
<VStack className="w-full px-4 pb-[122px] pt-[136px] max-md:pb-[50px] max-md:pt-[106px]">
  <VStack className="w-full max-w-[414px]">
    {/* 섹션들 */}
  </VStack>
</VStack>
```

- 외곽: `pt-[136px] max-md:pt-[106px]` 상단 여백, 좌우 `px-4`
- 콘텐츠: `max-w-[414px]` 단일 컬럼 (Figma 데스크톱·모바일 모두 414·320 베이스 → 모바일에서 자연 축소)
- 섹션 간 간격은 각 섹션의 `pt-[NN]`로 자체 부담 (외곽에 `gap` 없음 → 각자가 위쪽 간격을 책임지는 컨벤션)

## 인증 라우트 간 연결

| 출발 | 컴포넌트·요소 | 목적지 | 처리 |
| --- | --- | --- | --- |
| `/login` | `LoginForm`의 "忘記密碼" `Link` | `/find-password` | 비밀번호 찾기 진입 |
| `/login` | `Register`의 "立即註冊" `Link` | `/signup` | 회원가입 진입 |
| `/find-password` | (현재 미구현) | `/login` | 비밀번호 재설정 후 복귀 (TODO) |
| `/signup` | `LoginPrompt`의 "立即登入" `Link` | `/login` | 회원가입 후 로그인 진입 |

> 모든 링크는 `@/i18n/navigation`의 `Link`를 사용해 locale prefix(`/ko/...`)가 자동 적용된다.

## 사용 예제

### 라우트 → view → features 진입

```tsx
// apps/web/src/app/[locale]/login/page.tsx
import { LoginPage } from "@/views/login";

export default function Login() {
  return <LoginPage />;
}
```

```tsx
// apps/web/src/views/login/ui/LoginPage.tsx
"use client";

import {
  LoginForm,
  LoginHeader,
  LoginTerms,
  Register,
  SocialLoginButtons,
} from "@features/login";
import { VStack } from "@seoul-moment/ui";

export function LoginPage() {
  return (
    <VStack className="w-full px-4 pb-[122px] pt-[136px] max-md:pb-[50px] max-md:pt-[106px]">
      <VStack className="w-full max-w-[414px]">
        <LoginHeader />
        <LoginForm />
        <LoginTerms />
        <SocialLoginButtons />
        <Register />
      </VStack>
    </VStack>
  );
}
```

### features barrel 활용

```ts
// 다른 곳에서 단일 컴포넌트 재사용 시
import { LoginHeader } from "@features/login";
```

## 알려진 제약 / TODO

- **API 미연동** — `LoginForm`의 로그인 버튼은 `type="button"`이며 onClick 핸들러 없음. 추후 `useAppMutation` + `services/auth` 연결 필요
- **검증 부재** — 휴대폰/이메일 형식 검증 없음. `react-hook-form` + `zod` 도입 시점에 함께 추가
- **i18n 키 누락** — `LoginTerms`의 약관 문구, `SocialLoginButtons`의 "구글로 로그인"·"라인으로 로그인" 키가 `messages/{ko,en,zh-TW}.json`에 없어 콘솔 에러 발생. 다국어 일괄 정비 시 추가
- **체크박스 상태 미연결** — `LoginForm`의 帳號 체크박스가 단순 native input. "ID 저장" 등 의미 부여 시 useState/store 연결 필요
- **회원약관 버튼 동작 없음** — 모달/페이지 이동 미정

## 설계 결정 (ADR)

| 결정 | 대안 | 채택 이유 | 영향 / 향후 |
| --- | --- | --- | --- |
| **외곽 레이아웃을 view에 인라인** (`pt-[136px] max-md:pt-[106px]`, `max-w-[414px]`) | 공유 `<AuthLayout>` 위젯으로 추출 | signup·find-password와 동일 값 3중 복제이지만, 현재로선 위젯화 비용 > 중복 비용. 디자인이 안정되어 있고 페이지가 3개라 한 번에 맞춰가는 편이 낫다 | 인증 페이지가 4번째 추가되거나 외곽 패턴이 변경되면 `widgets/auth-layout`로 추출 |
| **5개 컴포넌트로 섹션 분할** (Header/Form/Terms/Social/Register) | 단일 LoginPage 파일 | 각 섹션의 책임이 분리되어 있고, i18n / API 연동을 점진적으로 도입할 때 변경 영역이 좁아진다. 디자인 시스템 검토(figma-to-code)도 섹션 단위로 받기 좋음 | 단점: `features/login/index.tsx`에 5개 export. 가독성에 큰 부담 없음 |
| **`react-hook-form` 미도입** (현재 placeholder) | `signupForm`처럼 `useForm` + zod 도입 | login은 OAuth 위주이고 form 필드가 1개라 도입 비용이 가치 대비 낮다. UI 골격만 먼저 받고 API 연동 시점에 일괄 도입 | API 연동 PR에서 함께 검토. 그때까지는 수동 onChange/state로 대응 가능 |
| **forgot 링크를 `<Link>`로 처리** | `useRouter().push("/find-password")` | SSR 친화적이고 prefetch 자동 적용. `@/i18n/navigation` 래퍼가 locale prefix를 자동으로 붙여 `/ko/find-password`로 이동 | 일반 클릭 외 핸들러 필요(예: 폼 dirty 시 confirm)가 생기면 `useRouter` 전환 |
| **i18n 키를 인라인 한국어로 사용** (`t("구글로 로그인")`) | 네임스페이스 키(`t("auth.login.google")`) | 키와 한국어 디폴트가 1:1로 매핑되어 번역가가 컨텍스트를 잃지 않음. 단점: 키 변경 비용 큼 | 일괄 i18n 정비 시 네임스페이스 도입 검토 |

## 참고

- 외곽 레이아웃 컨벤션 공유: [Find Password 문서 - 레이아웃 패턴](./find-password.md#레이아웃-패턴-loginsignup-공유)
- 비밀번호 찾기 진입 동선: [Find Password 문서 - 인증 라우트 간 연결](./find-password.md#인증-라우트-간-연결)
- FSD 전반 규칙: `apps/web/.claude/CLAUDE.md` (Architecture 섹션)
