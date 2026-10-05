# 서울모먼트 모바일 홈 화면 + 바텀 탭 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/mobile`의 Expo 템플릿을 걷어내고, 서울모먼트 바텀 탭 4개와 dev API 실데이터로 동작하는 홈 화면을 만든다.

**Architecture:** root `_layout.tsx`가 Provider + `Stack`을 들고, `(tabs)` 그룹이 `NativeTabs`로 Home/Shop/News/My를 렌더한다. 홈은 하나의 `ScrollView` 안에 섹션 컴포넌트를 나열하고, 각 섹션이 자기 쿼리(`useAppQuery`)를 소유해 자기 스켈레톤·에러를 직접 그린다. 폴더는 `shared / entities / features` 3레이어다.

**Tech Stack:** Expo SDK 57, React Native 0.86, Expo Router (`unstable-native-tabs`), TanStack Query v5, ky, nativewind v5 + `@seoul-moment/tailwind-config` 토큰, expo-image, TypeScript 7

**Spec:** `docs/superpowers/specs/2026-10-04-mobile-home-and-bottom-tabs-design.md`

## Global Constraints

- Expo SDK 57이므로 NativeTabs import 경로는 `expo-router/unstable-native-tabs`다. `expo-router/native-tabs`는 SDK 58부터다.
- `@tanstack/react-query`의 `useQuery` / `useMutation` 직접 import는 **ESLint가 막는다**(`no-restricted-imports`). 반드시 `useAppQuery` / `useAppMutation`을 쓴다.
- `languageCode`는 서비스 함수에서 `searchParams`에 넣는다. ky의 `beforeRequestHandler`가 GET 요청에서 이를 떼어 `Accept-language` 헤더로 옮긴다. **쿼리 파라미터로 서버에 도달하면 400**이다.
- 상품 목록 엔드포인트는 `product`다. `product/list`가 아니다.
- UI 문구는 **영문 고정**이다. i18n 라이브러리를 추가하지 않는다.
- **라이트 모드 고정**이다. 다크 분기를 새로 만들지 않는다.
- 색은 nativewind 클래스 + 브랜드 토큰(`text-foreground`, `text-neutral`, `bg-neutral-subtle`, `text-brand`)을 쓴다. `constants/theme.ts`의 `Colors`는 NativeTabs 전용이다.
- Expo/RN 패키지를 추가해야 하면 `pnpm add`가 아니라 `npx expo install <package>`를 쓴다. **이 계획은 새 의존성을 추가하지 않는다.**
- `ios/`·`android/` 디렉터리는 CNG로 생성된다. 손으로 만들거나 고치지 않는다.
- 커밋 메시지는 conventional commits + 영문이고, 마지막 줄은 `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`다.

## Review Focus

`apps/mobile`에는 테스트 인프라가 없다(아래 "검증 사이클" 참고). 아래 다섯은 스펙이 함축하지만 어떤 자동 검사도 잡아주지 않는 것들이다. 각 항목은 담당 Task의 수동 검증 단계로 들어간다.

1. **`banner` 또는 `promotion`이 빈 배열** — `banner[0]`이 `undefined`가 되어 히어로가 깨지거나 빈 이미지가 남는다. 기대 동작: 해당 섹션을 렌더하지 않는다. → Task 6
2. **오프라인 상태로 홈 진입** — `onlineManager`가 쿼리를 `paused`로 두면 `isPending`이 유지되어 스켈레톤이 영원히 돈다. 기대 동작: 스켈레톤이 아니라 에러 줄을 보여주고 재시도를 제공한다. → Task 8
3. **`title`·`description`에 줄바꿈과 긴 문자열** — dev `promotion[0].description`에 실제로 `\n`이 3개 있다. 기대 동작: `numberOfLines`로 잘려 카드 높이가 흔들리지 않는다. → Task 6
4. **이미지 URL이 404이거나 느릴 때** — `expo-image`가 빈 칸을 남긴다. 기대 동작: 자리 높이가 유지되고 레이아웃이 점프하지 않는다. → Task 4
5. **새로고침 진행 중 다시 당김** — `refetchQueries`가 중복 실행된다. 기대 동작: 진행 중이면 무시한다. → Task 8

## 검증 사이클 (TDD 대신)

`apps/mobile`에는 jest도 vitest도, 설정도 스크립트도 없다. 스펙에서 **RN 테스트 스택 도입은 범위 밖**으로 합의했다. 따라서 각 Task는 실패하는 테스트 대신 아래 사이클로 닫는다.

```bash
pnpm typecheck:mobile                      # TS 7
pnpm --filter @seoul-moment/mobile lint    # ESLint
```

여기에 Task별 **시뮬레이터 수동 확인**을 더한다. 개발 서버는 `pnpm dev:mobile` (레포 루트)로 띄우고, iOS 시뮬레이터는 터미널에서 `i`를 누른다.

각 Task는 두 명령이 통과하고 수동 확인 항목이 끝난 뒤에만 커밋한다.

---

## File Structure

### 새로 만드는 파일

| 경로 | 책임 |
| --- | --- |
| `apps/mobile/.env` | dev API base URL |
| `src/app/(tabs)/_layout.tsx` | NativeTabs 4탭 (네이티브) |
| `src/app/(tabs)/_layout.web.tsx` | expo-router/ui Tabs (웹) |
| `src/app/(tabs)/index.tsx` | 홈 화면 조립 |
| `src/app/(tabs)/shop.tsx` | Shop 플레이스홀더 |
| `src/app/(tabs)/news.tsx` | News 플레이스홀더 |
| `src/app/(tabs)/my.tsx` | My 플레이스홀더 |
| `src/shared/lib/i18n/useLanguage.ts` | 기기 언어 훅 (포그라운드 재평가) |
| `src/shared/services/home.ts` | `getHome` — 배너·프로모션 |
| `src/shared/services/product.ts` | `getProductList` |
| `src/shared/services/news.ts` | `getNewsList` |
| `src/shared/services/article.ts` | `getArticleList` |
| `src/shared/ui/screen-placeholder/index.tsx` | 탭 플레이스홀더 공용 |
| `src/shared/ui/section/index.tsx` | 섹션 제목 + 본문 틀 |
| `src/shared/ui/section-state/index.tsx` | `SectionSkeleton`, `SectionError` |
| `src/entities/product/ui/ProductCard.tsx` | 상품 카드 |
| `src/entities/post/ui/PostRow.tsx` | 뉴스·아티클 공용 썸네일 행 |
| `src/features/home/model/useHomePrime.ts` | `useHomeBanner`, `useHomePromotion` |
| `src/features/home/model/useHomeLists.ts` | `useNowOnSale`, `useHomeNews`, `useHomeArticle` |
| `src/features/home/model/useRefreshHome.ts` | 당겨서 새로고침 |
| `src/features/home/ui/HeroBanner.tsx` | 배너 섹션 |
| `src/features/home/ui/PromotionSection.tsx` | 프로모션 섹션 (1건/N건 분기) |
| `src/features/home/ui/NowOnSaleSection.tsx` | 상품 2열 그리드 |
| `src/features/home/ui/NewsSection.tsx` | 뉴스 행 3개 |
| `src/features/home/ui/ArticleSection.tsx` | 아티클 행 3개 |
| `src/features/home/ui/ContactSection.tsx` | 정적 CTA (이후 제거됨 — 모바일 카드에는 web과 달리 링크가 없어 삭제했다) |
| `src/features/home/index.ts` | 섹션 배럴 |

### 수정하는 파일

