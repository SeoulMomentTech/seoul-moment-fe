# Seoul Moment Mobile

Seoul Moment 서비스의 iOS / Android 앱입니다. Expo 기반이며, web 타깃은 개발 확인용으로만 사용합니다.

## Tech Stack

- **Framework**: [Expo SDK 57](https://docs.expo.dev/) + [React Native 0.86](https://reactnative.dev/) + React 19
- **Language**: [TypeScript](https://www.typescriptlang.org/) (TS 6/7 이중 구성 — 루트 CLAUDE.md 참고)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (파일 기반, typed routes)
- **Styling**: [NativeWind v5](https://www.nativewind.dev/v5) (RC) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest) & [ky](https://github.com/sindresorhus/ky)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Secure Storage**: [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) (iOS Keychain / Android Keystore)

## Getting Started

의존성은 루트에서 한 번에 설치합니다.

```bash
pnpm install
```

```bash
cd apps/mobile
pnpm start       # Metro 개발 서버 실행 (i: iOS 시뮬레이터, a: Android 에뮬레이터)
pnpm ios         # iOS 시뮬레이터로 바로 실행
pnpm android     # Android 에뮬레이터로 바로 실행
pnpm web         # 브라우저로 실행 (개발 확인용)
```

iOS 시뮬레이터는 Xcode, Android 에뮬레이터는 Android Studio가 필요합니다. 실기기는 [Expo Go](https://expo.dev/go)로 QR 코드를 스캔해 실행할 수 있습니다.

### 환경 변수

| 변수                       | 설명          | 기본값                           |
| :------------------------- | :------------ | :------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL` | API 서버 주소 | `https://api.seoulmoment.com.tw` |

`EXPO_PUBLIC_` 접두사가 붙은 변수만 앱 번들에 포함됩니다. 로컬 값은 `.env.local`에 둡니다(gitignore 대상).

## Scripts

```bash
pnpm start          # 개발 서버 실행
pnpm lint           # ESLint 검사
pnpm lint:fix       # ESLint 자동 수정
pnpm typecheck      # TS 7 타입 체크
pnpm typecheck:ts6  # TS 6 타입 체크 (TS 7 진단이 의심스러울 때 교차 확인)
```

> `pnpm reset-project`는 Expo 템플릿 초기화 스크립트입니다. `src/` 전체(`src/shared` 포함)를 옮기거나 지우므로 실행하지 마세요.

## Project Structure

- `src/app`: Expo Router 라우트 (파일 = 화면). `_layout.tsx`에서 전역 CSS와 `QueryProvider`를 연결합니다.
- `src/shared`: 앱 전반에서 재사용되는 자원 (web과 같은 구조)
  - `services`: ky 기반 API 클라이언트(`index.ts`)와 도메인별 서비스 함수
  - `lib/auth`: 인증 스토어(`useUserAuthStore`)와 토큰 저장소(`tokenStorage`)
  - `lib/query`: QueryClient 설정, 앱 포커스·네트워크 감지(`appLifecycle.ts`)
  - `lib/hooks/query`: `useAppQuery` / `useAppMutation`
  - `lib/i18n`: 언어 타입과 기기 언어 감지
- `src/components`, `src/hooks`, `src/constants`: Expo 템플릿에서 온 예시 코드
- `src/global.css`: Tailwind / NativeWind 진입점

## Guidelines

### API

web(`apps/web/src/shared/services`)과 같은 인터페이스를 따릅니다.

- 서비스 함수는 `api.get(...).json<CommonRes<T>>()` 형태로 작성하고, 요청·응답 인터페이스는 같은 파일에 둡니다.
- 다국어 응답이 필요한 GET 요청은 `languageCode` 파라미터를 넘기면 `Accept-Language` 헤더로 변환됩니다. 언어는 `getDeviceLanguage()`로 기기 설정에서 고릅니다(ko / en / zh-TW, 미지원 언어는 ko).
- 401 응답은 refresh token으로 재발급 후 한 번 재시도하고, 재발급에 실패하면 로그아웃합니다.
- `useQuery` / `useMutation`을 직접 쓰지 않고 `useAppQuery` / `useAppMutation`을 사용합니다(ESLint로 강제).

### 인증 토큰

앱에는 `localStorage`가 없으므로 토큰은 SecureStore에 저장합니다.

- SecureStore는 값 하나당 약 2KB 제한이 있어 access / refresh 토큰을 별도 키로 저장합니다. 사용자 정보는 저장하지 않고 로그인 후 API로 다시 받습니다.
- 복원이 비동기라 앱 시작 시 `hydrateUserAuth()`로 한 번만 복원하고, API 요청은 복원이 끝날 때까지 기다린 뒤 토큰을 붙입니다.
- web 타깃은 SecureStore를 지원하지 않아 메모리에만 저장합니다(새로고침 시 로그아웃).

### 데이터 갱신

- 앱이 foreground로 돌아오거나 네트워크가 다시 연결되면 stale 쿼리를 자동으로 refetch합니다.
- 오프라인 동안의 요청은 실패하지 않고 대기했다가 연결이 복구되면 실행됩니다.
- 기본 `staleTime`은 5분입니다. 복귀할 때마다 항상 새로 받아야 하는 쿼리는 해당 쿼리의 `staleTime`을 짧게 지정합니다.

### 스타일

- `className`으로 Tailwind 유틸리티를 사용합니다(NativeWind).
- 조건부·병합 클래스는 `cn()`(`@seoul-moment/ui/utils`, clsx + tailwind-merge)으로 조합합니다. 충돌하는 유틸리티는 뒤에 온 값이 남습니다.
- 색상·타이포 토큰(`text-brand`, `bg-danger`, `text-body-3` 등)은 web과 같은 `@seoul-moment/tailwind-config/tokens`를 씁니다. gluestack 컴포넌트용 시맨틱 색상(`bg-primary`, `border-border` 등)은 `src/global.css`에서 이 토큰에 연결합니다(라이트 전용).
- NativeWind v5는 RC 버전입니다. `nativewind` / `react-native-css`는 정확한 버전으로 고정되어 있으며, 정식 출시 시 함께 올립니다.
- `lightningcss`는 NativeWind가 요구하는 1.30.1을 mobile에만 devDependency로 고정했습니다(web/admin은 영향 없음).
- `nativewind-env.d.ts`는 자동 생성 파일이므로 수정하지 않습니다.

### 의존성 추가

Expo / React Native 패키지는 SDK와 호환되는 버전을 받도록 `pnpm add` 대신 아래 명령을 사용합니다.

```bash
npx expo install <package>
npx expo install --check   # SDK 호환 버전 점검
```

## Not Yet

- 에러 리포팅(Sentry)과 에러 토스트는 아직 없습니다. 연결 지점은 `services/index.ts`와 `lib/query/queryClient.ts`에 TODO로 남아 있습니다.
- EAS Build / Submit 설정과 네이티브 프로젝트(`ios/`, `android/`)는 아직 없습니다.
