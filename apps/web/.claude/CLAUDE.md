# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## App Overview

`@seoul-moment/web` — Next.js 15 (App Router, Turbopack) multilingual e-commerce/content platform with i18n support (ko, en, zh-TW).

## Commands

```bash
pnpm dev:web              # Dev server (localhost:3000), auto-syncs i18n first
pnpm build:web            # Production build
pnpm lint:fix:web         # ESLint auto-fix

# Unit tests (Vitest)
cd apps/web
pnpm vitest run                    # All tests
pnpm vitest run src/path/to/file   # Single file

# E2E tests (Playwright)
pnpm test:web-e2e         # Headless
pnpm test:web-e2e:ui      # With UI

# i18n
pnpm i18n:sync            # Sync translations from Google Sheets
```

## Architecture — FSD (Feature-Sliced Design)

Strict downward-only import hierarchy. **Never import from a higher layer.**

```
app/ → views/ → widgets/ → features/ → entities/ → shared/
```

- **app/** — Next.js App Router routes (`[locale]/` prefix for i18n), providers, global config
- **views/** — Page-level compositions (one per route)
- **widgets/** — Reusable blocks (Header, Footer)
- **features/** — User interaction modules (About, Article, Home, Inquiry, News, Product, Promotion, Search)
- **entities/** — Domain models (Article, Brand, Lookbook, Magazine, News, Partner, Product)
- **shared/** — Services, hooks, constants, UI re-exports

### Path Aliases

```
@/*         → src/*
@shared/*   → src/shared/*
@entities/* → src/entities/*
@features/* → src/features/*
@views/*    → src/views/*
@widgets/*  → src/widgets/*
```

## API Layer — ky

**Location**: `src/shared/services/`

- HTTP client: `ky` with base URL `https://api.seoulmoment.com.tw`, 10s timeout
- Response type: `CommonRes<T>` (`{ result: boolean; data: T }`)
- i18n: pass `languageCode` as query param — `beforeRequest` hook converts it to `Accept-Language` header automatically
- Errors: 500+ auto-reported to Sentry via `beforeError` hook
- Service files export typed arrow functions chaining `.json<CommonRes<T>>()`

### Query Hooks

**Location**: `src/shared/lib/hooks/query/`

Direct use of `@tanstack/react-query` hooks is **banned by ESLint**. Use wrappers:

| Wrapper              | Extra Option                |
| -------------------- | --------------------------- |
| `useAppQuery`        | `logOnError: boolean`       |
| `useAppMutation`     | `toastOnError: string`      |
| `useAppInfiniteQuery`| `logOnError: boolean`       |

## i18n — next-intl v4

- Middleware-based locale detection (`src/middleware.ts`)
- Messages in `messages/{locale}.json`
- Translations sync from Google Sheets via `scripts/syncLocaleFromSheet.js`
- Request interfaces extend `PublicLanguageCode` when locale-aware

## State Management

- **Zustand** — client state (modals via `useModal`)
- **TanStack React Query v5** — server state (5min stale time)
- **nuqs** — URL search params state
- **overlay-kit** — overlay/modal management

## Key Dependencies

- `@sentry/nextjs` — error monitoring (instrumentation in `instrumentation.ts` / `instrumentation-client.ts`)
- `react-error-boundary` — error boundaries
- `date-fns` — date formatting
- `es-toolkit` — utility functions
- `react-hook-form` + `zod` — form validation
- `sonner` — toast notifications
- `lucide-react` — icons (exclusive, no other icon libraries)
