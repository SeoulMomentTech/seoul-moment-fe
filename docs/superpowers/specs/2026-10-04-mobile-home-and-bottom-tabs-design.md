# 서울모먼트 모바일 — 홈 화면과 바텀 탭 설계

- 날짜: 2026-10-04
- 대상: `apps/mobile` (Expo SDK 57, React Native 0.86, Expo Router)
- 상태: 승인됨 (구현 계획 작성 대기)

## 1. 목적과 완성 기준

Expo 템플릿 상태인 `apps/mobile`에 서울모먼트의 **바텀 탭 셸**과 **실제 API로 동작하는 홈 화면**을 만든다.

완성 기준:

1. 바텀 탭이 Home / Shop / News / My 4개로 뜨고 전환된다.
2. 홈이 dev API 실데이터로 배너·프로모션·Now On Sale·News·Article을 렌더한다. (Contact Us 섹션은 모바일 카드에 web과 달리 링크가 없어 제거했다.)
3. 당겨서 새로고침이 홈의 모든 쿼리를 다시 가져온다.
4. 한 섹션의 API가 실패해도 나머지 홈은 정상 렌더된다.
5. `pnpm typecheck:mobile`과 mobile `lint`가 통과한다.

Shop / News / My 탭은 **제목만 있는 플레이스홀더**다. 이번 범위는 탭 셸 + 홈이다.

## 2. 사전 조사 결과

### 2.1 현재 상태

- `src/app/`은 Expo 템플릿이다. `index.tsx`는 "Welcome to Expo" 화면, `explore.tsx`도 템플릿이다.
- 바텀 탭은 이미 존재한다. `src/components/app-tabs.tsx`가 `expo-router/unstable-native-tabs`의 `NativeTabs`로 Home/Explore 2개를 띄우고, root `_layout.tsx`가 직접 렌더한다.
- 인프라는 갖춰져 있다: ky API 클라이언트(토큰 자동 첨부 + 401 리프레시), TanStack Query Provider, Zustand auth store, SecureStore, nativewind, gluestack Button.
- 서비스 함수는 `auth.ts` 하나뿐이다. 홈에 필요한 배너·상품·뉴스·아티클 호출은 없다.

### 2.2 Expo 57 NativeTabs 제약 (공식 문서 확인)

- SDK 57의 import 경로는 `expo-router/unstable-native-tabs`가 맞다. stable 승격은 SDK 58이며 경로가 `expo-router/native-tabs`로 바뀐다.
- Android는 탭 **최대 5개**. 4개라 문제없다.
- 아이콘은 iOS `sf`(SF Symbols), Android `md`(Material Symbols)를 지원한다.
- **FlatList 지원이 제한적**이다(탭 재탭 시 scroll-to-top, edge detection 이슈).
- **탭바 높이를 측정할 수 없다.** `constants/theme.ts`의 `BottomTabInset`(iOS 50 / Android 80) 하드코딩이 이 제약 때문에 존재한다.

### 2.3 API 실측 (`https://api-dev.seoulmoment.com.tw`, 2026-10-04)

| 섹션 | 호출 | dev 응답 |
| --- | --- | --- |
| 배너 | `GET home/v1` → `banner[]` | 1건 (`imageUrl`, `mobileImageUrl`) |
| 프로모션 | `GET home/v1` → `promotion[]` | 1건 (`promotionId`, `title`, `description`, `imageUrl`) |
| Now On Sale | `GET product?page=1&count=4&mainView=true` | `total: 12` |
| News | `GET news/list?count=3` | `total: 3` |
| Article | `GET article/list?count=3` | `total: 3` |

두 가지 함정:

- **`languageCode`를 쿼리 파라미터로 보내면 400이다** (`property languageCode should not exist`). `Accept-language` 헤더여야 한다. mobile의 ky `beforeRequestHandler`가 GET 요청에서 이미 자동 변환하므로, 서비스 함수는 web과 똑같이 `searchParams`에 넣으면 된다.
- 상품 목록 엔드포인트는 `product/list`가 아니라 **`product`** 다.
- web `GetHomeRes`의 `promotionList` 필드는 **dev 응답에 없고 web 코드 어디서도 쓰이지 않는다.** mobile 타입에 넣지 않는다.

