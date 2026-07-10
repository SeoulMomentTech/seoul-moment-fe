---
name: web-page-builder
description: apps/web(Next.js 15, FSD)에 새로운 페이지/화면을 만들 때 사용합니다. DESIGN.md 디자인 시스템과 FSD 아키텍처를 기준으로, Figma 프레임·참고 페이지·텍스트 요구사항·아이디어 중 무엇이 주어지든 라우트 배치부터 구현·i18n·데이터 연동·검증까지 안내합니다. "새 페이지 만들어줘", "이 화면 구현해줘", "○○ 페이지 추가", "이 Figma로 페이지 만들어줘", "이런 페이지가 필요한데" 같은 요청에 web 앱 대상이면 반드시 사용하세요. 디자인이 아직 없어도(요구사항만 있거나 막연한 아이디어여도) 사용합니다.
---

# Web Page Builder

`apps/web`(Next.js 15 · Feature-Sliced Design · next-intl · TanStack Query)에 **새 페이지를 처음부터 만드는** 작업을 안내하는 오케스트레이터 스킬입니다.

핵심 아이디어는 두 가지입니다.

1. **스타일 가드레일과 레이아웃 명세를 분리한다.** `apps/web/DESIGN.md`(디자인 시스템)가 "무엇을 쓸지"(토큰·컴포넌트)를 정하고, 사용자가 주는 입력(Figma/참고 페이지/요구사항)이 "어떻게 생겼는지"(레이아웃)를 정합니다. 둘 다 확보하면 결과가 프로젝트 톤에 맞으면서도 정확합니다.
2. **입력이 부족하면 채우고 시작한다.** 디자인도 요구사항도 없으면 곧장 코드를 짜지 말고, 먼저 무엇을 만들지 합의합니다. 막연한 상태에서 만든 페이지는 대부분 다시 만들게 됩니다.

## 0. 먼저 읽을 것

구현 전에 반드시 확인하세요. 프로젝트 관례를 벗어난 코드는 리뷰·린트에서 막힙니다.

- **`apps/web/DESIGN.md`** — 컬러/타이포/duration 토큰, `@seoul-moment/ui` 컴포넌트 카탈로그, 반응형·애니메이션·아이콘·슬라이더 규칙, i18n UI 규칙. 이 스킬의 스타일 기준점입니다.
- **`apps/web/.claude/CLAUDE.md`** — FSD 레이어, 경로 alias, API(ky)·쿼리 훅 래퍼, i18n·상태관리 규칙.
- 비슷한 기존 페이지 1개 — `apps/web/src/views/<유사페이지>/`를 열어 실제 조합 방식을 눈으로 확인합니다. 새 패턴을 발명하기 전에 검증된 패턴을 재사용하세요.

## 1. 입력 모드 판별

사용자가 무엇을 줬는지에 따라 진행이 달라집니다. 아래 표에서 해당하는 행으로 갑니다. 애매하면 사용자에게 물어보세요 — 잘못된 가정으로 만든 페이지는 비쌉니다.

| 입력 | 처리 |
| --- | --- |
| **Figma 프레임 링크** (`node-id`가 특정 프레임을 가리킴) | §2-A. 가장 정확. `figma-to-code` 스킬에 위임 |
| **참고할 기존 페이지** ("news처럼") | §2-B. 해당 `views/` 구조를 본떠 구현 |
| **텍스트 요구사항** (섹션·데이터·인터랙션 서술) | §2-C. DESIGN.md 재료로 레이아웃을 직접 설계 |
| **막연한 아이디어** ("이런 게 필요한데") | §2-D. 먼저 브레인스토밍으로 요구사항을 확정 |
| **전체 Figma 파일 링크** (프레임 미지정) | 통째로는 너무 큼. 만들 화면의 프레임 링크(Copy link to selection)를 요청 |

> Figma가 있으면 언제나 최우선입니다. 픽셀 단위 레이아웃까지 확보되기 때문입니다. 없으면 참고 페이지 > 요구사항 > 아이디어 순으로 정확도가 떨어지며, 그만큼 레이아웃 판단을 사용자와 더 맞춰야 합니다.

## 2. 구현

### 2-A. Figma 프레임이 있을 때

1. `figma-to-code` 스킬을 사용해 해당 프레임을 코드로 변환합니다. 이 스킬이 Tailwind v4 토큰 매핑과 `@seoul-moment/ui` 우선 사용을 이미 안내합니다.
2. §3(FSD 배치)·§4(연동)에 맞춰 파일을 배치하고 라우트·데이터를 연결합니다.
3. 구현 후 `verify-against-figma` 스킬로 스크린샷·토큰·반응형 3축 검증을 돌립니다.

