# Admin App (apps/admin)

`@seoul-moment/admin` — Vite 7 + React Router v7 SPA admin backoffice.

## Commands

```bash
pnpm dev:admin            # Dev server (localhost:5173)
pnpm build:admin          # Production build (tsc + vite build)
pnpm lint:fix:admin       # ESLint auto-fix

# Unit tests (Vitest)
cd apps/admin
pnpm vitest run                    # 전체 테스트
pnpm vitest run src/path/to/file   # 단일 파일

# E2E tests (Playwright)
pnpm test:admin-e2e       # Headless
pnpm test:admin-e2e:ui    # With UI
```

## Architecture

전통적 page-based SPA 구조 (FSD 아님).

```
src/
  pages/          # 18개 페이지 모듈 (User, Product, Article, News, Brand, etc.)
  shared/
    services/     # API layer (Axios)
    hooks/        # useAppQuery, useAppMutation, useAuth
  Router.tsx      # PublicRoute / PrivateRoute guards
  App.tsx         # Root component
  main.tsx        # Entry point
  types/          # Shared type definitions
```

### Path Aliases

```
@/*        → src/*
@shared/*  → src/shared/*
@pages/*   → src/pages/*
```

## Routing & Auth

- **React Router v7**: `PublicRoute` (Login, SignUp) / `PrivateRoute` guards
- Auth state: `useAuthStore` (Zustand + localStorage persistence)
- 401: interceptor로 자동 토큰 갱신; 403: 강제 로그아웃

## API Layer — Axios

**Location**: `src/shared/services/`

- HTTP client: Axios (base: `VITE_ADMIN_API_BASE_URL`, 10s timeout)
- Response type: `ApiResponse<T>` (`{ result: boolean; data: T }`)
- `fetcher` object 사용 (`fetcher.get`, `fetcher.post`, etc.) — `res.data` 자동 unwrap
- **Branded types**으로 type-safe ID: `Branded<number, "AdminArticleId">`

### Token Refresh Flow

1. **401** 발생: `refreshToken`으로 `/admin/auth/one-time-token` 호출
2. 동시 401은 단일 refresh 요청 공유 (promise queue dedup)
3. 성공 시: `accessToken` 갱신 후 원본 요청 재시도
4. 재시도 후 2번째 401: 강제 로그아웃
5. **403**: 즉시 강제 로그아웃

### Query Hooks

**Location**: `src/shared/hooks/`

`@tanstack/react-query` 직접 사용은 **ESLint로 금지**. 래퍼 사용 필수:

| Wrapper          | Extra Option                          |
| ---------------- | ------------------------------------- |
| `useAppQuery`    | `toastOnError: boolean \| string`     |
| `useAppMutation` | `toastOnError: boolean \| string`     |

## Coding Standards

- 컴포넌트 파일은 PascalCase, 폴더는 kebab-case 또는 기존 구조와 일관 유지
- 라우트 정의는 `src/shared/constants/route.ts`에서 관리
- `@seoul-moment/ui` 컴포넌트 우선 사용, Tailwind utility classes 보조
- Zustand 스토어는 `src/shared/hooks` 하위에 정의
- 매직 넘버/문자열은 `src/shared/constants`에 상수로 분리

## Key Dependencies

- `react-hook-form` + `zod` — form validation (legacy `formik` 사용도 존재)
- `sonner` — toast notifications
- `zustand` — client state (auth store + localStorage)
- `@tanstack/react-query` — server state (`useAppQuery`/`useAppMutation` 래퍼 경유)
- `lucide-react` — icons (exclusive)
- `es-toolkit` — utility functions
- `react-error-boundary` — error boundaries

## Environment Variables

Vite `import.meta.env.VITE_*`:

- `VITE_ADMIN_API_BASE_URL` — Admin API base URL
- `VITE_API_BASE_URL` — Public API base URL

## TypeScript

공유 설정 외 추가 strict 옵션:
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `erasableSyntaxOnly: true`
