# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## App Overview

`@seoul-moment/web` — Next.js 16 (App Router, Turbopack) multilingual e-commerce/content platform with i18n support (ko, en, zh-TW).

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
- **features/** — User interaction modules (About, Article, FindPassword, Home, Inquiry, Login, Mypage, News, Product, Promotion, Search, Signup)
- **entities/** — Domain models (Article, Brand, Lookbook, Magazine, News, Partner, Product). Note: `magazine` and `megazine` dirs coexist — `megazine` is a legacy/typo slice, prefer `magazine`.
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
| `useAppMutation`     | `toastOnError: boolean`     |
| `useAppInfiniteQuery`| `logOnError: boolean`       |

On `toastOnError: true`, the global `MutationCache.onError` reads the
server-side `message` field from the ky error response body when
available, falling back to `err.message` otherwise.

## i18n — next-intl v4

- Proxy-based locale detection (`src/proxy.ts` — Next 16 renamed the Middleware convention to Proxy; uses next-intl `createMiddleware`)
- Messages in `messages/{locale}.json`
- Translations sync from Google Sheets via `scripts/syncLocaleFromSheet.js`
- Request interfaces extend `PublicLanguageCode` when locale-aware

### Routing

Always import `useRouter`, `Link`, `redirect`, `usePathname` from
`@/i18n/navigation` — never from `next/navigation`. The localized
wrapper preserves the `[locale]` segment when navigating.

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

## Shared UI Primitives

`src/shared/ui/` hosts web-only primitives shared across features.
Notable entries (kebab-case file names, named exports):

- `password-field.tsx` / `password-checklist.tsx` — password input with
  eye toggle and 5-rule live checklist (used by signup, find-password)
- `divider.tsx`, `chip.tsx`, `bottom-sheet.tsx`, `select.tsx`, ...

`src/shared/lib/hooks/usePasswordRules.ts` exports `PASSWORD_RULES`,
`PasswordRuleKey`, and the `usePasswordRules` hook used by both apps'
password flows.

## Gotchas

- **ESLint import order is strict.** The `import/order` plugin treats
  `@shared/*` and `@/*` as different groups; running `pnpm lint:fix:web`
  after refactors is the safest path. Linter will block commits via
  husky/lint-staged otherwise.
- **Auth flows.** Find-password verification + reset uses the
  `user/auth/password/email/{code,verify}` and `PATCH user/auth/password`
  endpoints (one-time token in `Authorization` header). Signup send-code
  now uses `user/auth/email/code` (`postUserEmailCode`); verify still uses
  legacy `auth/email/verify` (`verifyEmailCode`) until the matching
  `user/auth/email/verify` swagger entry is published. The legacy
  `postEmailCode` (`auth/email/code`) function is kept as a fallback but
  no longer wired to signup.
- **SNS auth (Google only).** Login/signup via `/user/auth/google/{login,link,signup}`
  3-step flow. Shared signup UI (`/signup/sns`, `snsAuthStorage`, `SnsSignupForm`)
  wraps a Google-only comms layer (`google*` hooks). Apple/Kakao/Naver not implemented.
  See `.claude/references/sns-auth-flow.md`.