### 2-B. 참고 페이지가 있을 때

1. 참고 페이지의 `views/`·연관 `widgets/`·`features/` 구조를 파악합니다.
2. 같은 조합 방식(섹션 컴포넌트 분리, 데이터 훅 사용, 반응형 분기)을 따라 새 페이지를 만듭니다. 다른 점만 바꾸고 검증된 뼈대는 유지합니다.

### 2-C. 텍스트 요구사항만 있을 때

1. 요구사항을 섹션 단위로 분해합니다(히어로, 목록, 필터, CTA 등).
2. 각 섹션을 DESIGN.md의 토큰·컴포넌트로 구성합니다. 레이아웃 프리미티브(`VStack`/`HStack`/`Flex`)와 기존 위젯(`shared/ui`, `widgets/`)을 우선 재사용합니다.
3. 모바일 퍼스트로 기본 스타일을 짜고 `sm:`로 데스크탑을 얹습니다. 구조가 크게 다르면 데스크탑/모바일 컴포넌트를 분리합니다(DESIGN.md §6).
4. 확신이 안 서는 레이아웃 결정(섹션 순서, 강조 요소 등)은 추측하지 말고 사용자에게 확인합니다.

### 2-D. 아이디어만 있을 때

`superpowers:brainstorming` 스킬로 먼저 목적·대상·핵심 섹션·데이터·인터랙션을 사용자와 확정합니다. 요구사항이 잡히면 2-C로 넘어갑니다.

## 3. FSD 배치

새 코드를 어느 레이어에 둘지 결정합니다. 하향 단방향 임포트(`app → views → widgets → features → entities → shared`)를 지킵니다.

- **`app/[locale]/<route>/page.tsx`** — 라우트 진입점. 얇게 유지하고 `views/`의 페이지 컴포넌트를 렌더만 합니다. 메타데이터(`generateMetadata`)는 여기서.
- **`views/<page>/`** — 페이지 전체 조합(라우트당 1개). `ui/`에 페이지 컴포넌트 + `index.tsx` 배럴.
- **`widgets/<block>/`** — 여러 곳에서 재사용되는 복합 블록.
- **`features/<name>/`** — 사용자 상호작용/액션 로직.
- **`entities/<model>/`** — 데이터를 표시만 하는 도메인 컴포넌트.
- **`shared/`** — web 전용 범용 유틸/프리미티브. 범용 기본 컴포넌트는 여기가 아니라 `@seoul-moment/ui`.
- 상호작용(`onClick`, `useState` 등)이 있으면 파일 최상단에 `"use client";`.
- 이미지는 `shared/ui/base-image.tsx`(next/image 래퍼)를 쓰고 정적 파일은 `public/`에 둡니다.

## 4. 연동 (routing · i18n · data)

- **라우팅**: `useRouter`/`Link`/`redirect`/`usePathname`는 반드시 `@/i18n/navigation`에서 import합니다(never `next/navigation`). `[locale]` 세그먼트가 유지됩니다.
- **i18n 텍스트**: 하드코딩하지 말고 `useTranslations`로 주입합니다. 번역의 원천(source of truth)은 Google Sheets이고 `messages/{ko,en,zh-TW}.json`은 `pnpm i18n:sync`로 **내려받는** 산출물입니다. 따라서 새 문구는 시트에 추가한 뒤 sync하는 것이 원칙이며, 로컬 개발 중에는 JSON에 임시로 넣더라도 시트에 반영하지 않으면 다음 sync에서 사라질 수 있음을 사용자에게 알리세요. ko/en/zh-TW 길이 차이를 견디도록 고정폭을 피합니다.
- **데이터**: 서버 상태는 `@tanstack/react-query` 직접 사용이 ESLint로 금지됩니다. `src/shared/lib/hooks/query/`의 래퍼(`useAppQuery`/`useAppMutation`/`useAppInfiniteQuery`)를 씁니다. API 함수는 `src/shared/services/`에 ky 기반으로 둡니다. (자세한 건 `.claude/CLAUDE.md`의 API 섹션. Swagger가 있으면 `swagger-to-code`·`api-to-hook` 스킬 활용)

## 5. SEO 메타데이터

새 라우트는 검색·공유 노출을 위해 메타데이터를 채웁니다. 프로젝트에 확립된 패턴을 그대로 따르세요.