| 경로 | 변경 |
| --- | --- |
| `.gitignore` (레포 루트) | `.superpowers/` 추가 |
| `apps/mobile/app.json` | `userInterfaceStyle: "automatic"` → `"light"` |
| `apps/mobile/tsconfig.json` | `paths`에 `@entities/*`, `@features/*` 추가 |
| `src/app/_layout.tsx` | 다크 분기 제거, `<AppTabs/>` → `<Stack/>` |

### 지우는 파일

Task 2에서 한꺼번에 지운다. 참조가 0이 되는 것만이다.

```
src/app/index.tsx                     → (tabs)/index.tsx 로 대체
src/app/explore.tsx
src/components/app-tabs.tsx           → (tabs)/_layout.tsx 로 이동
src/components/app-tabs.web.tsx       → (tabs)/_layout.web.tsx 로 이동
src/components/hint-row.tsx
src/components/web-badge.tsx
src/components/external-link.tsx
src/components/themed-text.tsx
src/components/themed-view.tsx
src/components/ui/collapsible.tsx
src/hooks/use-theme.ts
src/hooks/use-color-scheme.ts
src/hooks/use-color-scheme.web.ts
assets/images/tabIcons/               (6개 파일)
assets/images/react-logo.png, react-logo@2x.png, react-logo@3x.png
assets/images/tutorial-web.png
assets/images/expo-badge.png, expo-badge-white.png
```

`src/components/animated-icon.*`와 `assets/images/expo-logo.png`, `logo-glow.png`는 **남긴다** — `_layout.tsx`의 스플래시 오버레이가 쓴다. (스플래시가 아직 Expo 로고인 것은 이 계획의 범위 밖이다.)

---

## Task 1: 환경 설정과 라이트 모드 고정

dev API를 바라보게 하고, 다크 모드 분기를 걷어내고, 새 레이어의 import 별칭을 연다. 홈 코드가 들어오기 전에 토대를 먼저 고정한다.

**Files:**
- Create: `apps/mobile/.env`
- Modify: `.gitignore` (레포 루트)
- Modify: `apps/mobile/app.json`
- Modify: `apps/mobile/tsconfig.json`
- Modify: `apps/mobile/src/app/_layout.tsx`

**Interfaces:**
- Consumes: 없음 (첫 Task)
- Produces: `@entities/*`, `@features/*` 경로 별칭. root `_layout.tsx`가 `<Stack>`을 렌더하므로 Task 2가 `(tabs)` 그룹을 그 아래 붙일 수 있다.

- [ ] **Step 1: dev API를 가리키는 `.env`를 만든다**

현재 `apps/mobile`에 `.env`가 없어서 `EXPO_PUBLIC_API_BASE_URL`이 비고, `src/shared/services/index.ts`의 폴백인 **프로덕션** API로 붙는다.

`apps/mobile/.env`:

```
EXPO_PUBLIC_API_BASE_URL=https://api-dev.seoulmoment.com.tw
```

- [ ] **Step 2: `.gitignore`에 브레인스토밍 산출물을 추가한다**

레포 루트 `.gitignore` 맨 끝에 추가:

```
# superpowers brainstorming mockups
.superpowers/
```

- [ ] **Step 3: `app.json`을 라이트 고정으로 바꾼다**

`apps/mobile/app.json`에서 `"userInterfaceStyle": "automatic"`을 찾아 바꾼다:

```json
    "userInterfaceStyle": "light",
```

- [ ] **Step 4: `tsconfig.json`에 레이어 별칭을 추가한다**

`apps/mobile/tsconfig.json`의 `compilerOptions.paths`를 다음으로 교체한다:

```json
    "paths": {
      "@/*": ["./src/*"],
      "@/assets/*": ["./assets/*"],
      "@shared/*": ["./src/shared/*"],
      "@entities/*": ["./src/entities/*"],
      "@features/*": ["./src/features/*"]
    }
```

- [ ] **Step 5: root `_layout.tsx`에서 다크 분기를 빼고 `Stack`으로 바꾼다**

`apps/mobile/src/app/_layout.tsx` 전체를 다음으로 교체한다. `AppTabs`를 직접 렌더하던 것을 `Stack`으로 바꿔 상세 화면이 올라갈 자리를 만든다. `(tabs)` 그룹은 Task 2에서 생기므로, 이 Step 직후에는 라우트가 없어 앱이 빈 화면이 된다 — 정상이다.

```tsx
import "@/global.css";

import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { hydrateUserAuth } from "@shared/lib/auth/useUserAuthStore";
import { QueryProvider } from "@shared/lib/query/QueryProvider";

import { AnimatedSplashOverlay } from "@/components/animated-icon";

SplashScreen.preventAutoHideAsync();
// 첫 화면이 그려지는 동안 SecureStore 에서 토큰을 미리 복원해 둔다.
void hydrateUserAuth();

export default function RootLayout() {
  return (
    <QueryProvider>
      {/* 브랜드 토큰에 다크 값이 없어 라이트로 고정한다. app.json 의
          userInterfaceStyle 도 "light" 다. */}
      <ThemeProvider value={DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </QueryProvider>
  );
}
```

- [ ] **Step 6: 타입체크와 린트를 돌린다**

```bash
pnpm typecheck:mobile
pnpm --filter @seoul-moment/mobile lint
```

기대: `src/app/index.tsx`와 `src/app/explore.tsx`가 아직 남아 있으므로 통과한다. `(tabs)` 라우트가 없다는 것은 타입 에러가 아니다.

- [ ] **Step 7: 커밋**

```bash
git add apps/mobile/.env apps/mobile/app.json apps/mobile/tsconfig.json \
        apps/mobile/src/app/_layout.tsx .gitignore
git commit -m "$(cat <<'EOF'
chore(mobile): point dev builds at the dev API and fix the light theme

The app had no .env, so EXPO_PUBLIC_API_BASE_URL fell back to production
while web reads api-dev.

The brand tokens in @seoul-moment/tailwind-config have no dark variants,
so the dark navigation theme rendered light token colors on a dark
surface. Pin userInterfaceStyle to light and drop the scheme branch.

Also swap the root layout's direct tab render for a Stack, so detail
screens have somewhere to push onto.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: 탭 셸과 템플릿 제거

Home/Shop/News/My 4탭을 세우고, Expo 템플릿 잔재를 한 번에 걷어낸다. 홈은 아직 플레이스홀더다 — Task 8에서 채운다.

**Files:**
- Create: `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/_layout.web.tsx`
- Create: `src/app/(tabs)/index.tsx`, `shop.tsx`, `news.tsx`, `my.tsx`
- Create: `src/shared/ui/screen-placeholder/index.tsx`
- Delete: 위 "지우는 파일" 목록 전체

**Interfaces:**
- Consumes: Task 1의 `<Stack><Stack.Screen name="(tabs)" /></Stack>`
- Produces: `(tabs)/index.tsx`가 export하는 `HomeScreen` 자리. Task 8이 이 파일을 채운다.
  `ScreenPlaceholder({ title }: { title: string })` — Shop/News/My가 쓴다.

- [ ] **Step 1: 플레이스홀더 공용 컴포넌트를 만든다**

`src/shared/ui/screen-placeholder/index.tsx`:

```tsx
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenPlaceholderProps {
  title: string;
}

/**
 * 아직 구현되지 않은 탭 화면. 탭 전환이 동작하는지 확인하는 용도다.
 */
