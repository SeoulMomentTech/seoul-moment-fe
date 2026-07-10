# Seoul Moment Web — 디자인 시스템 레퍼런스

`@seoul-moment/web`의 디자인 토큰, 컴포넌트, 스타일 규칙을 한곳에 정리한 문서입니다.
개발자와 디자이너가 함께 참조하는 단일 기준(SSOT)을 목표로 합니다.

> Claude Code용 간략 요약은 루트 [`.claude/references/style.md`](../../.claude/references/style.md)에 있습니다. 이 문서는 그것을 확장한 사람이 읽는 상세 버전입니다.

---

## 1. 개요

- **스택**: Next.js 15 (App Router, Turbopack) · Tailwind CSS v4 · `@seoul-moment/ui`(Radix 기반 공용 컴포넌트)
- **Tailwind v4 방식**: CSS-first 구성입니다. 전통적인 `tailwind.config.js`가 **없고**, 토큰은 CSS의 `@theme` 블록에서 정의됩니다.
- **디자인 원칙**
  - **모바일 퍼스트** — 기본 스타일은 모바일, `sm:` 프리픽스로 데스크탑을 얹습니다.
  - **유틸리티 우선** — 인라인 Tailwind 클래스만 사용하고 CSS Modules는 쓰지 않습니다.
  - **토큰 기반** — 색상·타이포·duration은 정의된 토큰을 쓰고 arbitrary value를 지양합니다.
  - **다국어 대응** — ko/en/zh-TW 문자열 길이 차이를 흡수하도록 고정폭을 지양하고 유연한 레이아웃을 씁니다.

---

## 2. 디자인 토큰

토큰의 원본(SSOT)은 [`packages/tailwind-config/shared-styles.css`](../../packages/tailwind-config/shared-styles.css)이며, web 전용 값은 [`apps/web/src/app/globals.css`](./src/app/globals.css)에서 재정의/추가됩니다.

### 2.1 컬러

원시 값은 `:root`에 정의되고 `@theme inline`에서 `--color-*` 시맨틱 토큰으로 매핑됩니다. Tailwind 유틸리티로 `text-brand`, `bg-danger`, `border-neutral-subtle`처럼 사용합니다.

| 토큰 | Hex | 원시 변수 | 용도 |
| --- | --- | --- | --- |
| `brand` | `#f37b2a` | `--brand-500` | 브랜드 메인 컬러(주황) |
| `neutral` | `#707070` | `--neutral-600` | 본문 보조 텍스트/회색 |
| `neutral-subtle` | `#dddddd` | `--neutral-200` | 보더/구분선 |
| `surface-soft` | `#f0f6ff` | `--surface-soft` | 연한 배경 서피스 |
| `info` | `#0088ff` | `--info-500` | 정보/전송 상태 |
| `danger` | `#ff383c` | `--danger-500` | 에러/경고 |
| `background` | `#ffffff` | `--neutral-0` | 페이지 배경 |
| `foreground` | `#171717` | `--neutral-900` | 기본 텍스트 |

**별칭(alias)** — 같은 값을 다른 이름으로도 노출합니다:

| 별칭 토큰 | 실제 값 |
| --- | --- |
| `orange` | `brand` (`#f37b2a`) |
| `gray` | `neutral` (`#707070`) |
| `error` | `danger` (`#ff383c`) |
| `sent` | `info` (`#0088ff`) |

```tsx
import { cn } from "@seoul-moment/ui";

<span className="text-brand">브랜드 텍스트</span>
<button className={cn("bg-danger text-white", disabled && "bg-neutral")}>삭제</button>
```

### 2.2 타이포그래피

- **폰트**: **Pretendard**. jsDelivr CDN으로 import하고 `body`의 `font-family`로 적용합니다.
  ```css
  @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");
  ```
- **사이즈 토큰**: `text-<token>` 형태로 사용합니다. line-height/weight는 별도 토큰이 없으며 Tailwind 기본값을 씁니다.

| 토큰 | 크기 | | 토큰 | 크기 |
| --- | --- | --- | --- | --- |
| `text-title-1` | 36px | | `text-body-1` | 18px |
| `text-title-2` | 32px | | `text-body-2` | 16px |
| `text-title-3` | 24px | | `text-body-3` | 14px |
| `text-title-4` | 20px | | `text-body-4` | 13px |
| | | | `text-body-5` | 12px |

### 2.3 Radius