## 3. 선택한 접근

**FSD-lite + NativeTabs 유지 + 섹션 자율 쿼리.**

검토한 대안:

- *web FSD 전면 미러링 + Suspense* — 기각. 화면이 홈 하나인 시점에 레이어 5개를 선행 투자한다. 더 중요하게는 web FSD가 RSC(서버에서 promise 생성 → 클라이언트 `use()`)를 전제로 짜여 있어, RN으로 옮기면 이름만 같고 내부는 전혀 다른 코드가 된다.
- *JS Tabs로 교체 + 단일 쿼리 집약* — 보류. 탭바 높이 측정이 가능해져 `BottomTabInset` 하드코딩이 사라지는 건 매력적이지만, 이미 동작하는 NativeTabs를 되돌리고 iOS 26 Liquid Glass 탭바를 포기할 이유가 아직 없다. `(tabs)` 그룹을 분리해 두면 나중의 전환은 `_layout.tsx` 한 파일 교체다.

## 4. 라우팅과 파일 구조

### 4.1 라우팅

현재 root `_layout.tsx`가 NativeTabs를 직접 렌더해서 `src/app/` 아래 모든 파일이 탭 화면이 된다. 상세 화면이나 모달을 올릴 Stack이 없다. 한 겹 분리한다.

```
src/app/
  _layout.tsx            QueryProvider + ThemeProvider + <Stack>, 스플래시
  (tabs)/
    _layout.tsx          <NativeTabs> — Home / Shop / News / My
    index.tsx            홈
    shop.tsx             플레이스홀더
    news.tsx             플레이스홀더
    my.tsx               플레이스홀더
```

- `src/app/explore.tsx`와 템플릿 홈 본문은 삭제한다.
- `src/components/app-tabs.tsx`를 `(tabs)/_layout.tsx`로 옮긴다. `app-tabs.web.tsx`의 웹 분기 구조는 유지한다.
- 탭 아이콘을 PNG `src`에서 `sf` + `md`로 바꾼다. `assets/images/tabIcons/` 6개 파일이 불필요해지므로 삭제한다.
- 상세 화면은 이번 범위 밖이지만, Stack이 생겼으므로 이후 `src/app/product/[id].tsx`를 추가하면 탭 위로 푸시된다.

탭 라벨은 영문 고정: `Home` / `Shop` / `News` / `My`.

### 4.2 레이어

web의 7레이어 FSD를 베끼지 않고 3레이어만 쓴다.

```
src/shared/     services/ (home·product·news·article 추가), lib/, ui/
src/entities/   product-card/, news-row/, article-card/
src/features/   home/ui/ (섹션 컴포넌트), home/model/ (쿼리 훅)
```

`views`·`widgets`는 만들지 않는다 — 화면이 홈 하나라 빈 레이어가 된다.

`tsconfig.json` `paths`에 `@entities/*`, `@features/*`를 추가한다.

## 5. 데이터 계층

### 5.1 서비스 함수

`src/shared/services/`에 web에서 포팅한 4개 파일을 추가한다. 홈이 쓰는 함수와 타입만 가져오고 상세용은 제외한다.

```
home.ts     getHome()         → { banner: BannerImage[]; promotion: HomePromotion[] }
product.ts  getProductList()  → { total, list: ProductItem[] }    // 엔드포인트 "product"
news.ts     getNewsList()     → { total, list: News[] }
article.ts  getArticleList()  → { total, list: Article[] }
```

기기 언어는 `src/shared/lib/i18n/useLanguage.ts`로 감싼다. 기존 `getDeviceLanguage()`를 호출하되 앱이 포그라운드로 복귀할 때 재평가한다(사용자가 설정에서 언어를 바꾸고 돌아오는 경우).

### 5.2 쿼리 훅

`src/features/home/model/`에 섹션별 훅을 둔다.

| 훅 | queryKey | 호출 |
| --- | --- | --- |
| `useHomeBanner()` | `["home","prime",lang]` | `getHome()`, `select: d => d.banner[0]` |
| `useHomePromotion()` | `["home","prime",lang]` | `getHome()`, `select: d => d.promotion` |
| `useNowOnSale()` | `["home","product",lang]` | `getProductList({ page: 1, count: 4, mainView: true })` |
| `useHomeNews()` | `["home","news",lang]` | `getNewsList({ count: 3 })` |
| `useHomeArticle()` | `["home","article",lang]` | `getArticleList({ count: 3 })` |