export function ScreenPlaceholder({ title }: ScreenPlaceholderProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center">
        <Text className="text-title-3 font-bold text-foreground">{title}</Text>
        <Text className="text-body-3 mt-2 text-neutral">Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: 네이티브 탭 레이아웃을 만든다**

`src/app/(tabs)/_layout.tsx`. PNG 아이콘 대신 iOS SF Symbols(`sf`)와 Android Material Symbols(`md`)를 쓴다 — 에셋이 필요 없고 틴트가 자동으로 맞는다. 라이트 고정이므로 `useColorScheme()` 분기 없이 `Colors.light`를 직접 쓴다.

```tsx
import { NativeTabs } from "expo-router/unstable-native-tabs";

import { Colors } from "@/constants/theme";

// 라이트 모드 고정이라 scheme 분기가 없다. NativeTabs 는 className 이 아니라
// 색 값을 요구하므로 nativewind 토큰 대신 Colors 를 쓴다.
const colors = Colors.light;

export default function TabLayout() {
  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md="home"
          sf={{ default: "house", selected: "house.fill" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="shop">
        <NativeTabs.Trigger.Label>Shop</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md="shopping_bag"
          sf={{ default: "bag", selected: "bag.fill" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="news">
        <NativeTabs.Trigger.Label>News</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md="newspaper"
          sf={{ default: "newspaper", selected: "newspaper.fill" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="my">
        <NativeTabs.Trigger.Label>My</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md="person"
          sf={{ default: "person", selected: "person.fill" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

- [ ] **Step 3: 웹 탭 레이아웃을 만든다**

`src/app/(tabs)/_layout.web.tsx`. 기존 `app-tabs.web.tsx`가 쓰던 `ThemedText`/`ThemedView`/`ExternalLink`는 이 Task에서 삭제되므로, 평범한 `View`/`Text` + nativewind로 다시 쓴다.

```tsx
import type { TabListProps, TabTriggerSlotProps } from "expo-router/ui";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import { Pressable, Text, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <WebTabList>
          <TabTrigger asChild href="/" name="index">
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger asChild href="/shop" name="shop">
            <TabButton>Shop</TabButton>
          </TabTrigger>
          <TabTrigger asChild href="/news" name="news">
            <TabButton>News</TabButton>
          </TabTrigger>
          <TabTrigger asChild href="/my" name="my">
            <TabButton>My</TabButton>
          </TabTrigger>
        </WebTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props}>
      <View className="rounded-lg px-4 py-1">
        <Text
          className={
            isFocused
              ? "text-body-3 font-bold text-foreground"
              : "text-body-3 text-neutral"
          }
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

function WebTabList(props: TabListProps) {
  return (
    <View
      {...props}
      className="absolute bottom-0 w-full flex-row items-center justify-center gap-2 border-t border-neutral-subtle bg-background py-3"
    />
  );
}
```

- [ ] **Step 4: 탭 화면 4개를 만든다**

`src/app/(tabs)/index.tsx` (Task 8에서 채운다):

```tsx
import { ScreenPlaceholder } from "@shared/ui/screen-placeholder";

export default function HomeScreen() {
  return <ScreenPlaceholder title="Home" />;
}
```

`src/app/(tabs)/shop.tsx`:

```tsx
import { ScreenPlaceholder } from "@shared/ui/screen-placeholder";

export default function ShopScreen() {
  return <ScreenPlaceholder title="Shop" />;
}
```

`src/app/(tabs)/news.tsx`:

```tsx
import { ScreenPlaceholder } from "@shared/ui/screen-placeholder";

export default function NewsScreen() {
  return <ScreenPlaceholder title="News" />;
}
```

`src/app/(tabs)/my.tsx`:

```tsx
import { ScreenPlaceholder } from "@shared/ui/screen-placeholder";

export default function MyScreen() {
  return <ScreenPlaceholder title="My" />;
}
```

- [ ] **Step 5: 템플릿 파일을 지운다**

```bash
cd apps/mobile
git rm -r \
  src/app/index.tsx \
  src/app/explore.tsx \
  src/components/app-tabs.tsx \
  src/components/app-tabs.web.tsx \
  src/components/hint-row.tsx \
  src/components/web-badge.tsx \
  src/components/external-link.tsx \
  src/components/themed-text.tsx \
  src/components/themed-view.tsx \
  src/components/ui/collapsible.tsx \
  src/hooks/use-theme.ts \
  src/hooks/use-color-scheme.ts \
  src/hooks/use-color-scheme.web.ts \
  assets/images/tabIcons \
  assets/images/react-logo.png \
  assets/images/react-logo@2x.png \
  assets/images/react-logo@3x.png \
  assets/images/tutorial-web.png \
  assets/images/expo-badge.png \
  assets/images/expo-badge-white.png
```

- [ ] **Step 6: 남은 참조가 없는지 확인한다**

```bash
cd apps/mobile
grep -rn "themed-text\|themed-view\|hint-row\|web-badge\|external-link\|collapsible\|use-theme\|use-color-scheme\|app-tabs\|tabIcons\|react-logo\|tutorial-web\|expo-badge" src assets
```

기대: 출력 없음. 뭔가 걸리면 그 파일을 먼저 고친다.

- [ ] **Step 7: 타입체크와 린트**

```bash
pnpm typecheck:mobile
pnpm --filter @seoul-moment/mobile lint
```

기대: 둘 다 통과.

- [ ] **Step 8: 시뮬레이터에서 탭을 확인한다**

```bash
pnpm dev:mobile       # 레포 루트에서, 뜨면 i 를 눌러 iOS 시뮬레이터
```

확인할 것:
- 하단에 탭 4개가 Home / Shop / News / My 라벨과 아이콘으로 뜬다
- 네 탭을 모두 눌러 각각 "Home / Shop / News / My" + "Coming soon"이 뜬다
- 선택된 탭의 아이콘이 채워진(`.fill`) 모양으로 바뀐다

- [ ] **Step 9: 커밋**

```bash
git add -A apps/mobile
git commit -m "$(cat <<'EOF'
feat(mobile): replace the Expo template with Seoul Moment bottom tabs

Move the tab navigator into a (tabs) group so the root Stack can host
detail screens later, and define the four real tabs: Home, Shop, News,
My. Screens other than Home are placeholders for now.

Tab icons move from bundled PNGs to SF Symbols on iOS and Material
Symbols on Android, which drops six asset files and lets the platform
tint them.

Deletes the template screens and every component that became
unreferenced with them.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: 서비스 계층과 언어 훅

홈이 호출할 4개 API와, 쿼리 키에 들어갈 기기 언어 훅을 만든다.

**Files:**
- Create: `src/shared/lib/i18n/useLanguage.ts`
- Create: `src/shared/services/home.ts`, `product.ts`, `news.ts`, `article.ts`

**Interfaces:**
- Consumes: `src/shared/services/index.ts`의 `api`, `CommonRes`, `PublicLanguageCode`. `src/shared/lib/i18n/language.ts`의 `getDeviceLanguage`, `LanguageType`.
- Produces:
  - `useLanguage(): LanguageType`
  - `getHome({ languageCode }): Promise<CommonRes<GetHomeRes>>`, `GetHomeRes = { banner: HomeBanner[]; promotion: HomePromotion[] }`
  - `HomeBanner = { imageUrl: string; mobileImageUrl: string }`
  - `HomePromotion = { promotionId: number; title: string; description: string; imageUrl: string }`
  - `getProductList({ languageCode, page, count, mainView? }): Promise<CommonRes<GetProductListRes>>`, `GetProductListRes = { total: number; list: ProductItem[] }`
  - `ProductItem = { id, brandName, productName, price, like, review, reviewAverage, image, colorName, colorCode, isLiked }`
  - `getNewsList({ languageCode, count }): Promise<CommonRes<GetNewsListRes>>`, `GetNewsListRes = { total: number; list: News[] }`
  - `News = { id, title, content, writer, createDate, image, homeImage, newsCategoryName }`
  - `getArticleList({ languageCode, count }): Promise<CommonRes<GetArticleListRes>>`, `GetArticleListRes = { total: number; list: Article[] }`
  - `Article = { id, title, content, writer, createDate, image, homeImage }`

- [ ] **Step 1: 언어 훅을 만든다**

`src/shared/lib/i18n/useLanguage.ts`:

```ts
import { useEffect, useState } from "react";
import { AppState } from "react-native";

import { getDeviceLanguage, type LanguageType } from "./language";

/**
 * 기기 언어는 앱이 떠 있는 동안 바뀌지 않지만, 사용자가 설정에서 바꾸고 돌아오면 달라진다.
 * 포그라운드 복귀 시 재평가해서 쿼리 키가 새 언어로 갈아끼워지게 한다.
 */
export const useLanguage = (): LanguageType => {
  const [language, setLanguage] = useState(getDeviceLanguage);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") setLanguage(getDeviceLanguage());
    });

    return () => subscription.remove();
  }, []);

  return language;
};
```

- [ ] **Step 2: 홈 서비스를 만든다**

`src/shared/services/home.ts`. web `GetHomeRes`에 있는 `promotionList` 필드는 dev 응답에 존재하지 않고 web 코드에서도 쓰이지 않으므로 넣지 않는다.

```ts
import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

export interface HomeBanner {
  imageUrl: string;
  mobileImageUrl: string;
}

export interface HomePromotion {
  promotionId: number;
  title: string;
  description: string;
  imageUrl: string;
}

export interface GetHomeRes {
  banner: HomeBanner[];
  promotion: HomePromotion[];
}

/**
 * @description 홈 배너 + 프로모션
 */
export const getHome = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("home/v1", {
      searchParams: { languageCode },
    })
    .json<CommonRes<GetHomeRes>>();
```

- [ ] **Step 3: 상품 서비스를 만든다**

`src/shared/services/product.ts`. 홈이 쓰는 목록 조회만 가져온다.

```ts
import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

export interface ProductItem {
  id: number;
  brandName: string;
  productName: string;
  price: number;
  like: number;
  review: number;
  reviewAverage: number;
  image: string;
  colorName: string;
  colorCode: string;
  isLiked: boolean;
}

export interface GetProductListRes {
  total: number;
  list: ProductItem[];
}

interface GetProductListReq extends PublicLanguageCode {
  page: number;
  count: number;
  mainView?: boolean;
}

/**
 * @description 상품 목록. 엔드포인트는 "product" 다 — "product/list" 는 400 을 준다.
 */
export const getProductList = ({
  languageCode,
  page,
  count,
  mainView,
}: GetProductListReq) =>
  api
    .get("product", {
      searchParams: {
        languageCode,
        page,
        count,
        ...(mainView == null ? {} : { mainView }),
      },
    })
    .json<CommonRes<GetProductListRes>>();
```

- [ ] **Step 4: 뉴스 서비스를 만든다**

`src/shared/services/news.ts`:

```ts
import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

export interface News {
  id: number;
  title: string;
  content: string;
  writer: string;
  createDate: string;
  image: string;
  homeImage: string;
  newsCategoryName: string;
}

export interface GetNewsListRes {
  total: number;
  list: News[];
}

interface GetNewsListReq extends PublicLanguageCode {
  count: number;
}

/**
 * @description 뉴스 목록
 */
export const getNewsList = ({ languageCode, count }: GetNewsListReq) =>
  api
    .get("news/list", {
      searchParams: { languageCode, count },
    })
    .json<CommonRes<GetNewsListRes>>();
```

- [ ] **Step 5: 아티클 서비스를 만든다**

`src/shared/services/article.ts`:

```ts
import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

export interface Article {
  id: number;
  title: string;
  content: string;
  writer: string;
  createDate: string;
  image: string;
  homeImage: string;
}

export interface GetArticleListRes {
  total: number;
  list: Article[];
}

interface GetArticleListReq extends PublicLanguageCode {
  count: number;
}

/**
 * @description 아티클 목록
 */
export const getArticleList = ({ languageCode, count }: GetArticleListReq) =>
  api
    .get("article/list", {
      searchParams: { languageCode, count },
    })
    .json<CommonRes<GetArticleListRes>>();
```

- [ ] **Step 6: 네 엔드포인트가 dev 에서 실제로 응답하는지 확인한다**

서비스 함수를 화면에 붙이기 전에, URL과 파라미터가 맞는지 먼저 확인한다. `languageCode`는 ky 훅이 헤더로 옮기므로 curl 에서는 헤더로 직접 준다.

```bash
H='Accept-language: ko'
curl -s "https://api-dev.seoulmoment.com.tw/home/v1" -H "$H" | head -c 300; echo
curl -s "https://api-dev.seoulmoment.com.tw/product?page=1&count=4&mainView=true" -H "$H" | head -c 300; echo
curl -s "https://api-dev.seoulmoment.com.tw/news/list?count=3" -H "$H" | head -c 300; echo
curl -s "https://api-dev.seoulmoment.com.tw/article/list?count=3" -H "$H" | head -c 300; echo
```

기대: 네 줄 모두 `{"result":true,...` 또는 `{"data":{...},"result":true}`로 시작한다. `"statusCode":400`이 보이면 해당 서비스 함수의 경로나 파라미터가 틀린 것이다.

- [ ] **Step 7: 타입체크와 린트**

```bash
pnpm typecheck:mobile
pnpm --filter @seoul-moment/mobile lint
```

- [ ] **Step 8: 커밋**

```bash
git add apps/mobile/src/shared
git commit -m "$(cat <<'EOF'
feat(mobile): add home API services and a device language hook

Ports getHome, getProductList, getNewsList and getArticleList from web,
trimmed to what the home screen needs.

Two things the web types get wrong for our purposes: GetHomeRes declares
a promotionList field the dev API never returns and no code reads, so it
is left out; and the product list endpoint is "product", not
"product/list".

useLanguage re-reads the device locale when the app returns to the
foreground, so query keys follow a language change made in Settings.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: 공용 UI와 엔티티 카드

섹션들이 공유할 틀(제목·스켈레톤·에러)과, 상품 카드 / 뉴스·아티클 행을 만든다.

**Files:**
- Create: `src/shared/ui/section/index.tsx`
- Create: `src/shared/ui/section-state/index.tsx`
- Create: `src/entities/product/ui/ProductCard.tsx`
- Create: `src/entities/post/ui/PostRow.tsx`

**Interfaces:**
- Consumes: Task 3의 `ProductItem`
- Produces:
  - `Section({ title, action?, children })`
  - `SectionSkeleton({ height }: { height: number })`
  - `SectionError({ onRetry }: { onRetry: () => void })`
  - `ProductCard({ product }: { product: ProductItem })`
  - `PostRow({ title, writer, createDate, imageUrl })` — `imageUrl: string`, 나머지 `string`

- [ ] **Step 1: 섹션 틀을 만든다**

`src/shared/ui/section/index.tsx`:

```tsx
import type { PropsWithChildren, ReactNode } from "react";
import { Text, View } from "react-native";

interface SectionProps {
  title: string;
  action?: ReactNode;
}

/**
 * 홈 섹션 공용 틀. 제목 줄의 좌우 여백만 책임지고, 본문은 섹션마다 자유롭게 둔다
 * (가로 캐러셀은 화면 끝까지 흘러야 해서 본문에 패딩을 강제하지 않는다).
 */
export function Section({
  title,
  action,
  children,
}: PropsWithChildren<SectionProps>) {
  return (
    <View className="pt-10">
      <View className="mb-4 flex-row items-end justify-between px-5">
        <Text className="text-title-4 font-bold text-foreground">{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}
```

- [ ] **Step 2: 스켈레톤과 에러 줄을 만든다**

`src/shared/ui/section-state/index.tsx`:

```tsx
import { Pressable, Text, View } from "react-native";

interface SectionSkeletonProps {
  height: number;
}

/**
 * 섹션이 로딩 중일 때 자리를 잡아 둔다. 실제 콘텐츠와 높이를 맞춰야
 * 데이터가 도착할 때 레이아웃이 점프하지 않는다.
 */
export function SectionSkeleton({ height }: SectionSkeletonProps) {
  return (
    <View className="mx-5 rounded-lg bg-neutral-subtle" style={{ height }} />
  );
}

interface SectionErrorProps {
  onRetry: () => void;
}

/**
 * 한 섹션이 실패해도 홈 전체가 죽지 않게, 그 섹션만 한 줄로 접는다.
 */
export function SectionError({ onRetry }: SectionErrorProps) {
  return (
    <View className="mx-5 flex-row items-center justify-between rounded-lg border border-neutral-subtle px-4 py-3">
      <Text className="text-body-3 text-neutral">
        Couldn&apos;t load this section
      </Text>
      <Pressable hitSlop={8} onPress={onRetry}>
        <Text className="text-body-3 font-bold text-brand">Retry</Text>
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 3: 상품 카드를 만든다**

`src/entities/product/ui/ProductCard.tsx`. 가격 표기는 web `toNTCurrency`와 같은 `NT$` + 천 단위 콤마다.

```tsx
import { Image } from "expo-image";
import { Text, View } from "react-native";

import type { ProductItem } from "@shared/services/product";

interface ProductCardProps {
  product: ProductItem;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <View className="flex-1">
      <Image
        contentFit="cover"
        source={product.image}
        // 이미지가 404 이거나 느려도 자리 높이가 유지되도록 비율을 고정한다.
        style={{ width: "100%", aspectRatio: 1, borderRadius: 8 }}
        transition={200}
      />
      <Text className="text-body-3 mt-2 text-neutral" numberOfLines={1}>
        {product.brandName}
      </Text>
      <Text className="text-body-3 text-foreground" numberOfLines={2}>
        {product.productName}
      </Text>
      <Text className="text-body-3 mt-1 font-bold text-foreground">
        {`NT$${product.price.toLocaleString("en-US")}`}
      </Text>
    </View>
  );
}
```

- [ ] **Step 4: 뉴스·아티클 공용 행을 만든다**

`src/entities/post/ui/PostRow.tsx`. `News`와 `Article`은 `id / title / content / writer / createDate / image / homeImage`를 똑같이 갖는다(뉴스만 `newsCategoryName`이 더 있다). 행 UI는 하나로 둔다.

```tsx
import { Image } from "expo-image";
import { Text, View } from "react-native";

interface PostRowProps {
  title: string;
  writer: string;
  createDate: string;
  imageUrl: string;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toISOString().slice(0, 10).replace(/-/g, ".");
};

export function PostRow({
  title,
  writer,
  createDate,
  imageUrl,
}: PostRowProps) {
  return (
    <View className="flex-row items-center gap-3 px-5 py-3">
      <Image
        contentFit="cover"
        source={imageUrl}
        style={{ width: 88, height: 72, borderRadius: 8 }}
        transition={200}
      />
      <View className="flex-1">
        <Text className="text-body-3 font-bold text-foreground" numberOfLines={2}>
          {title}
        </Text>
        <Text className="text-body-3 mt-1 text-neutral" numberOfLines={1}>
          {[writer, formatDate(createDate)].filter(Boolean).join(" · ")}
        </Text>
      </View>
    </View>
  );
}
```

- [ ] **Step 5: 타입체크와 린트**

```bash
pnpm typecheck:mobile
pnpm --filter @seoul-moment/mobile lint
```

- [ ] **Step 6: 커밋**

```bash
git add apps/mobile/src/shared/ui apps/mobile/src/entities
git commit -m "$(cat <<'EOF'
feat(mobile): add shared section chrome and entity cards

Section, SectionSkeleton and SectionError give every home section the
same title row, loading placeholder and single-line failure state, which
is what keeps one failing request from taking the whole screen down.

News and Article carry identical fields, so they share one PostRow
instead of two near-copies. Images get a fixed aspect ratio so a slow or
missing URL does not shift the layout.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: 홈 쿼리 훅

섹션들이 소유할 쿼리를 만든다. 배너와 프로모션은 같은 `home/v1`을 쓰지만 쿼리 키가 같아 요청은 한 번이다.

**Files:**
- Create: `src/features/home/model/useHomePrime.ts`
- Create: `src/features/home/model/useHomeLists.ts`
- Create: `src/features/home/model/useRefreshHome.ts`

**Interfaces:**
- Consumes: Task 3의 서비스 함수들과 `useLanguage`. `@shared/lib/hooks/query/useAppQuery`의 기본 export.
- Produces:
  - `useHomeBanner(): UseQueryResult<HomeBanner | undefined, Error>`
  - `useHomePromotion(): UseQueryResult<HomePromotion[], Error>`
  - `useNowOnSale(): UseQueryResult<ProductItem[], Error>`
  - `useHomeNews(): UseQueryResult<News[], Error>`
  - `useHomeArticle(): UseQueryResult<Article[], Error>`
  - `useRefreshHome(): { isRefreshing: boolean; refresh: () => void }`

- [ ] **Step 1: 배너·프로모션 훅을 만든다**

`src/features/home/model/useHomePrime.ts`. 두 훅의 `queryKey`가 같아야 요청이 합쳐진다 — 키를 상수로 뽑아 어긋나지 않게 한다.

```ts
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import type { LanguageType } from "@shared/lib/i18n/language";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
// CommonRes 는 서비스 배럴(index.ts)에만 있다. home.ts 는 그것을 import 할 뿐
// re-export 하지 않으므로 "@shared/services/home" 에서 가져오면 컴파일되지 않는다.
import type { CommonRes } from "@shared/services";
import type {
  GetHomeRes,
  HomeBanner,
  HomePromotion,
} from "@shared/services/home";
import { getHome } from "@shared/services/home";

// 배너와 프로모션은 같은 home/v1 응답에서 나온다. 키가 같으면 react-query 가
// 캐시를 공유하므로 두 훅을 같이 써도 네트워크 요청은 한 번이다.
const primeKey = (language: LanguageType) =>
  ["home", "prime", language] as const;

export const useHomeBanner = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: primeKey(languageCode),
    queryFn: () => getHome({ languageCode }),
    select: (res: CommonRes<GetHomeRes>): HomeBanner | undefined =>
      res.data.banner[0],
  });
};

export const useHomePromotion = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: primeKey(languageCode),
    queryFn: () => getHome({ languageCode }),
    select: (res: CommonRes<GetHomeRes>): HomePromotion[] =>
      res.data.promotion ?? [],
  });
};
```

- [ ] **Step 2: 목록 훅 3개를 만든다**

`src/features/home/model/useHomeLists.ts`:

```ts
import type { CommonRes } from "@shared/services";
import type { Article, GetArticleListRes } from "@shared/services/article";
import { getArticleList } from "@shared/services/article";
import type { GetNewsListRes, News } from "@shared/services/news";
import { getNewsList } from "@shared/services/news";
import type { GetProductListRes, ProductItem } from "@shared/services/product";
import { getProductList } from "@shared/services/product";

