# Mobile App (apps/mobile)

Conventions and gotchas for `@seoul-moment/mobile` — Expo SDK 57 + React Native 0.86,
Expo Router, NativeWind v5 (RC). The entry guide is [`apps/mobile/AGENTS.md`](../../apps/mobile/AGENTS.md);
this file holds the detail behind it. Most rules here were learned from a real defect — the
commit that fixed it is cited so the reasoning can be read in full (`git show <hash>`).

## Layers

```
src/app/ → features/ → entities/ → shared/
```

| Layer                | Holds                                                                                                     | Example                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `app/`               | Expo Router routes only. Thin: read params, render a feature screen                                       | `app/product/[id].tsx`                                                    |
| `features/`          | One screen-level capability: `ui/` screens, `model/` hooks + stores, `lib/` pure logic, `index.ts` barrel | `features/shop`, `features/auth`                                          |
| `entities/`          | Domain pieces several features share: query hooks + keys, cards                                           | `entities/product/ui/ProductCard`, `entities/cart/model/useUserCartCount` |
| `shared/`            | No domain knowledge: `services/` (ky), `lib/` (auth, query, i18n, utils), `ui/` primitives                | `shared/ui/button`, `shared/services/product.ts`                          |
| `constants/theme.ts` | Spacing / type roles / header height (see Styling)                                                        |                                                                           |
| `components/`        | Leftover Expo template (splash overlay). Do not add here                                                  |                                                                           |

- Import downward only. `shared/` never imports from `entities/` or `features/` — when a
  shared component needs domain data, the caller passes it in (`AppHeader` takes
  `cartCount`; `entities/cart/ui/CartButton` wraps the query).
- A feature does not reach into another feature (295153d4). When two features need the same
  thing, move it down to `entities/` or `shared/`. **Existing exceptions** to clean up rather
  than copy: `features/auth/ui/AuthField` (used by account, order, find-password),
  `features/account/ui/parts` (order), `features/shop/model/useOpenBrandShop` (promotion),
  `features/my/model/keys` (shop).
- Aliases: `@shared/*`, `@entities/*`, `@features/*`, `@/*` (= `src/*`, used for
  `@/constants/theme`, `@/global.css`).
- Routes nested under a folder use `index.tsx` (`signup/index.tsx` + `signup/sns.tsx`) — a file
  and a folder of the same name collide. Every route is also declared in the root `Stack`
  in `app/_layout.tsx`.

## API layer

`shared/services/index.ts` — ky, same interface as web (`CommonRes<T>`, `PublicLanguageCode`).

- Base URL `EXPO_PUBLIC_API_BASE_URL`, falling back to the **live** API.
- `beforeRequest`: waits for `hydrateUserAuth()` before attaching `Authorization`, so requests
  fired at launch do not go out tokenless. A request that sets `Authorization` itself
  (one-time tokens) is left alone.
- `languageCode` → `Accept-language` is lifted **on GET only**. On POST/PATCH it would go out as
  a real query param, which the API rejects — set `Accept-language` in the service function
  instead (`postUserOrderPreview`, dcaf16c0).
- `afterResponse`: on 401, refresh once via `user/auth/one-time-token` (deduped, separate ky
  instance without hooks) and replay; refresh failure logs out.
- **`SKIP_AUTH_RETRY_HEADER` (`x-skip-auth-retry: 1`)**: set it on any call where 401 means
  something other than "session ended" — wrong verification code, expired one-time token.
  Without it the client refreshes, logs the user out, or replays under the access token
  (1adad27d).
- ky throws on 404. Where 404 means "no record yet", map it in the service (`getUserFit` →
  `data: null`) and rethrow everything else (f9d91f6d).
- PATCH bodies omit unchanged/unset fields rather than sending `""` — the server reads `""` as
  a value (`birthDate: ""` stored a bogus date, d7a675bb). Validate only fields the user
  changed (f5c6a6a2).
- No Sentry yet; `beforeError` only logs 5xx in `__DEV__`.

## Server state

- `useAppQuery` / `useAppMutation` only — raw `useQuery`/`useMutation` are ESLint-banned.
  Options add `logOnError`.
- QueryClient: `retry: false`, `staleTime` 5 min. `onlineManager` is seeded from
  `getNetworkStateAsync` and `focusManager` from AppState (`lib/query/appLifecycle.ts`), so
  offline requests **pause** instead of failing (b1ac8d40).
- **Render guard order**: `fetchStatus === "paused"` → `isPending` → `isError` → empty → data.
  A paused query keeps `status: "pending"`, so without the paused branch a skeleton spins
  forever offline (6f866b53). Paused → `ScreenError offline` / `SectionError`.
- Auth-only queries are `enabled` on the token; signed out they stay disabled and a screen must
  render a signed-out branch, never wait on `isPending` (c6647d8a).