- `--radius: 0.5rem` — `@seoul-moment/ui` 컴포넌트 내부에서 사용됩니다. web `@theme`에 `--radius-*` 매핑은 없으므로 개별 요소는 Tailwind 기본 radius 유틸리티(`rounded`, `rounded-lg` 등)를 사용합니다.

### 2.4 Duration (애니메이션 지속시간)

`duration-<token>` 형태로 사용합니다.

| 토큰 | 값 |
| --- | --- |
| `duration-instant` | 0ms |
| `duration-fast` | 100ms |
| `duration-normal` | 200ms |
| `duration-slow` | 300ms |
| `duration-slower` | 500ms |

### 2.5 스페이싱

커스텀 스페이싱 토큰은 정의되어 있지 **않습니다**. Tailwind v4 기본 spacing scale(`p-4`, `gap-2`, `mt-8` …)을 그대로 사용합니다.

---

## 3. 스타일 작성 규칙

- **유틸리티 우선** — 인라인 Tailwind 클래스로 스타일링하고 CSS Modules는 쓰지 않습니다.
- **토큰 우선** — 대응하는 토큰이 있으면 arbitrary value(`text-[#f37b2a]`)를 피하고 토큰(`text-brand`)을 씁니다.
- **`cn()` 합성** — `@seoul-moment/ui`의 `cn()`(clsx + tailwind-merge)으로 클래스를 합칩니다. 뒤에 오는 클래스가 이기므로 consumer가 넘긴 `className`이 항상 우선합니다.
  ```tsx
  import { cn } from "@seoul-moment/ui";
  <div className={cn("flex items-center", isActive && "text-brand", className)} />
  ```
- **CSS import 순서** — [`globals.css`](./src/app/globals.css) 최상단 순서를 지킵니다:
  ```css
  @source "../../../../packages/ui/**/*.{js,ts,jsx,tsx}"; /* UI 패키지 클래스 스캔 */
  @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");
  @import "tailwindcss";
  @import "@seoul-moment/tailwind-config";
  @import "@seoul-moment/ui/styles.css";
  @import "tailwind-scrollbar-hide/v4";
  ```
- **전역 규칙** (globals.css / shared-styles.css)
  - 모든 요소에 포커스 링 리셋: `* { @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-transparent focus-visible:ring-offset-0; }`
  - `button { cursor: pointer }`, `button:disabled { cursor: not-allowed }`

---

## 4. 컴포넌트 라이브러리 (`@seoul-moment/ui`)

Radix UI 프리미티브 기반의 공용 컴포넌트입니다. 소스는 [`packages/ui/src/components/ui/`](../../packages/ui/src/components/ui/)(1파일 1컴포넌트, kebab-case), 배럴은 `index.ts`입니다.

```tsx
import { Button, Dialog, Input, Card, VStack, HStack, Flex, cn } from "@seoul-moment/ui";
```

### 4.1 카탈로그 (23개)

| 분류 | 컴포넌트 |
| --- | --- |
| **Form** | Button, Input, Textarea, Label, Form, Select, Radio, Switch, SearchBar |
| **Layout** | Card (+ CardHeader/Title/Description/Action/Content/Footer), Flex, VStack, HStack |
| **Overlay** | Dialog, Drawer, DropdownMenu |
| **Display** | Tabs, Accordion, Table, Avatar, Badge, Skeleton, Spinner |

### 4.2 사용 패턴

- **named export만** 사용합니다 (default export 없음).
- **`data-slot`** — 모든 루트 요소에 `data-slot="<name>"`가 붙어 CSS 타겟팅/devtools 검사에 쓰입니다.
- **`asChild` + Radix `Slot`** — 렌더 요소를 자식으로 교체해 스타일을 위임합니다(Button, Badge).
  ```tsx
  <Button asChild>
    <Link href="/products">상품 보기</Link>
  </Button>
  ```
- **variant는 object map** — 기본적으로 `VARIANT_CLASSES` / `SIZE_CLASSES` 같은 plain object로 관리합니다. `VariantProps` 추론이 필요할 때만 `cva`를 씁니다(현재 Badge만).
  ```tsx
  <Button variant="outline" size="sm">클릭</Button>
  // variant: "default" | "outline" | "ghost" | "destructive"
  // size:    "sm" | "md" | "lg"
  ```