import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";

const NOW_ON_SALE_COUNT = 4;
const POST_COUNT = 3;

export const useNowOnSale = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["home", "product", languageCode] as const,
    queryFn: () =>
      getProductList({
        languageCode,
        page: 1,
        count: NOW_ON_SALE_COUNT,
        mainView: true,
      }),
    select: (res: CommonRes<GetProductListRes>): ProductItem[] =>
      res.data.list ?? [],
  });
};

export const useHomeNews = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["home", "news", languageCode] as const,
    queryFn: () => getNewsList({ languageCode, count: POST_COUNT }),
    select: (res: CommonRes<GetNewsListRes>): News[] => res.data.list ?? [],
  });
};

export const useHomeArticle = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["home", "article", languageCode] as const,
    queryFn: () => getArticleList({ languageCode, count: POST_COUNT }),
    select: (res: CommonRes<GetArticleListRes>): Article[] =>
      res.data.list ?? [],
  });
};
```

- [ ] **Step 3: 새로고침 훅을 만든다**

`src/features/home/model/useRefreshHome.ts`. 모든 홈 쿼리 키가 `"home"`으로 시작하므로 한 번에 묶인다. 진행 중 재당김은 무시한다.

```ts
import { useCallback, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

export const useRefreshHome = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    // 이미 돌고 있으면 무시한다. 연속으로 당기면 refetch 가 중복 실행된다.
    if (isRefreshing) return;

    setIsRefreshing(true);
    void queryClient
      .refetchQueries({ queryKey: ["home"] })
      .finally(() => setIsRefreshing(false));
  }, [isRefreshing, queryClient]);

  return { isRefreshing, refresh };
};
```

- [ ] **Step 4: 타입체크와 린트**

```bash
pnpm typecheck:mobile
pnpm --filter @seoul-moment/mobile lint
```

린트에서 `useQuery` 직접 import를 막는 규칙에 걸리면, `useAppQuery`를 쓰고 있는지 확인한다. `useQueryClient`는 제한 대상이 아니다.

- [ ] **Step 5: 커밋**

```bash
git add apps/mobile/src/features/home/model
git commit -m "$(cat <<'EOF'
feat(mobile): add home query hooks owned per section

