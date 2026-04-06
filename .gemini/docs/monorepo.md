# Seoul Moment Frontend Monorepo

다국어 e-commerce/content 플랫폼의 프론트엔드 모노레포.

## Structure

- `apps/web` — Next.js 15 메인 서비스 (i18n: ko, en, zh-TW)
- `apps/admin` — Vite 7 + React Router v7 admin backoffice
- `packages/ui` — 공유 Radix UI 컴포넌트 라이브러리 (@seoul-moment/ui)
- `packages/tailwind-config` — 공유 Tailwind CSS v4 config
- `packages/eslint-config` — 공유 ESLint v9 config
- `packages/prettier-config` — 공유 Prettier config

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
pnpm i18n:sync        # Google Sheets에서 번역 동기화
```

Unit tests는 Vitest 사용. 각 앱에서 직접 실행:
```bash
cd apps/web && pnpm vitest run           # 전체 unit tests
cd apps/web && pnpm vitest run src/path  # 단일 파일
```

## Monorepo Tooling

- **pnpm workspaces** (v10) + **Turborepo**로 task orchestration 및 caching
- **Husky** pre-commit hooks → lint-staged (ESLint + Prettier on staged files)
- 패키지 참조: `workspace:*` protocol
- Pipeline 정의: `turbo.json`
- Workspace 정의: `pnpm-workspace.yaml`

## Code Conventions

- **Named exports only** — default export 금지
- **PascalCase** — 컴포넌트, **camelCase** — functions/hooks
- **Icons**: `lucide-react` 전용
- **No `any`** — 명시적 TypeScript interface 사용
- **Tailwind utility classes inline** — CSS modules 사용 금지
- **next/image**: 반드시 `sizes` prop 제공
- **API responses**: service 파일에 typed interface 정의; admin은 `ApiResponse<T>` 래퍼 사용
- **Forms**: react-hook-form + zod
- **Toasts**: `sonner`
- **URL state**: web은 `nuqs`, admin은 React Router params

## Environment Variables

- **apps/web** (Next.js `process.env` / `NEXT_PUBLIC_*`): `NEXT_PUBLIC_ENV`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `GOOGLE_SERVICE_ACCOUNT_JSON` (server-only)
- **apps/admin** (Vite `import.meta.env.VITE_*`): `VITE_ADMIN_API_BASE_URL`, `VITE_API_BASE_URL`
- **CI/Build**: `SENTRY_AUTH_TOKEN` (turbo.json 경유 source map upload)
