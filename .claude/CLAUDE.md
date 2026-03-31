# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seoul Moment frontend monorepo: a multilingual e-commerce/content platform with two apps and shared packages.

- **apps/web** - Next.js 15 (App Router, Turbopack) main service with i18n (ko, en, zh-TW)
- **apps/admin** - Vite 7 + React Router v7 SPA admin backoffice
- **packages/ui** - Shared Radix UI component library (@seoul-moment/ui)
- **packages/tailwind-config** - Shared Tailwind CSS v4 config
- **packages/eslint-config** - Shared ESLint v9 config
- **packages/prettier-config** - Shared Prettier config

## Commands

```bash
# Install
pnpm install

# Dev servers
pnpm dev:web          # Next.js on localhost:3000
pnpm dev:admin        # Vite on localhost:5173

# Build
pnpm build            # All packages & apps
pnpm build:web        # Web only
pnpm build:admin      # Admin only

# Lint
pnpm lint             # All workspaces
pnpm lint:fix:web     # Auto-fix web
pnpm lint:fix:admin   # Auto-fix admin

# Test (E2E via Playwright)
pnpm test:web-e2e     # Web e2e headless
pnpm test:web-e2e:ui  # Web e2e with UI
pnpm test:admin-e2e   # Admin e2e headless
pnpm test:admin-e2e:ui

# i18n
pnpm i18n:sync        # Sync translations from Google Sheets
```

Unit tests use Vitest. Run directly in each app:
```bash
cd apps/web && pnpm vitest run           # All unit tests
cd apps/web && pnpm vitest run src/path  # Single test file
```

## Architecture

### Monorepo Tooling

- **pnpm workspaces** (v10) with **Turborepo** for task orchestration and caching
- **Husky** pre-commit hooks run lint-staged (ESLint + Prettier on staged files)
- Package references use `workspace:*` protocol

### apps/web - FSD (Feature-Sliced Design)

The web app follows strict FSD layer hierarchy. **Imports must only go downward** (never import from a higher layer):

```
app/ → views/ → widgets/ → features/ → entities/ → shared/
```

- **app/** - Next.js App Router routes (`[locale]/` prefix for i18n), providers, global config
- **views/** - Page-level compositions (one per route)
- **widgets/** - Large reusable blocks (Header, Footer)
- **features/** - User interaction modules (About, Article, Home, Inquiry, News, Product, Promotion, Search)
- **entities/** - Business domain models (Article, Brand, Lookbook, Magazine, News, Partner, Product)
- **shared/** - Cross-cutting utilities:
  - `services/` - API layer using **ky** (base: `https://api.seoulmoment.com.tw`, 10s timeout)
  - `lib/hooks/` - Custom hooks (useModal with Zustand store)
  - `constants/` - Route definitions, shared constants
  - `ui/` - Re-exports from @seoul-moment/ui

**i18n**: `next-intl` v4 with middleware-based locale detection. Messages in `messages/{locale}.json`. Translations sync from Google Sheets via `scripts/syncLocaleFromSheet.js`.

**State**: Zustand for client state (modals), TanStack React Query v5 for server state (5min stale time, Sentry error tracking in QueryCache/MutationCache).

### apps/admin

Traditional page-based SPA structure:

- `pages/` - 18 page modules (User, Product, Article, News, Brand, etc.)
- `shared/services/` - API layer using **Axios** with interceptor-based token refresh on 401
- `shared/hooks/` - `useAppQuery`, `useAppMutation` (custom wrappers with toast error options), `useAuth`
- `Router.tsx` - PublicRoute (Login, SignUp) and PrivateRoute guards using `useAuthStore` (Zustand with localStorage persistence)

### packages/ui

23 components built on Radix UI primitives with `class-variance-authority` for variants. Uses `clsx` + `tailwind-merge` for class composition. Exports from `src/index.ts`.

Build: `vite build` (ES + CJS) + `tsc` for types + `@tailwindcss/cli` for styles.

## Detailed References

For deeper conventions with code examples, see `.claude/references/`:

- **[general.md](references/general.md)** — TypeScript rules, ESLint conventions, import ordering, restricted imports, FSD layer rules, React rules, Toss frontend principles
- **[style.md](references/style.md)** — Tailwind v4 design tokens, CSS import order, @seoul-moment/ui component catalog and patterns, custom animations
- **[api.md](references/api.md)** — Web (ky) / Admin (axios) API layers, service file patterns, query hook wrappers, token refresh flow

## Code Conventions

- **Named exports only** - no default exports
- **PascalCase** for components, **camelCase** for functions/hooks
- **Icons**: use `lucide-react` exclusively
- **No `any` types** - use proper TypeScript interfaces
- **Tailwind utility classes inline** - no CSS modules
- **next/image**: always provide `sizes` prop
- **API responses**: typed interfaces in service files; admin uses `ApiResponse<T>` wrapper
- **Forms**: react-hook-form + zod for validation
- **Toasts**: `sonner` library
- **URL state** (web): `nuqs`; (admin): React Router params

## Environment Variables

**apps/web** (Next.js `process.env` / `NEXT_PUBLIC_*`):
- `NEXT_PUBLIC_ENV` - develop/production
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `GOOGLE_SERVICE_ACCOUNT_JSON` - server-only, for i18n Google Sheets sync

**apps/admin** (Vite `import.meta.env.VITE_*`):
- `VITE_ADMIN_API_BASE_URL` / `VITE_API_BASE_URL`

**CI/Build**:
- `SENTRY_AUTH_TOKEN` - passed through turbo.json for source map uploads
