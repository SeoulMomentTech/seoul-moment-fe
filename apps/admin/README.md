# Seoul Moment Admin

Seoul Moment 서비스의 운영 및 관리를 위한 어드민 백오피스 애플리케이션입니다.

## Tech Stack

- **Framework**: [Vite](https://vitejs.dev/) + [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest) & [Axios](https://axios-http.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Form**: [React Hook Form](https://react-hook-form.com/)
- **UI Components**: [@seoul-moment/ui](https://github.com/seoul-moment/seoul-moment-fe/tree/main/packages/ui) (Internal Library)
- **Testing**: [Vitest](https://vitest.dev/) & [Playwright](https://playwright.dev/)

## Project Structure

기능 단위의 페이지와 공통 레이어로 구성되어 있습니다.

- `src/pages`: 화면 단위의 컴포넌트 모음
- `src/shared`: 프로젝트 전반에서 재사용되는 자원
  - `components`: 공통 UI 컴포넌트
  - `hooks`: 커스텀 훅 및 Zustand 스토어
  - `constants`: 경로(Route), 설정값 등 상수 관리
  - `services`: API 호출 및 외부 서비스 로직
- `src/Router.tsx`: 라우팅 설정 및 권한 가드(Public/Private) 처리
- `src/App.tsx`: 애플리케이션 최상위 진입 컴포넌트

## Scripts

```bash
pnpm dev         # 개발 서버 실행
pnpm build       # 타입 체크 및 프로덕션 빌드
pnpm preview     # 빌드된 결과물 미리보기
pnpm lint        # ESLint 검사
pnpm test        # Vitest 단위 테스트 실행
pnpm test:e2e    # Playwright E2E 테스트 실행
```

## Guidelines

- **라우트 관리**: 모든 페이지 경로는 `src/shared/constants/route.ts`에서 상수로 정의하여 사용합니다.
- **인증 로직**: `Router.tsx`의 가드 로직을 통해 인증 여부에 따른 페이지 접근 제한을 관리합니다.
- **UI 일관성**: 개별 스타일 작성보다 `@seoul-moment/ui` 패키지의 컴포넌트와 Tailwind 토큰을 우선적으로 활용합니다.

## Deployment

Netlify를 통해 배포되며, `netlify.toml` 설정에 따라 SPA 라우팅을 위한 리다이렉션 처리가 포함되어 있습니다.