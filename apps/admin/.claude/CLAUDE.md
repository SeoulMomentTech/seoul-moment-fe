# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## App Overview

`@seoul-moment/admin` — Vite 7 + React Router v7 SPA admin backoffice for managing content, products, users, and more.

## Commands

```bash
pnpm dev:admin            # Dev server (localhost:5173)
pnpm build:admin          # Production build (tsc + vite build)
pnpm lint:fix:admin       # ESLint auto-fix

# Unit tests (Vitest)
cd apps/admin
pnpm vitest run                    # All tests
pnpm vitest run src/path/to/file   # Single file

# E2E tests (Playwright)
pnpm test:admin-e2e       # Headless
pnpm test:admin-e2e:ui    # With UI
```

## Architecture

Traditional page-based SPA structure (not FSD).

```
src/
  pages/          # 18 page modules (User, Product, Article, News, Brand, etc.)
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

- **React Router v7** with `PublicRoute` (Login, SignUp) and `PrivateRoute` guards
- Auth state: `useAuthStore` (Zustand with localStorage persistence)
- On 401: automatic token refresh via interceptor; on 403: forced logout

## API Layer — Axios

**Location**: `src/shared/services/`

- HTTP client: Axios with `VITE_ADMIN_API_BASE_URL` base, 10s timeout
- Response type: `ApiResponse<T>` (`{ result: boolean; data: T }`)
- Use `fetcher` object (`fetcher.get`, `fetcher.post`, etc.) — auto-unwraps `res.data`
- **Branded types** for type-safe IDs: `Branded<number, "AdminArticleId">`

### Token Refresh Flow

1. On **401**: refresh via `/admin/auth/one-time-token` using `refreshToken`
2. Concurrent 401s share a single refresh request (promise queue dedup)
3. Success: updates `accessToken` in store, retries original request
4. Second 401 after retry: forced logout
5. On **403**: forced logout immediately

### Query Hooks

**Location**: `src/shared/hooks/`

Direct use of `@tanstack/react-query` hooks is **banned by ESLint**. Use wrappers:

| Wrapper          | Extra Option                          |
| ---------------- | ------------------------------------- |
| `useAppQuery`    | `toastOnError: boolean \| string`     |
| `useAppMutation` | `toastOnError: boolean \| string`     |

## Key Dependencies

- `react-hook-form` + `zod` — form validation (also has legacy `formik` usage)
- `sonner` — toast notifications
- `zustand` — client state (auth store with localStorage)
- `@tanstack/react-query` — server state (via `useAppQuery`/`useAppMutation` wrappers)
- `lucide-react` — icons (exclusive, no other icon libraries)
- `es-toolkit` — utility functions
- `react-error-boundary` — error boundaries

## Environment Variables

Vite exposes via `import.meta.env.VITE_*`:

- `VITE_ADMIN_API_BASE_URL` — Admin API base URL
- `VITE_API_BASE_URL` — Public API base URL

## TypeScript

Additional strict options beyond the shared config:
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `erasableSyntaxOnly: true`