- **Radix 래퍼는 prefix-named 개별 export** — dot-notation이 아닙니다.
  ```tsx
  <Tabs>
    <TabsList>
      <TabsTrigger value="a">A</TabsTrigger>
    </TabsList>
    <TabsContent value="a">…</TabsContent>
  </Tabs>
  ```

### 4.3 레이아웃 프리미티브

`Flex` / `VStack` / `HStack`은 `as` prop으로 시맨틱 태그를 지정할 수 있습니다.

```tsx
<VStack className="gap-4">
  <HStack className="justify-between">
    <span>왼쪽</span>
    <span>오른쪽</span>
  </HStack>
</VStack>
```

> 컴포넌트 추가/수정 규칙과 내부 컨벤션(`"use client"` 기준, forwardRef 사용처, props 타이핑)은 [`packages/ui/.claude/CLAUDE.md`](../../packages/ui/.claude/CLAUDE.md)를 참고하세요.

---

## 5. web 전용 공유 프리미티브 (`shared/ui`)

`@seoul-moment/ui`로 옮기기엔 web에 특화된 프리미티브는 [`apps/web/src/shared/ui/`](./src/shared/ui/)에 둡니다.

| 파일 | 역할 |
| --- | --- |
| `base-image.tsx` | `next/image` 래퍼. 기본 `placeholder="blur"` + `BLUR_DATA_URL` |
| `responsive-banner.tsx` | desktop/mobile 이미지 분기 배너 (`priority`, `object-cover`) |
| `card-slider.tsx` | 제네릭 Swiper 슬라이더 골격 (§8 참고) |
| `slide-button.tsx` | 슬라이더 이동 버튼 |
| `bottom-sheet.tsx` / `sheet.tsx` | 바텀시트/사이드 시트 |
| `chip.tsx`, `divider.tsx`, `select.tsx` | 소형 UI 요소 |
| `password-field.tsx` / `password-checklist.tsx` | 눈 토글 비밀번호 입력 + 5규칙 실시간 체크리스트 |
| `terms-*.tsx`, `legal-document.tsx` | 약관/개인정보 문서 |
| `icon/` | 커스텀 SVG 아이콘 세트 (§7 참고) |

> **주의**: web-local 프리미티브 중 일부(`card-slider.tsx`, `slide-button.tsx` 등)는 `export default`를 사용합니다. 이는 `@seoul-moment/ui`의 "named export only" 규칙과 다릅니다 — web 로컬 코드에서만 허용되는 예외로 이해하세요.

---

## 6. 반응형 규칙

- **모바일 퍼스트 + 단일 경계** — 커스텀 breakpoint를 정의하지 않으므로 Tailwind v4 기본값을 씁니다. 실질적으로 `sm`(640px)을 모바일↔데스크탑 경계로 삼아, 기본(모바일) 스타일 위에 `sm:` 프리픽스로 데스크탑 스타일을 얹습니다. (web 코드 기준 `sm:` 사용이 압도적으로 많고 `md:`/`lg:`는 드뭅니다.)
- **JS 기반 분기** — 마크업 자체를 나눠야 할 때는 [`shared/lib/hooks/useMediaQuery.ts`](./src/shared/lib/hooks/useMediaQuery.ts)(`window.matchMedia`, SSR 가드 포함)를 씁니다.
- **모바일/데스크탑 컴포넌트 분리** — 구조가 크게 다르면 컴포넌트를 분리합니다.
  - 예: `features/home/ui/News/` → `NewsDesktopSlider.tsx` + `NewsMobileSlider.tsx`
  - 이미지 배너는 `shared/ui/responsive-banner.tsx`가 desktop/mobile config를 받아 조건부 렌더합니다.

---

## 7. 애니메이션 & 아이콘

### 애니메이션

`tailwindcss-animated` 플러그인 기반이며 토큰/유틸은 [`shared-styles.css`](../../packages/tailwind-config/shared-styles.css)에 정의됩니다.

- **animate 토큰**: `animate-accordion-down` / `animate-accordion-up` (Radix accordion 높이), `animate-in` / `animate-out`(enter/exit)
- **enter/exit 유틸**: `fade-in-0` / `fade-out-0`, `zoom-in-95` / `zoom-out-95`, `slide-in-from-{top,bottom,left,right}` / `slide-out-to-{top,bottom,left,right}`, 소형 변형 `slide-in-from-*-2`(0.5rem offset)
- **스크롤바 유틸**([globals.css](./src/app/globals.css)): `scrollbar-hide`, `scrollbar-default`, `scrollbar-medium`, `scrollbar-thin`, `scrollbar-color-transparent`, `scrollbar-transition`