Each section owns its own query so one failure stays local. The banner
and promotion hooks deliberately share a query key: they read different
slices of the same home/v1 response, and a shared key means one request.

Every key starts with "home", which is what lets pull-to-refresh refetch
the screen with a single call.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: 배너와 프로모션 섹션

홈 상단 두 섹션. 빈 배열과 줄바꿈이 섞인 실데이터를 여기서 처리한다.

**Files:**
- Create: `src/features/home/ui/HeroBanner.tsx`
- Create: `src/features/home/ui/PromotionSection.tsx`

**Interfaces:**
- Consumes: Task 4의 `Section`, `SectionSkeleton`, `SectionError`. Task 5의 `useHomeBanner`, `useHomePromotion`. Task 3의 `HomePromotion`.
- Produces: `HeroBanner()`, `PromotionSection()` — 둘 다 props 없음

- [ ] **Step 1: 히어로 배너를 만든다**

`src/features/home/ui/HeroBanner.tsx`. dev 응답의 `banner`는 1건이지만 배열이다. 비어 있으면 `banner[0]`이 `undefined`가 되므로 아무것도 렌더하지 않는다.

```tsx
import { Image } from "expo-image";
import { View } from "react-native";

import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useHomeBanner } from "../model/useHomePrime";

const BANNER_HEIGHT = 220;

export function HeroBanner() {
  const { data: banner, isPending, isError, refetch } = useHomeBanner();

  if (isPending) return <SectionSkeleton height={BANNER_HEIGHT} />;
  if (isError) return <SectionError onRetry={() => void refetch()} />;
  // banner 배열이 비면 select 가 undefined 를 준다. 빈 이미지를 띄우지 않는다.
  if (!banner) return null;

  return (
    <View style={{ height: BANNER_HEIGHT }}>
      <Image
        contentFit="cover"
        source={banner.mobileImageUrl || banner.imageUrl}
        style={{ width: "100%", height: "100%" }}
        transition={200}
      />
    </View>
  );
}
```

