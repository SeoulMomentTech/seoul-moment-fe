# @seoul-moment/ui

공유 React 컴포넌트 라이브러리. `apps/web` (Next.js)과 `apps/admin` (Vite + React Router) 양쪽에서 사용. Radix UI primitives + Tailwind CSS v4 기반.

## Commands

```bash
# Build (ES + CJS 번들, 타입 선언, CSS)
pnpm build                     # 또는: pnpm -F @seoul-moment/ui build

# Dev (CSS만 watch & rebuild)
pnpm dev

# Lint
pnpm lint
```

컴포넌트 수정 후 반드시 `pnpm build`로 `dist/` 재생성 후 consuming app에서 테스트.

## Build Pipeline

`pnpm build`의 3단계 순차 실행:

1. **`vite build`** — `dist/index.js` (ES) + `dist/index.cjs` (CJS) 번들링 (sourcemap 포함). React, react-dom, `@radix-ui/*`는 externalize.
2. **`tsc -b --force`** — `dist/types/`에 declaration 파일 출력 (JS 미생성).
3. **`@tailwindcss/cli`** — `src/styles.css` → `dist/styles.css` 컴파일.

## Component Patterns

### 새 컴포넌트 추가

1. `src/components/ui/<component>.tsx` 생성
2. `src/components/ui/index.ts`에서 re-export
3. `src/index.ts`는 이미 `src/components/ui` 전체를 re-export

### Conventions

- **Named exports only** — default export 금지
- **`"use client"` directive** — React hooks이나 browser API 사용 시 추가 (예: Button은 사용, Flex는 미사용)
- **`cn()` utility** (`src/lib/utils.ts`) — `cn(baseClasses, conditionalClasses, className)` 형태로 class 조합. `clsx` + `tailwind-merge` 래퍼
- **Variant styling** — `VARIANT_CLASSES`, `SIZE_CLASSES` 같은 plain object map 사용
- **Polymorphic `as` prop** — layout 컴포넌트(Flex, VStack, HStack)는 semantic HTML 요소 제한된 `as` prop 지원
- **`asChild` pattern** — interactive 컴포넌트(Button)는 Radix `Slot`으로 합성
- **Props** — `React.ComponentProps<"element">` 사용 (`React.HTMLAttributes` 아님)
- **`data-slot` attribute** — root 요소에 CSS 타겟팅용으로 추가 (예: `data-slot="button"`)

### Design Tokens

컴포넌트 색상은 `src/styles.css`의 CSS custom properties (`:root`, `.dark` 스코프) 사용. 공유 디자인 토큰(brand 색상, typography, spacing)은 `packages/tailwind-config`에서 제공.

### Consumer Setup

앱에서 Tailwind가 이 패키지 소스를 스캔하도록 설정 필요:

```css
@source "../../packages/ui/src/**/*.{ts,tsx}";
@import "tailwindcss";
@import "@seoul-moment/tailwind-config";
@import "@seoul-moment/ui/styles.css";
```

## Architecture

```
src/
  index.ts              # 패키지 entry: 컴포넌트 + cn() re-export
  styles.css            # CSS custom properties (color tokens, light/dark)
  lib/utils.ts          # cn() utility
  components/ui/        # 전체 컴포넌트 (flat 구조, 컴포넌트당 하나의 파일)
    index.ts            # Barrel re-exports
```

Path alias `@` → `src/` (vite.config.ts 설정)이지만 현재 컴포넌트는 상대 경로 import 사용.

## Peer Dependencies

consumer가 `react`, `react-dom`, `lucide-react`를 제공해야 함.