배너와 프로모션은 같은 `home/v1`을 쓰지만 **queryKey가 같으므로 네트워크 요청은 1회**다. TanStack Query 캐시가 합치고, 각 훅은 `select`로 자기 조각만 꺼낸다.

키 접두사를 `"home"`으로 통일했으므로 당겨서 새로고침은 `refetchQueries({ queryKey: ["home"] })` 한 번이다.

`queryClient` 기본값(`retry: false`, `staleTime: 5분`)을 그대로 쓴다.

## 6. 홈 화면 구성

C안(혼합 레이아웃) — 섹션 성격에 따라 캐러셀 / 그리드 / 리스트를 가른다.

```
(tabs)/index.tsx
  ScrollView + RefreshControl
    <HeroBanner />         banner[0].mobileImageUrl, 16:9
    <PromotionSection />   promotion
    <NowOnSaleSection />   2열 그리드 4개 + "View all"
    <NewsSection />        썸네일 행 3개
    <ArticleSection />     썸네일 행 3개
```

Contact Us 섹션은 뺐다. web의 `ContactUS`는 카드가 `/contact` 링크지만 모바일 카드에는 링크가 없어, 눌리지 않는 CTA가 되기 때문이다.

### 6.1 프로모션은 개수에 따라 모양이 바뀐다

dev 응답에 `promotion`이 1건뿐이다. web처럼 `[0]`(SeasonCollection)과 `slice(1)`(PromotionList)로 쪼개면 둘째 섹션이 항상 비어 있다. mobile은 하나의 섹션으로 합치고 길이로 분기한다.

- `length === 0` → 섹션을 렌더하지 않는다
- `length === 1` → 전체 폭 히어로 카드 하나
- `length >= 2` → 가로 스냅 캐러셀

`description`에 `\n`이 포함돼 있다(dev 실데이터 확인). 카드에서는 `numberOfLines`로 자른다.

### 6.2 리스트 구현

가로 캐러셀만 `FlatList horizontal`을 쓴다. 2열 그리드(4개)와 뉴스·아티클 행(3개)은 `View` + `map`으로 그린다.

근거: 항목 수가 고정이라 가상화 이득이 없고, NativeTabs가 FlatList 지원이 제한적이라고 문서에 명시돼 있어 세로 가상화 리스트를 외부 `ScrollView` 안에 중첩시키지 않는 편이 안전하다.

이미지는 `expo-image`의 `Image`를 쓴다(이미 설치·사용 중).

### 6.3 로딩 · 에러 · 빈 상태

섹션마다 자기 것을 갖는다.

- **로딩**: 섹션별 스켈레톤(해당 섹션 높이의 회색 블록)
- **에러**: "불러오지 못했습니다 + 다시 시도" 한 줄로 접히고, 나머지 홈은 그대로 렌더된다
- **빈 배열**: 섹션 자체를 렌더하지 않는다 (web `SeasonCollection`과 동일한 동작)

web이 `ErrorBoundary + Suspense`로 얻는 섹션 격리를, RN에서는 각 섹션이 자기 쿼리의 `isPending` / `isError`를 직접 읽어 구현한다.

### 6.4 당겨서 새로고침

루트 `ScrollView`에 `RefreshControl`을 붙이고 `refetchQueries({ queryKey: ["home"] })`를 호출한다.

## 7. 스타일링

### 7.1 라이트 모드 고정

mobile에 색 소스가 둘이다.

- `src/global.css` → `@seoul-moment/tailwind-config/tokens` — 서울모먼트 브랜드 토큰. **라이트 값만 있다.**
- `src/constants/theme.ts` → `Colors.light` / `Colors.dark` — Expo 템플릿 잔재. 흑백 팔레트, 브랜드색 없음.

`app.json`이 `userInterfaceStyle: "automatic"`이고 `_layout.tsx`가 `DarkTheme`을 켜므로, 브랜드 토큰으로 홈을 그리면 다크 모드에서 라이트 토큰이 어두운 네비게이션 테마 위에 얹혀 깨진다.

**라이트 고정으로 간다.**