- [ ] **Step 2: 프로모션 섹션을 만든다**

`src/features/home/ui/PromotionSection.tsx`. dev 에는 `promotion`이 1건뿐이라, web처럼 `[0]`과 `slice(1)`로 쪼개면 둘째 섹션이 항상 빈다. 개수로 모양을 가른다.

```tsx
import { Image } from "expo-image";
import { Dimensions, FlatList, Text, View } from "react-native";

import type { HomePromotion } from "@shared/services/home";
import { Section } from "@shared/ui/section";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useHomePromotion } from "../model/useHomePrime";

const HERO_HEIGHT = 200;
const CARD_WIDTH = Math.round(Dimensions.get("window").width * 0.72);
const CARD_HEIGHT = 160;

export function PromotionSection() {
  const { data: promotions, isPending, isError, refetch } = useHomePromotion();

  if (isPending) {
    return (
      <Section title="Season Collection">
        <SectionSkeleton height={HERO_HEIGHT} />
      </Section>
    );
  }

  if (isError) {
    return (
      <Section title="Season Collection">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  // 빈 배열이면 섹션 자체를 렌더하지 않는다 (web SeasonCollection 과 같은 동작).
  if (!promotions || promotions.length === 0) return null;

  return (
    <Section title="Season Collection">
      {promotions.length === 1 ? (
        <View className="px-5">
          <PromotionHero promotion={promotions[0]} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          data={promotions}
          horizontal
          keyExtractor={(item) => String(item.promotionId)}
          renderItem={({ item }) => <PromotionCard promotion={item} />}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={CARD_WIDTH + 12}
        />
      )}
    </Section>
  );
}

function PromotionHero({ promotion }: { promotion: HomePromotion }) {
  return (
    <View>
      <Image
        contentFit="cover"
        source={promotion.imageUrl}
        style={{ width: "100%", height: HERO_HEIGHT, borderRadius: 12 }}
        transition={200}
      />
      <Text className="text-body-2 mt-3 font-bold text-foreground" numberOfLines={1}>
        {promotion.title}
      </Text>
      {/* description 에 \n 이 섞여 온다 (dev 실데이터 확인). 줄 수를 묶어
          카드 높이가 데이터에 따라 출렁이지 않게 한다. */}
      <Text className="text-body-3 mt-1 text-neutral" numberOfLines={2}>
        {promotion.description}
      </Text>
    </View>
  );
}

function PromotionCard({ promotion }: { promotion: HomePromotion }) {
  return (
    <View style={{ width: CARD_WIDTH }}>
      <Image
        contentFit="cover"
        source={promotion.imageUrl}
        style={{ width: "100%", height: CARD_HEIGHT, borderRadius: 12 }}
        transition={200}
      />
      <Text className="text-body-3 mt-2 font-bold text-foreground" numberOfLines={1}>
        {promotion.title}
      </Text>
      <Text className="text-body-3 mt-1 text-neutral" numberOfLines={2}>
        {promotion.description}
      </Text>
    </View>
  );
}
```

- [ ] **Step 3: 타입체크와 린트**

```bash
pnpm typecheck:mobile
pnpm --filter @seoul-moment/mobile lint
```

- [ ] **Step 4: 빈 배열과 줄바꿈 처리를 확인한다 (Review Focus 1, 3)**

섹션을 아직 홈에 붙이지 않았으므로, `(tabs)/index.tsx`를 임시로 바꿔 둘만 렌더한다.

