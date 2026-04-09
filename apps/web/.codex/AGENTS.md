# Seoul Moment Web (apps/web)

`@seoul-moment/web` — Next.js 15 (App Router, Turbopack) 기반 다국어 e-commerce/content 메인 서비스 (ko, en, zh-TW).

## Commands

```bash
pnpm dev:web              # Dev server (localhost:3000), i18n 자동 동기화 후 실행
pnpm build:web            # Production build
pnpm lint:fix:web         # ESLint auto-fix

# Unit tests (Vitest)
cd apps/web
pnpm vitest run                    # 전체 테스트
pnpm vitest run src/path/to/file   # 단일 파일

# E2E tests (Playwright)
pnpm test:web-e2e         # Headless
pnpm test:web-e2e:ui      # With UI

# i18n
pnpm i18n:sync            # Google Sheets에서 번역 동기화
```

## Architecture — FSD (Feature-Sliced Design)

엄격한 하향식 import 계층 구조. **상위 레이어에서 import 금지.**

```
app/ → views/ → widgets/ → features/ → entities/ → shared/
```

- **app/** — Next.js App Router 라우트 (`[locale]/` prefix), providers, global config
- **views/** — 페이지 단위 구성 (라우트당 하나)
- **widgets/** — 재사용 블록 (Header, Footer)
- **features/** — 사용자 인터랙션 모듈 (About, Article, Home, Inquiry, News, Product, Promotion, Search)
- **entities/** — 도메인 모델 (Article, Brand, Lookbook, Magazine, News, Partner, Product)
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

- HTTP client: `ky` (base URL: `https://api.seoulmoment.com.tw`, 10s timeout)
- Response type: `CommonRes<T>` (`{ result: boolean; data: T }`)
- i18n: `languageCode` query param을 전달하면 `beforeRequest` hook이 `Accept-Language` 헤더로 자동 변환
- Errors: 500+ HTTP 에러는 `beforeError` hook으로 Sentry 자동 리포트
- Service 파일은 typed arrow function을 export하며 `.json<CommonRes<T>>()`로 체이닝

### Query Hooks

**Location**: `src/shared/lib/hooks/query/`

`@tanstack/react-query` 직접 사용은 **ESLint로 금지**. 래퍼 사용 필수:

| Wrapper              | Extra Option                |
| -------------------- | --------------------------- |
| `useAppQuery`        | `logOnError: boolean`       |
| `useAppMutation`     | `toastOnError: string`      |
| `useAppInfiniteQuery`| `logOnError: boolean`       |

## i18n — next-intl v4

- Middleware 기반 locale 감지 (`src/middleware.ts`)
- 메시지 파일: `messages/{locale}.json`
- Google Sheets 동기화: `scripts/syncLocaleFromSheet.js`
- Request interface에 `PublicLanguageCode` extend로 locale 전달
- `useLanguage()` 훅이 App Router `params.locale` 기반 언어 코드 제공

## State Management

- **Zustand** — client state (modals via `useModal`)
- **TanStack React Query v5** — server state (5min stale time)
- **nuqs** — URL search params state (`useQueryStates`, 배열은 `parseAsArrayOf` 사용)
- **overlay-kit** — overlay/modal 관리

## Coding Standards

1. **Component**: `export function` 형태, PascalCase
2. **Icons**: `lucide-react` 전용
3. **Images**: `next/image` 사용 시 반드시 `sizes` 속성 정의
4. **Types**: 명시적 Interface 정의, `any` 금지
5. **Styling**: Tailwind utility classes inline, CSS modules 사용 금지
6. **폴더명**: kebab-case
7. **상수**: 매직 넘버/문자열은 상수로 분리하여 재사용

## Key Dependencies

- `@sentry/nextjs` — error monitoring (`instrumentation.ts` / `instrumentation-client.ts`)
- `react-error-boundary` — error boundaries
- `date-fns` — date formatting
- `es-toolkit` — utility functions
- `react-hook-form` + `zod` — form validation
- `sonner` — toast notifications
- `lucide-react` — icons (exclusive)