- `app.json`의 `userInterfaceStyle`을 `"light"`로 바꾼다
- `_layout.tsx`에서 `useColorScheme` 기반 `DarkTheme` 분기를 제거한다

브랜드 토큰에 다크 값이 없고 web에도 다크 테마가 없다. 지금 다크를 지원하면 mobile만 자체 팔레트를 들고 가게 된다. 디자인에서 다크 토큰이 나오면 `packages/tailwind-config/tokens.css`에 추가해 두 앱이 같이 움직이게 한다.

### 7.2 스타일 작성 방식

- 홈 UI는 **nativewind 클래스 + 브랜드 토큰**으로 작성한다 (`bg-brand`, `text-title-3`, `text-neutral` 등)
- `constants/theme.ts`의 `Colors`는 **네이티브 탭바 전용**으로만 남긴다. NativeTabs는 className이 아니라 색 값을 요구한다
- 라이트 고정이므로 `(tabs)/_layout.tsx`는 `useColorScheme()` 분기 없이 `Colors.light`를 직접 쓴다. `Colors.dark`는 다크 모드를 다시 켤 때까지 쓰이지 않는다
- `ThemedText` / `ThemedView`는 홈에서 쓰지 않는다
- 치수는 기존 `Spacing` 상수를, 하단 여백은 `BottomTabInset`을 쓴다

`explore.tsx`와 템플릿 홈을 지우고 나면 참조가 끊기는 템플릿 컴포넌트(`hint-row`, `web-badge`, `themed-text`, `themed-view`, `ui/collapsible`, `use-color-scheme` 등)가 생긴다. 참조가 0이 된 것만 함께 삭제한다. 스플래시에 쓰이는 `animated-icon`은 남긴다.

## 8. 환경 설정

`apps/mobile`에 `.env`가 없어서 `EXPO_PUBLIC_API_BASE_URL`이 비고, 개발 중에도 **프로덕션 API(`api.seoulmoment.com.tw`)로 붙는다.** web은 `api-dev`를 본다.

`apps/mobile/.env`를 추가한다:

```
EXPO_PUBLIC_API_BASE_URL=https://api-dev.seoulmoment.com.tw
```

## 9. 검증

`apps/mobile`에는 테스트 인프라가 없다(jest도 vitest도, 설정도 스크립트도 없음). RN 테스트 스택 도입은 **이번 범위 밖**으로 합의했다. 이번 검증은 다음 셋이다.

1. `pnpm typecheck:mobile` (TS 7)
2. `pnpm --filter @seoul-moment/mobile lint`
3. iOS 시뮬레이터 수동 확인
   - 탭 4개 전환
   - 홈 5개 섹션 렌더 (배너·프로모션·Now On Sale·News·Article)
   - 당겨서 새로고침
   - 섹션 실패 격리 — `getNewsList`의 엔드포인트 경로를 일시적으로 잘못된 값으로 바꿔, News 섹션만 에러 줄로 접히고 배너·프로모션·Now On Sale·Article이 정상 렌더되는지 확인한 뒤 되돌린다

## 10. 범위 밖

명시적으로 하지 않는 것:

- Shop / News / My 탭의 실제 화면 — 제목만 있는 플레이스홀더
- 상세 화면(`product/[id]`, `news/[id]`, `article/[id]`) — Stack 자리만 만들어 둔다
- UI 문구 다국어 — 탭 라벨·섹션 제목은 영문 고정. API 콘텐츠는 `Accept-language`로 이미 현지화된다
- 장바구니, 로그인 플로우, 좋아요 토글
- 다크 모드
- RN 테스트 스택 도입

## 11. 이후로 미룬 결정

- **테스트 스택**: jest-expo + @testing-library/react-native 도입. 화면이 늘어나면 다시 논의한다.
- **JS Tabs 전환**: `BottomTabInset` 하드코딩이 실제로 문제를 일으키면 `(tabs)/_layout.tsx` 교체로 전환한다.
- **다크 모드**: `packages/tailwind-config/tokens.css`에 다크 토큰이 생기는 시점.
- **SDK 58 업그레이드 시**: NativeTabs import 경로를 `expo-router/unstable-native-tabs` → `expo-router/native-tabs`로 바꿔야 한다.
