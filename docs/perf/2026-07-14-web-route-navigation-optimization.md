# 웹 라우트 네비게이션 최적화 (perf/web-route-navigation)

> 이슈: [#223](https://github.com/SeoulMomentTech/seoul-moment-fe/issues/223) — perf(web): 라우트 네비게이션 최적화 — 서버 prefetch + HydrationBoundary + loading.tsx
> 대상: `apps/web` (Next.js 16 App Router, Turbopack) · 브랜치: `perf/web-route-navigation`
> 기준일: 2026-07-14

## 1. 배경 / 문제

`apps/web`의 라우트 이동이 느리고 "모든 게 서버에 의존적"이라는 체감 문제에서 출발했다. 전 페이지 진단 결과 **느림의 원인은 프레임워크 한계가 아니라 데이터 페칭 패턴**이었다.

핵심 진단(심각도순):

1. **클라이언트 fetch-on-mount 워터폴** — 서버 prefetch / `HydrationBoundary` / `dehydrate`가 코드베이스에 전무. 뷰가 마운트 후 데이터를 페칭 → `이동 → 빈 화면 → API 왕복 → 콘텐츠`.
2. **`generateMetadata`가 외부 API를 blocking fetch** (product 등) → HTML 전송 지연.
3. **`loading.tsx`가 `brand/[id]` 하나뿐** → 이동 시 즉각 피드백 부재.
4. **`product/[id]` 이중 fetch** — `generateMetadata`와 클라 `useAppQuery`가 같은 상품을 각각 fetch.

다국어(ko/en/zh-TW) SEO·AdSense 인프라를 유지한 채 Next.js 안에서 최적화하는 것이 목표(프레임워크 교체·i18n/SEO 재작성·ISR 정책 변경은 비목표).

## 2. 적용한 패턴

두 가지 SSR 데이터 전달 패턴을 상황에 맞게 사용한다. 둘 다 fetch-on-mount 워터폴을 제거한다.

- **패턴 A — prefetch + HydrationBoundary** (react-query 기반 뷰용)
  서버 컴포넌트에서 `getQueryClient()` → `prefetchQuery`/`prefetchInfiniteQuery` → `<HydrateClient>`로 감싸면, 클라이언트 훅(`useAppQuery`/`useAppInfiniteQuery`)이 **동일한 queryKey**로 하이드레이션된 캐시를 읽어 마운트 시 재요청하지 않는다.
- **패턴 B — promise + `use()` 스트리밍** (일부 상세/목록이 이미 채택)
  async 서버 컴포넌트가 `promise`를 만들어 `"use client"` 자식에 넘기고 자식이 `use(promise)`로 언랩. `<Suspense>`(또는 `loading.tsx`)가 즉각 스켈레톤을 보여준다.

두 패턴 모두에 **`loading.tsx` 스켈레톤**을 더해 이동 즉시 피드백을 준다.

## 3. 변경 요약 (Phase별)

| Phase | 커밋 | 내용 |
|---|---|---|
| 0 — 기반 | `eb1cd9b` | 요청별(서버)/싱글톤(브라우저) QueryClient 팩토리 + 하이드레이션 헬퍼 |
| 1 — 레퍼런스 | `ebfae78` | `product/[id]` 서버 prefetch + 이중 fetch 제거 + loading |
| 2 — 나머지 상세 | `cdd9364` | `promotion` 상세 loading 스켈레톤 |
| 3 — 목록/셸 | `b9929ce` | `product` 목록 above-the-fold prefetch + loading 스켈레톤 |
| fix | `f2fb4a7` | `<body>` 확장 프로그램 하이드레이션 경고 억제 |
| refactor | `cab4c77` | `product/[id]`를 HydrationBoundary → **initialData** 방식으로 전환 |

전체: **17 파일, +546 / −77** (`git diff --stat develop..HEAD`).

### Phase 0 — 기반 (`eb1cd9b`)

- `shared/lib/query/queryClient.ts` — `makeQueryClient()` 팩토리로 QueryCache/MutationCache(Sentry·toast) 설정을 한곳에 모음. `getQueryClient()`는 **서버=요청 스코프(React `cache()`)**, **브라우저=모듈 싱글톤**을 반환. `dehydrate.shouldDehydrateQuery`가 pending 쿼리도 직렬화(스트리밍 하이드레이션), `shouldRedactErrors: false`(Next의 동적 감지 보존).
- `shared/lib/query/HydrateClient.tsx` — `<HydrationBoundary state={dehydrate(getQueryClient())}>` 재사용 래퍼.
- `shared/lib/providers.tsx` — `ReactQueryProvider`를 `getQueryClient()` 소비로 슬림화.
- 동작 변화 없음(브라우저는 여전히 단일 클라이언트).

### Phase 1 — `product/[id]` 레퍼런스 (`ebfae78`)

- `product/[id]/page.tsx` — `getQueryClient().prefetchQuery({ queryKey: ["product-detail", id, locale], ... })` 후 `<HydrateClient>`로 뷰를 감쌈.
- `cache()`로 감싼 `fetchProductDetail`을 `generateMetadata`와 공유 → **상품 API 요청 이동당 2회 → 1회**.
- `ProductDetailLoading` 스켈레톤 + `loading.tsx` 추가.
- (이후 `cab4c77`에서 HydrationBoundary → initialData 방식으로 전환. §8 참고.)

### Phase 2 — `promotion` 상세 (`cdd9364`)

- `views/promotion/ui/PromotionDetailLoading.tsx` — MainBanner → BrandTab → BrandIntroduction → Lookbook 레이아웃을 미러링한 스켈레톤.
- `promotion/[id]/brand/[brandPromotionId]/loading.tsx`, `promotion/[id]/loading.tsx`(리다이렉트 페이지) 추가.
- 이 상세들은 이미 패턴 B(promise + `use()`)로 서버 스트리밍 중이었으므로, 남은 격차인 **즉각 스켈레톤(loading.tsx)** 만 보완.

### Phase 3 — `product` 목록 (`b9929ce`)

- `views/product/ui/ProductListLoading.tsx` + `product/loading.tsx` — 배너/탭/사이드바/그리드 스켈레톤.
- `product/page.tsx` — **above-the-fold 블로킹 쿼리**를 서버에서 채우고 `<HydrateClient>`로 감쌈:
  - 상품 그리드 첫 페이지 (`prefetchInfiniteQuery`, `["products","infinite",params]`, `count:10`)
  - 상품 배너 (`["product","banner"]`)
  - 카테고리 (`["categories", locale]`)
  - 브랜드 필터 (`["brand-filter", locale, undefined]`)
- 이 세 훅(`useProductBanner`/`useCategories`/`useBrandFilter`)은 `useSuspenseQuery`인데 **로컬 Suspense 경계가 없어 페이지 전체를 블로킹**하던 것이 진짜 블랭크 원인이었다.
- **가드**: `searchParams`에 필터 키가 하나라도 있으면(클라 쿼리 키가 기본값과 달라짐) prefetch를 건너뛰고 loading.tsx + 기존 클라 페칭에 맡김 → 회귀 없음.

### fix — `<body>` 하이드레이션 경고 (`f2fb4a7`)

- 브라우저 확장(비밀번호 관리자·번역기 등)이 `<body>`에 `__processed_<uuid>__` 같은 속성을 주입해 실사용자에게도 하이드레이션 경고가 발생. `layout.tsx`의 `<body>`에 `suppressHydrationWarning` 적용(해당 요소 속성 diff만 건너뜀, 자식 콘텐츠 불일치는 그대로 검출).
- Phase 4 검증 중 `/ko/about`에서 발견. 최적화 작업과는 무관.

## 4. 조사로 밝혀진 사실 (계획 대비 실제)

이슈 계획은 home·news·brand 목록도 대상으로 봤으나, 코드 조사 결과:

- **home / news 목록** — 이미 **async 서버 컴포넌트 + `use(promise)` + 섹션별 Suspense 스켈레톤**(패턴 B)으로 above-the-fold 데이터가 서버에서 해소됨. 워터폴이 없어 **추가 prefetch 불필요**. 라우트 레벨 `loading.tsx`는 기존의 풍부한 섹션별 스켈레톤과 겹쳐 오히려 역효과라 추가하지 않음.
- **brand 목록 (`brand/page.tsx`) / `magazine/[id]`** — `<></>`를 반환하는 **미구현 stub**(brand 목록은 noindex). 렌더링할 콘텐츠·데이터가 없어 제외.
- **결론**: 실제 최적화가 필요한 목록/셸 페이지는 **`product` 목록** 하나뿐이었다.

## 5. 검증 (Phase 4)

| 항목 | 방법 | 결과 |
|---|---|---|
| 코드 리뷰 | reviewer 에이전트 (queryKey 해시 일치·prefetch shape·가드·FSD) | correctness 버그 0 |
| 프로덕션 빌드 | `pnpm build:web` | 성공 (63 페이지, 렌더링 모드 회귀 없음) |
| E2E | `playwright test` (chromium) | 1 passed |
| 타입/린트 | `tsc --noEmit`, ESLint | 통과 |
| 네트워크 실측 | Chrome DevTools, `/product` 하드 이동 | prefetch 4개 쿼리 클라 재요청 **0회** (RSC/하이드레이션 전달) |
| 하이드레이션 | 콘솔 (product·promotion) | 미스매치 경고 **0** |
| SEO | `generateMetadata` | 유지 |

### 리뷰 참고사항 (모두 비차단, 확인 완료)

1. **서버 prefetch가 인증 토큰 없이 실행 → `isLiked:false`** — `ProductCard`가 `isLiked`를 사용하지 않고(정적 HeartIcon + 집계 `like` 카운트만 표시) → **시각적 영향 없음, 회귀 아님**.
2. **`searchParams` await로 동적 렌더링 전환** — 요청별 prefetch에 필요한 의도된 트레이드오프. product는 원래도 동적, SEO 영향 없음.
3. **prefetch 실패 시 에러 전파** — `[locale]/error.tsx` 세그먼트 에러 바운더리가 커버 → 우아하게 처리.

## 6. 성공 기준 달성 여부

- ✅ `product/[id]` 상품 API 요청 이동당 2회 → 1회
- ✅ dynamic/목록 라우트 이동 시 스켈레톤 즉시 표시
- ✅ 콘텐츠 표시 시점 단축 (product 목록: above-the-fold 클라 왕복 4건 제거)
- ✅ 하이드레이션 미스매치 경고 0, SEO 메타 회귀 0, e2e 통과

## 7. 데이터 전달 패턴 결정 (initialData vs HydrationBoundary vs use)

세 가지 SSR 데이터 전달 방식이 공존하며, **페이지 성격에 따라 선택**한다. 모두 fetch-on-mount 워터폴을 제거하지만 트레이드오프가 다르다.

| 방식 | 캐시 엔트리 | refetch/무효화 | 다중 쿼리 | 대표 사용처 |
|---|---|---|---|---|
| **순수 `use(promise)`** | ❌ 없음(불변 1회값) | ❌ 불가 | 프롭 전달 | home 6개 섹션, `PromotionPage`, `BrandDetailPage`, `NewsPageContent` — **표시 전용** |
| **initialData** | ✅ 있음 | ✅ 가능 | 훅마다 프롭 | `product/[id]`, promotion `BrandIntroduction` — **단일 쿼리 + 개인화** |
| **HydrationBoundary** | ✅ 있음 | ✅ 가능 | ✅ 경계 1개로 전부 | `product` 목록(쿼리 4개) — **다중 쿼리 셸/목록** |

### `product/[id]`를 initialData로 전환한 이유 (`cab4c77`)

- 상세 페이지는 **좋아요 토글 등 개인화·인터랙션**이 있어 순수 `use(promise)`(불변값)로는 부족 — 캐시 엔트리가 필요.
- 단, 쿼리가 **1개뿐**이라 HydrationBoundary의 "경계 하나로 N개" 이점이 없고, `initialData`가 더 간결.
- 서버 fetch는 인증 토큰 없이 실행되어 `isLiked:false`로 온다. `initialDataUpdatedAt:0`(stale 마킹) + `enabled:isAuthenticated`로 **로그인 사용자만 클라에서 재조회**해 개인화 값을 정확히 채운다(게스트는 재조회 없음). 기존 HydrationBoundary 방식은 `staleTime 5분`으로 fresh 처리되어 authed `isLiked`를 재조회하지 않던 **잠재 신선도 격차를 해소**.
- promotion 상세(`BrandIntroduction`)와 **동일 패턴으로 통일**.

### `product` 목록을 HydrationBoundary로 유지하는 이유

- above-the-fold를 막는 쿼리가 **4개**(`products` 무한 · `banner` · `categories` · `brand-filter`)이며 서로 다른 컴포넌트에 깊이 흩어져 있다.
- `<HydrateClient>` 경계 하나로 4개를 프롭 드릴링 없이 하이드레이션 → initialData(4-way 프롭 전달)보다 명확히 우월.

### `getQueryClient()` 팩토리는 어느 방식에서도 필수 (SSR 요건)

`shared/lib/providers.tsx`의 `ReactQueryProvider`가 이 팩토리로 **앱 전역 QueryClient**를 만든다. SSR(Next.js)에서는 Node 프로세스 하나가 동시 요청을 처리하므로, **서버=요청별 인스턴스(React `cache()`)**로 격리하지 않으면 사용자 간 캐시가 누출된다. **브라우저=싱글톤**으로 네비게이션 간 캐시를 유지한다. (CSR 전용인 `apps/admin`은 `new QueryClient()` 단일 싱글톤으로 충분 — SSR이 아니라 격리 이슈가 없기 때문.) 따라서 이 토대는 initialData/HydrationBoundary 어느 쪽이든 항상 필요하다.

> 참고 — dev 콘솔의 `React instrumentation ... cleaning up async info ... This is a bug in React.`는 React 19.2 **dev 전용 async 계측 버그**로, `use(promise)`+Suspense 스트리밍 이동 시 이따금 발생한다. 프로덕션 빌드에선 계측이 제거되어 나타나지 않으며 기능 영향이 없다. 상류(React/Next) 패치로만 해소된다.

## 8. 후속 과제 (선택)

- product 목록의 하위(below-the-fold) 필터 쿼리(`product-sort-filter`, `product-category`)는 각자 로컬 Suspense 스켈레톤으로 스트리밍 중 — 필요 시 prefetch 확장 가능.
- 필터가 걸린 product 진입(`?brandId=` 등)은 현재 prefetch를 건너뜀 — 서버에서 nuqs 파싱을 정확히 재현하면 필터 케이스도 prefetch 가능(키 해시 일치 주의).
- e2e 커버리지가 홈 스모크 1개뿐 — product/promotion 이동·스켈레톤에 대한 e2e 추가 여지.