- **기본 메타데이터**: 라우트의 `page.tsx`에 `generateMetadata`를 두고 `next-intl/server`의 `getTranslations()`로 `title`/`description`을 채웁니다. 문구는 i18n이므로 하드코딩하지 말고 `seo_<page>_title` / `seo_<page>_description` 키 컨벤션을 씁니다(예: `seo_news_title`). 데이터 fetch가 있으면 `try/catch`로 감싸 실패 시 `{}`를 반환하는 것이 기존 관례입니다.
- **공유 중요한 페이지**(상세·랜딩 등)는 `openGraph`(title/description/images/type)를 추가합니다. 설명은 `stripHtml(...).slice(0, 160)`처럼 정제·길이 제한합니다. 절대 URL은 `@shared/constants/env`의 `BASE_URL`을 씁니다.
- **콘텐츠 페이지**(기사/뉴스 등)는 `shared/ui/structured-data-script.tsx`의 `StructuredDataScript`로 schema.org JSON-LD를 주입합니다.
- **동적 라우트**(`[id]`)는 `generateStaticParams` + `revalidate` 적용을 검토하고, 메타데이터 에러는 `reportMetadataError`로 로깅합니다.
- 대표 참고 파일: `app/[locale]/news/page.tsx`(목록), `app/[locale]/news/[id]/page.tsx`(상세 + openGraph + JSON-LD). 사이트맵은 `app/sitemap.ts`.
- 메타데이터/구조화 데이터 설계가 복잡하면 `seo-expert` 에이전트에 위임하세요.

## 6. 접근성 (a11y)

시맨틱 마크업을 기본으로 삼으면 대부분의 접근성이 자연스럽게 해결됩니다. 프로젝트에서 이미 쓰는 패턴을 따르세요.

- **시맨틱 태그**: 레이아웃 프리미티브의 `as` prop으로 `main`/`section`/`nav`/`header` 등 의미 있는 태그를 씁니다(`<VStack as="section">`). 클릭 요소는 `div + onClick`이 아니라 실제 `<button>`/`<a>`(또는 `@seoul-moment/ui`의 `Button`)를 씁니다.
- **아이콘/텍스트 대체**: 아이콘 전용 버튼에는 `aria-label`을, 장식용 아이콘에는 `aria-hidden`을 붙입니다. 시각 정보만 있고 텍스트가 없으면 `sr-only`로 스크린리더용 텍스트를 병기합니다(프로젝트에서 이미 사용 중).
- **상태 전달**: 토글은 `aria-pressed`, 로딩 영역은 `aria-busy`, 폼 에러/도움말은 `aria-describedby`로 연결합니다.
- **폼**: `@seoul-moment/ui`의 `Form`/`Label`을 써서 라벨-입력을 연결하고, `react-hook-form` + `zod` 검증 메시지를 `aria-describedby`로 노출합니다.
- **이미지**: `base-image.tsx`(next/image)에 의미 있는 `alt`를 넣고, 순수 장식 이미지는 빈 `alt`로 둡니다.
- **포커스**: 전역 `focus-visible` 링이 투명하게 리셋되어 있으므로(DESIGN.md §3), 커스텀 인터랙션 요소는 눈에 보이는 포커스 스타일을 직접 지정하고 키보드 탭 순서를 확인합니다.

## 7. 검증

구현이 "된 것 같다"가 아니라 실제로 동작함을 확인합니다.

- **Figma 기반이면** `verify-against-figma`로 디자인 대조.
- **접근성**: `chrome-devtools-mcp:a11y-debugging` 스킬로 시맨틱·포커스·대비·탭 타깃을 점검합니다.
- **공통**: `pnpm lint:fix:web`으로 린트/임포트 순서를 맞춥니다(husky가 커밋을 막으므로 필수). 가능하면 `pnpm dev:web`으로 실제 라우트를 열어 렌더·반응형·다국어 전환을 눈으로 확인합니다.
- 커밋 요청을 받았다면 `commit-helper`를 씁니다.

## 활용 팁

- 이 스킬은 만능 구현기가 아니라 **판을 깔아주는 오케스트레이터**입니다. 실제 변환·검증·커밋은 각 전용 스킬(`figma-to-code`, `verify-against-figma`, `swagger-to-code`, `api-to-hook`, `commit-helper`)에 위임하세요.
- 규모가 크거나 여러 화면을 한 번에 만드는 작업이면 먼저 계획을 세워 사용자와 합의한 뒤 착수하는 편이 안전합니다.