```tsx
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HeroBanner } from "@features/home/ui/HeroBanner";
import { PromotionSection } from "@features/home/ui/PromotionSection";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView>
        <HeroBanner />
        <PromotionSection />
      </ScrollView>
    </SafeAreaView>
  );
}
```

시뮬레이터에서 확인할 것:
- 배너 이미지가 뜨고, 그 아래 "Season Collection" 제목과 **전체 폭 히어로 카드 하나**가 뜬다 (dev 에 프로모션이 1건이므로 캐러셀이 아니다)
- 프로모션 설명이 **2줄에서 잘린다**. dev 데이터의 `description`에는 `\n`이 3개 들어 있으므로, 잘리지 않으면 `numberOfLines`가 안 먹은 것이다
- 빈 배열 처리: `useHomePromotion`의 `select`를 일시적으로 `() => []`로 바꿔 저장한다 → "Season Collection" 섹션이 **통째로 사라지고** 배너만 남아야 한다. 확인 후 되돌린다
- 빈 배너 처리: `useHomeBanner`의 `select`를 일시적으로 `() => undefined`로 바꿔 저장한다 → 배너 자리가 **빈 칸 없이 사라져야** 한다. 확인 후 되돌린다

- [ ] **Step 5: 커밋**

`(tabs)/index.tsx`의 임시 조립도 함께 커밋한다 — Task 8에서 최종 조립으로 덮는다.

```bash
git add apps/mobile/src/features/home/ui apps/mobile/src/app/\(tabs\)/index.tsx
git commit -m "$(cat <<'EOF'
feat(mobile): add the home hero banner and promotion section

The dev API returns a single promotion, so splitting it the way web does
(index 0 as the hero, the rest as a list) would leave a permanently empty
second section. This renders one full-width hero for a single promotion
and only falls back to a snap carousel when there are two or more.

Both sections render nothing at all on an empty payload rather than
showing an empty frame, and promotion copy is clamped because the live
description contains newlines.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: 상품·뉴스·아티클·컨택트 섹션

나머지 네 섹션. 상품은 2열 그리드, 뉴스와 아티클은 썸네일 행, 컨택트는 정적 CTA다.

**Files:**
- Create: `src/features/home/ui/NowOnSaleSection.tsx`
- Create: `src/features/home/ui/NewsSection.tsx`
- Create: `src/features/home/ui/ArticleSection.tsx`
- Create: `src/features/home/ui/ContactSection.tsx` (이후 제거됨 — 모바일 카드에는 web과 달리 링크가 없어 삭제했다)
- Create: `src/features/home/index.ts`

**Interfaces:**
- Consumes: Task 4의 `Section`, `SectionSkeleton`, `SectionError`, `ProductCard`, `PostRow`. Task 5의 `useNowOnSale`, `useHomeNews`, `useHomeArticle`.
- Produces: `NowOnSaleSection()`, `NewsSection()`, `ArticleSection()`, `ContactSection()` (이후 제거됨 — 모바일 카드에는 web과 달리 링크가 없어 삭제했다) — 모두 props 없음. 그리고 `src/features/home/index.ts`가 여섯 섹션(`HeroBanner` 포함)을 배럴로 내보낸다.

- [ ] **Step 1: Now On Sale 섹션을 만든다**

`src/features/home/ui/NowOnSaleSection.tsx`. 항목이 4개 고정이라 `FlatList` 대신 `View` + `map`으로 2열을 만든다 — 세로 가상화 리스트를 바깥 `ScrollView` 안에 중첩시키지 않기 위해서다.

```tsx
import { Text, View } from "react-native";

import { ProductCard } from "@entities/product/ui/ProductCard";
import { Section } from "@shared/ui/section";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useNowOnSale } from "../model/useHomeLists";

const GRID_HEIGHT = 420;

export function NowOnSaleSection() {
  const { data: products, isPending, isError, refetch } = useNowOnSale();

  if (isPending) {
    return (
      <Section title="Now On Sale">
        <SectionSkeleton height={GRID_HEIGHT} />
      </Section>
    );
  }

  if (isError) {
    return (
      <Section title="Now On Sale">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <Section
      action={<Text className="text-body-3 text-neutral">View all</Text>}
      title="Now On Sale"
    >
      {/* 항목이 4개로 고정이라 가상화 이득이 없고, 바깥 ScrollView 안에
          세로 FlatList 를 중첩하지 않으려고 flex-wrap 으로 2열을 만든다. */}
      <View className="flex-row flex-wrap gap-3 px-5">
        {products.map((product) => (
          <View key={product.id} style={{ width: "47%" }}>
            <ProductCard product={product} />
          </View>
        ))}
      </View>
    </Section>
  );
}
```

- [ ] **Step 2: 뉴스 섹션을 만든다**

`src/features/home/ui/NewsSection.tsx`:

```tsx
import { View } from "react-native";

import { PostRow } from "@entities/post/ui/PostRow";
import { Section } from "@shared/ui/section";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useHomeNews } from "../model/useHomeLists";

const LIST_HEIGHT = 290;

