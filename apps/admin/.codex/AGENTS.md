# 프로젝트 개요

- Vite 기반 React SPA
- 언어: TypeScript
- 라우팅: `react-router`
- 스타일링: TailwindCSS (루트 패키지의 `@seoul-moment/tailwind-config` 활용)
- 전역 상태: `zustand`
- 공용 UI: `@seoul-moment/ui`

# 프로젝트 구조

- `src/main.tsx`: 애플리케이션 진입점
- `src/App.tsx`: 최상위 컴포넌트, 내부에서 Router 로직만 위임
- `src/Router.tsx`: `react-router` 설정 및 Public/Private Route 가드
- `src/pages`: 화면 단위 컴포넌트
- `src/components`: 재사용 가능한 UI
- `src/constants`: 경로, 공통 상수
- `src/hooks`: 커스텀 훅 (zustand 스토어 등)

# 명령어

- `pnpm run dev`: 개발 서버 실행
- `pnpm run build`: 타입체크 + 프로덕션 번들 생성
- `pnpm run preview`: build 산출물 미리보기
- `pnpm run lint`: ESLint 검사

# 코딩 스타일 및 가이드

- eslint 설정(`apps/admin/eslint.config.mjs`)을 준수하고, 미사용 코드/콘솔은 제거합니다.
- 컴포넌트 파일은 PascalCase, 폴더는 kebab-case 또는 기존 구조와 일관되게 유지합니다.
- 라우트 정의는 `src/constants/route.ts`에서 관리하며 Router에서는 import만 사용합니다.
- 공용 UI는 `@seoul-moment/ui` 컴포넌트를 우선 사용하고, Tailwind 유틸 클래스를 보조로 사용합니다.
- Zustand 스토어는 `src/hooks` 아래에 정의하고 필요한 곳에서만 import 하여 사용합니다.
- 매직 넘버/문자열은 `src/constants`에 상수로 분리해 재사용합니다.

# 추가 안내

- Public/Private Route 가드 로직은 `Router.tsx`에 작성되어 있으므로 인증 흐름 변경 시 해당 파일을 수정합니다.
- UI 변경 시 디자인 시스템(`@seoul-moment/ui`)과 Tailwind 토큰을 우선 참고하여 일관성을 유지합니다.