- Keys: each domain has a `keys.ts`; key heads group refetches (every home key starts with
  `"home"`, so pull-to-refresh is one `refetchQueries({ queryKey: ["home"], type: "active" })`). The language
  is part of keys, so switching language refetches by itself.
- Cache writes: **invalidate** when the server computes the result (cart amounts, shipping,
  normalized phone — 2ca380ea, c6647d8a); return the invalidate promise from `onSettled` so the
  row stays locked until fresh data lands. **Optimistic** only for booleans/counts the server
  does not derive (likes: snapshot → rollback, 400ms settle, b0784c9e / 62ac2e96). When an
  optimistic change also lives in a detail cache, write that cache rather than invalidating it.
- One query per section (12181990): one failing section collapses to `SectionError`, the rest
  of the screen stays.

## UI primitives (`shared/ui`)

Reach for these before writing a new shape.

| Primitive                                      | Use                                                                                                                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `press` → `Touchable`                          | **Every** pressable. Never raw `Pressable`. `feedback`: `surface` (default), `card`, `overlay` (on photos), `none`. Handles iOS opacity vs Android ripple (18d82c86) |
| `button` → `Button`                            | `primary` (black fill) / `secondary` (outline) / `onColor`; `lg` 56 / `md` 44; always `rounded-full`. Export `BUTTON_HEIGHT` for skeletons                           |
| `section` → `Section`                          | The only section heading. `tone`: plain / muted / dark (069de05b)                                                                                                    |
| `section-state`                                | `SectionError` (one row), `ScreenError` (whole screen, `offline` flag), `EmptyState` (icon prop required)                                                            |
| `skeleton`                                     | Shape-matched skeletons + the height constants real components import                                                                                                |
| `toast` → `showToast()`                        | Announcements. Callable outside components (mutation `onError`). One at a time                                                                                       |
| `bottom-sheet`, `select`, `date-field`         | Choosing from a list / a date. Sheet animates after `Modal.onShow`                                                                                                   |
| `screen-header`, `app-header`, `detail-chrome` | Plain bar (`HeaderHeight` 52 + bottom border) / tab header / floating back over photos                                                                               |
| `icons`                                        | SVG icons on a 24 grid, 2pt stroke (lucide-like). Add new ones here                                                                                                  |
| `accordion`                                    | gluestack-ui accordion (the only gluestack component in use)                                                                                                         |

- **Alert is for questions only** (sign out, remove from cart, link account). Anything that
  just informs goes through `showToast` (b14a15a6).
- **No glyphs as icons** (`♡ ★ ✓ ◉ ▾`) — metrics differ per font/platform. Draw an SVG in
  `icons` (76441e4d, 98bde628).
- Back buttons fall back to the tab root when there is nothing to pop — deep links open screens
  with an empty stack (d1511bed). Same for post-login `router.back()` (119b6611).
- Touch targets ≥ 44pt. Prefer `hitSlop` over a bigger box so skeleton arithmetic holds
  (f24b4820).
- A whole screen failing renders `ScreenError`, not a section strip (ce05f438). Per-section
  empty lists render nothing; a wholly empty screen renders `EmptyState` (c5e317f8).

## Styling

- NativeWind `className`. Tokens come from `@seoul-moment/tailwind-config/tokens` — the same
  file web uses (`text-brand`, `bg-danger`, `text-body-3`, …). `cn()` from
  `@seoul-moment/ui/utils` — **never** import the `@seoul-moment/ui` root (pulls Radix + web CSS
  into the bundle; Metro does not tree-shake).
- Light only. Tokens have no dark values; `userInterfaceStyle: "light"`.
- Native props that take colour values, not classes (`NativeTabs`, `android_ripple`,
  `ActivityIndicator`), mirror token hex values in a named constant with the token in a comment.
- **Colour roles**: black (`bg-foreground`) = primary action. Brand orange = "chosen / you can
  go there" only, never primary buttons or errors. Errors = `danger`. Success has no colour of
  its own (84962e0a, 21e724d0).
- **Type roles** (`constants/theme.ts`): `title-3` screen title, `title-4` section heading,
  `body-1` lead card, `body-2` card title / row label / button, `body-3` body, `body-5` meta.
  `body-4`, `title-1`, `title-2` are deliberately unused.
- **Spacing**: vertical gaps between blocks use `Spacing` only — `tight` 12, `inner` 24,
  `section` 40, `chapter` 64. Card rows use `CardRow` (`padding` 20, `gap` 12). They are separate
  on purpose even where numbers match (2653d800).
- Skeletons mirror real layout to the point: when a real component's height changes, update
  the skeleton total in the same change, and share the constant rather than retyping it.
  Commit messages record the arithmetic.

## i18n

- Copy comes from the same Google Sheet as web. `pnpm i18n:sync` writes **both**
  `apps/web/messages` and `apps/mobile/src/shared/lib/i18n/messages/*.json` — never edit those
  JSONs by hand; add the row to the sheet.