### 아이콘

- **기본은 `lucide-react` 독점** — 다른 아이콘 라이브러리를 추가하지 않습니다.
  ```tsx
  import { ChevronLeft, ChevronRight } from "lucide-react";
  ```
- **커스텀 SVG 세트**: [`shared/ui/icon/`](./src/shared/ui/icon/)에서 `FilterIcon`, `RefreshIcon`, `XSolidIcon`, `ArrowRightIcon`, `ChevronLeftIcon`, `ChevronRightIcon` 등을 재-export합니다(default export 기반).

---

## 8. 슬라이더 / 캐러셀

Swiper 기반이며 공통 골격은 [`shared/ui/card-slider.tsx`](./src/shared/ui/card-slider.tsx)입니다.

- 제네릭 `CardSlider<T>` — `FreeMode` 모듈, `breakpoints` prop, PC 전용 prev/next 버튼을 제공합니다.
- 엣지 상태(첫/끝 슬라이드)는 [`shared/lib/hooks/useSwiperEdges.ts`](./src/shared/lib/hooks/useSwiperEdges.ts)로 관리합니다.
- `swiperClassName` / `slideClassName`으로 폭·간격을 스코프 클래스로 주입합니다.
- Swiper 네비게이션 버튼 그림자는 전역 스타일로 지정됩니다:
  ```css
  .swiper-button-prev,
  .swiper-button-next {
    filter: drop-shadow(2px 4px 6px black);
  }
  ```
- 실사용 예: `features/home/ui/News/*`, `features/product/ui/Banner/ProductBanner.tsx`, `widgets/{megazine-slide,article-slide,product-gallery}/`

---

## 9. 다국어(i18n)와 UI

- **locales**: `ko`, `en`, `zh-TW` (`src/i18n/routing.ts`). 모든 라우트는 `app/[locale]/` prefix를 가집니다.
- **네비게이션**: `useRouter` / `Link` / `redirect` / `usePathname`는 반드시 [`@/i18n/navigation`](./src/i18n/navigation.ts)에서 import합니다 — `next/navigation`에서 직접 가져오면 `[locale]` 세그먼트가 유지되지 않습니다.
- **레이아웃 함의**: ko/en/zh-TW는 같은 문구라도 길이가 크게 다릅니다. 고정폭 컨테이너를 지양하고 줄바꿈/축약에 견디는 유연한 레이아웃을 씁니다. 텍스트는 `useTranslations`로 주입하며 번역은 Google Sheets에서 동기화합니다(`pnpm i18n:sync`).

---

## 10. 부록 — 알려진 불일치/주의사항

문서와 코드를 대조할 때 혼란을 줄이기 위한 현재 상태 메모입니다.

- **토큰 이중 정의** — color/typography `@theme` 블록이 `packages/tailwind-config/shared-styles.css`와 `apps/web/src/app/globals.css`에 중복 선언되어 있습니다. duration/animate/keyframes는 `shared-styles.css`에만 있습니다.
- **폰트 변수 불일치** — `@theme`의 `--font-sans` / `--font-mono`는 정의되지 않은 Geist 변수(`--font-geist-sans` 등)를 참조합니다. 실제 렌더링 폰트는 `body`의 **Pretendard**입니다. `font-sans` / `font-mono` 유틸리티에 의존하지 마세요.
- **다크모드** — `.dark` 스코프는 [`packages/ui/src/styles.css`](../../packages/ui/src/styles.css)의 shadcn HSL 토큰에만 존재합니다. `brand`/`neutral` 계열 커스텀 토큰에는 다크 변형이 없습니다.
- **shadcn HSL 토큰** — `--primary`, `--secondary`, `--destructive` 등 HSL 토큰이 존재하지만 web `@theme`에서 시맨틱 매핑되지 않아 Tailwind 유틸리티로 직접 노출되지 않습니다(주로 `@seoul-moment/ui` 컴포넌트 내부용).

---

## 참고 문서

- [`.claude/references/style.md`](../../.claude/references/style.md) — 스타일/토큰 요약 (Claude용)
- [`packages/ui/.claude/CLAUDE.md`](../../packages/ui/.claude/CLAUDE.md) — 컴포넌트 작성 컨벤션
- [`apps/web/.claude/CLAUDE.md`](./.claude/CLAUDE.md) — web 아키텍처(FSD)·API·i18n·상태관리