export function NewsSection() {
  const { data: news, isPending, isError, refetch } = useHomeNews();

  if (isPending) {
    return (
      <Section title="News">
        <SectionSkeleton height={LIST_HEIGHT} />
      </Section>
    );
  }

  if (isError) {
    return (
      <Section title="News">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (!news || news.length === 0) return null;

  return (
    <Section title="News">
      <View>
        {news.map((item) => (
          <PostRow
            createDate={item.createDate}
            imageUrl={item.homeImage}
            key={item.id}
            title={item.title}
            writer={item.writer}
          />
        ))}
      </View>
    </Section>
  );
}
```

- [ ] **Step 3: 아티클 섹션을 만든다**

`src/features/home/ui/ArticleSection.tsx`:

```tsx
import { View } from "react-native";

import { PostRow } from "@entities/post/ui/PostRow";
import { Section } from "@shared/ui/section";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useHomeArticle } from "../model/useHomeLists";

const LIST_HEIGHT = 290;

export function ArticleSection() {
  const { data: articles, isPending, isError, refetch } = useHomeArticle();

  if (isPending) {
    return (
      <Section title="Article">
        <SectionSkeleton height={LIST_HEIGHT} />
      </Section>
    );
  }

  if (isError) {
    return (
      <Section title="Article">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (!articles || articles.length === 0) return null;

  return (
    <Section title="Article">
      <View>
        {articles.map((item) => (
          <PostRow
            createDate={item.createDate}
            imageUrl={item.homeImage}
            key={item.id}
            title={item.title}
            writer={item.writer}
          />
        ))}
      </View>
    </Section>
  );
}
```

- [ ] **Step 4: 컨택트 섹션을 만든다** (이후 제거됨 — 모바일 카드에는 web과 달리 링크가 없어 삭제했다)

`src/features/home/ui/ContactSection.tsx`. API 없이 정적이다.

```tsx
import { Text, View } from "react-native";

export function ContactSection() {
  return (
    <View className="mx-5 mt-12 rounded-xl bg-surface-soft px-5 py-8">
      <Text className="text-title-4 font-bold text-foreground">Contact Us</Text>
      <Text className="text-body-3 mt-2 text-neutral">
        Looking to bring your brand to Taiwan? Talk to the Seoul Moment team.
      </Text>
    </View>
  );
}
```

- [ ] **Step 5: 배럴을 만든다**

`src/features/home/index.ts`:

```ts
export { ArticleSection } from "./ui/ArticleSection";
export { ContactSection } from "./ui/ContactSection";
export { HeroBanner } from "./ui/HeroBanner";
export { NewsSection } from "./ui/NewsSection";
export { NowOnSaleSection } from "./ui/NowOnSaleSection";
export { PromotionSection } from "./ui/PromotionSection";
```

- [ ] **Step 6: 타입체크와 린트**

```bash
pnpm typecheck:mobile
pnpm --filter @seoul-moment/mobile lint
```

- [ ] **Step 7: 커밋**

```bash
git add apps/mobile/src/features/home
git commit -m "$(cat <<'EOF'
feat(mobile): add the product, news, article and contact sections

Products go in a two-column grid, posts in thumbnail rows — the split
the layout review settled on, since a carousel shows too few products to
browse and news needs its titles readable.

None of these use FlatList. Item counts are fixed at three or four, so
virtualisation buys nothing, and nesting a vertical list inside the
screen's ScrollView is exactly what the NativeTabs docs warn about.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: 홈 조립과 전체 검증

섹션을 한 화면으로 묶고, 당겨서 새로고침을 붙이고, 스펙의 완성 기준을 하나씩 확인한다.

**Files:**
- Modify: `src/app/(tabs)/index.tsx` (Task 6의 임시 조립을 최종본으로 교체)

**Interfaces:**
- Consumes: Task 7의 `@features/home` 배럴, Task 5의 `useRefreshHome`
- Produces: 없음 (최종 화면)

- [ ] **Step 1: 홈 화면을 조립한다**

`src/app/(tabs)/index.tsx` 전체를 교체한다:

```tsx
import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ArticleSection,
  ContactSection,
  HeroBanner,
  NewsSection,
  NowOnSaleSection,
  PromotionSection,
} from "@features/home";
import { useRefreshHome } from "@features/home/model/useRefreshHome";

import { BottomTabInset, Spacing } from "@/constants/theme";

export default function HomeScreen() {
  const { isRefreshing, refresh } = useRefreshHome();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: BottomTabInset + Spacing.five,
        }}
        refreshControl={
          <RefreshControl onRefresh={refresh} refreshing={isRefreshing} />
        }
        showsVerticalScrollIndicator={false}
      >
        <HeroBanner />
        <PromotionSection />
        <NowOnSaleSection />
        <NewsSection />
        <ArticleSection />
        <ContactSection />
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: 타입체크와 린트**

```bash
pnpm typecheck:mobile
pnpm --filter @seoul-moment/mobile lint
```

- [ ] **Step 3: 정상 경로를 확인한다 (스펙 완성 기준 1·2)**

```bash
pnpm dev:mobile       # 레포 루트에서, 뜨면 i
```

확인할 것:
- 탭 4개가 뜨고 모두 전환된다
- 홈에 여섯 블록이 순서대로 뜬다: 배너 → Season Collection → Now On Sale → News → Article → Contact Us (Contact Us 는 이후 제거됨)
- Now On Sale 에 상품 4개가 2열로, 가격이 `NT$1,500` 꼴로 뜬다
- News 와 Article 에 각각 3개 행이 썸네일·제목·`작성자 · 2026.06.30` 꼴로 뜬다
- 맨 아래까지 스크롤했을 때 Contact Us 가 탭바에 가리지 않는다 (Contact Us 는 이후 제거됨 — 마지막 섹션이 가리지 않는지로 읽는다)

- [ ] **Step 4: 당겨서 새로고침과 중복 당김을 확인한다 (스펙 완성 기준 3, Review Focus 5)**

- 홈 맨 위에서 아래로 당긴다 → 스피너가 돌고, 놓으면 데이터가 다시 들어온다
- 스피너가 도는 중에 **다시 당긴다** → 스피너가 겹쳐 돌거나 멈추지 않는 일이 없어야 한다. `useRefreshHome`이 `isRefreshing` 중에는 무시한다

- [ ] **Step 5: 섹션 실패 격리를 확인한다 (스펙 완성 기준 4)**

`src/shared/services/news.ts`의 엔드포인트를 일시적으로 깨뜨린다:

```ts
    .get("news/list-broken", {
```

저장하고 시뮬레이터에서 확인:
- **News 섹션만** "Couldn't load this section" + Retry 한 줄로 접힌다
- 배너·Season Collection·Now On Sale·Article·Contact 는 **정상 렌더된다** (Contact 는 이후 제거됨)
- Retry 를 누르면 다시 시도하고 (여전히 실패하므로) 에러 줄이 유지된다

확인 후 `news/list`로 되돌린다.

- [ ] **Step 6: 오프라인 진입을 확인한다 (Review Focus 2)**

시뮬레이터에서 기기 전체를 비행기 모드로 두거나, Mac 의 Wi-Fi 를 끈 뒤 앱을 완전히 종료하고 다시 연다.

- 기대: 섹션들이 **무한 스켈레톤으로 남지 않는다.** `queryClient`의 `retry: false`와 `onlineManager` 조합상, 요청이 `paused` 되어 `isPending`이 유지될 수 있다
- 만약 스켈레톤이 멈춰 있으면, 각 섹션의 분기를 다음으로 바꾼다 — `isPending`만 보지 말고 `fetchStatus`도 본다:

```tsx
  const { data, isPending, isError, fetchStatus, refetch } = useNowOnSale();

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다. 스켈레톤을 영원히
  // 돌리지 말고 재시도 줄을 보여준다.
  if (isPending && fetchStatus === "paused") {
    return (
      <Section title="Now On Sale">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }
```

여섯 섹션 중 쿼리를 쓰는 다섯(`HeroBanner`, `PromotionSection`, `NowOnSaleSection`, `NewsSection`, `ArticleSection`)에 같은 분기를 넣는다. 네트워크를 되살리고 Retry 를 눌러 복구되는지 확인한다.

- [ ] **Step 7: 이미지 실패 시 레이아웃을 확인한다 (Review Focus 4)**

`src/entities/post/ui/PostRow.tsx`의 `source={imageUrl}`을 일시적으로 `source={"https://example.invalid/none.png"}`로 바꾼다.

- 기대: 썸네일 자리가 88×72 빈 칸으로 **유지되고**, 제목과 날짜가 왼쪽으로 밀리지 않는다
- 확인 후 되돌린다

- [ ] **Step 8: 최종 타입체크·린트**

```bash
pnpm typecheck:mobile
pnpm --filter @seoul-moment/mobile lint
```

Step 6에서 `fetchStatus` 분기를 추가했다면 여기서 다시 통과하는지 본다.

- [ ] **Step 9: 커밋**

```bash
git add apps/mobile/src
git commit -m "$(cat <<'EOF'
feat(mobile): assemble the home screen with pull-to-refresh

Stacks the six sections in one ScrollView and wires RefreshControl to a
single refetch of every "home"-prefixed query. A pull that arrives while
one is already running is ignored.

Verified against the dev API: all six sections render, breaking the news
endpoint collapses only that section, and the layout holds when an image
URL fails.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## 완료 후 남는 것

스펙 §11에 적은 미룬 결정들이다. 이 계획에서는 손대지 않는다.

- RN 테스트 스택(jest-expo + @testing-library/react-native) 도입
- Shop / News / My 탭의 실제 화면
- 상세 화면 (`product/[id]`, `news/[id]`, `article/[id]`) — Stack 자리는 Task 1에서 만들어 뒀다
- `Now On Sale`의 "View all"과 각 카드의 탭 동작 — 지금은 보이기만 하고 눌리지 않는다
- 스플래시 오버레이가 아직 Expo 로고다 (`src/components/animated-icon.tsx`)
- 다크 모드 — `packages/tailwind-config/tokens.css`에 다크 토큰이 생기는 시점
- SDK 58 업그레이드 시 NativeTabs import 경로 변경