- `const t = useTranslations(); t("save_changes", { n })` — same shape as next-intl.
  `MessageKey` is typed from `en.json`, so a missing key is a type error. Outside components use
  `translate(language, key)`.
- Fallback: chosen language → English → the key itself. Only `{var}` interpolation; no plurals
  or rich text (no i18n library, by design).
- Lists defined outside components hold `MessageKey`s, and the screen resolves them (menus,
  option axes, password rules).
- Language: user's pick (stored in SecureStore, read synchronously) overrides the device. API
  calls pass `languageCode`; it is part of query keys.

## Native modules & dev build

- LINE login (`@xmartlabs/react-native-line`) is native, so the project runs on a **dev build**
  (`pnpm android` = `expo run:android`). Expo Go still runs every other screen.
- Native-only modules are imported lazily at the point of use, and Expo Go is detected via
  `Constants.executionEnvironment` **before** the `import()` — a missing TurboModule throws
  synchronously inside Metro's require, past any `try/catch` (143169fb). The LINE button renders
  nothing without `EXPO_PUBLIC_LINE_CHANNEL_ID`.
- Before adding a dependency with native code, prefer one in Expo's bundled set (`npx expo
install` pins the SDK version) — anything else forces a dev-client rebuild. AsyncStorage was
  skipped for this reason; small prefs live in SecureStore.
- `ios/` and `android/` are generated (CNG) and gitignored. Configure through `app.json`,
  `app.config.ts` and config plugins.
- Mobile SNS flow mirrors web's 4-way branch (`classifySnsAuthResponse` in
  `features/auth/lib/snsAuthOutcome.ts`); email is not requested from LINE, so the server's
  `needsEmail` branch is the normal path. See [sns-auth-flow.md](sns-auth-flow.md).

## Build variants

`app.config.ts` switches on `APP_VARIANT`; `eas.json` profiles set it.

|                    | dev (`APP_VARIANT=development`)            | live (unset)                                    |
| ------------------ | ------------------------------------------ | ----------------------------------------------- |
| package / bundleId | `tw.com.seoulmoment.app.dev`               | `tw.com.seoulmoment.app`                        |
| scheme             | `seoulmoment-dev`                          | `seoulmoment`                                   |
| API / web          | `api-dev…` / `dev-seoulmoment.netlify.app` | `api.seoulmoment.com.tw` / `seoulmoment.com.tw` |
| EAS profile        | `development` (internal APK)               | `production`                                    |

- Local `expo run:*` builds the **live** identifiers; the API comes from `.env`.
- Both identifiers are registered in the LINE Developers console. Any new console that keys on
  package/bundle id needs both.
- Package names are fixed once uploaded to Play — do not rename the live one.

## Platform gotchas

- **`Touchable` must not hand `Pressable` a function `style`.** NativeWind merges `className`
  into `style` and only understands arrays/objects; a function drops the caller's style whole
  (b968653b).
- `numColumns` FlatList cells: size cards with `w-full`, never `flex-1` (basis 0 lets the image
  overflow into the next row, ce8a3ae9).
- A `Modal`'s open animation must start from `onShow`; starting it in an effect on
  `visible` runs before native views exist (41a93c9f). Animate backdrop and panel separately
  with `animationType="none"` (773a6c6a).
- Do not keep sheet state inside a FlatList header — list re-renders discard it (848a75ce).
- RN throws on colours it cannot parse; validate server-provided hex before `backgroundColor`
  (5f480391).
- Android `Share` ignores `url` — put the link in `message` (50f9b12b). Share web URLs
  (`WEB_BASE_URL`), never `seoulmoment://` deep links.
- OTP fields: `textContentType="oneTimeCode"` (iOS) and `autoComplete` `sms-otp` / `email-otp`
  (Android) — `AuthField otp="sms" | "email"`. `onComplete` passes the value; do not read state
  there (06451234).
- Date display uses local `getFullYear/Month/Date`, not `toISOString` (UTC shifts the day,
  0d803045).
- Zustand `set` merges top-level keys: to clear a field, set it to `undefined` explicitly
  (c6e9bbd9).
- Do not nest a vertical FlatList inside a ScrollView; fixed short lists render with `map`
  (762dfbf4).
- `*.web.tsx` siblings exist to keep native-only code out of the web bundle; deleting one pulls
  the native file in (6e851f76).

## Verifying

- `pnpm --filter @seoul-moment/mobile lint` and `typecheck` (also `typecheck:mobile` at root).
- An export catches bundling errors that typecheck misses:
  `pnpm exec expo export --platform ios --output-dir <tmp>`.
- Layout and flows: look at the screen — the `mobile-simulator` skill drives the emulator
  (deep links, screenshots, taps). Do **not** start or restart Metro; the user runs it.
- Probe endpoints that create nothing (validate, verify with a bogus code) rather than
  endpoints that send mail or create accounts/orders.
