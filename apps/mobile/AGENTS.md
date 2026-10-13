`@seoul-moment/mobile` — the Seoul Moment iOS / Android app. Expo SDK 57 + React Native 0.86 + React 19, Expo Router, NativeWind v5 (RC) + Tailwind v4, TanStack Query v5 + ky, Zustand. It ports `apps/web` screen by screen, so when building a screen read web's version first and match its API calls, copy keys and section order. The web target (`pnpm web`) is for development checks only.

Detailed conventions, with the commit behind each rule: [`.claude/references/mobile.md`](../../.claude/references/mobile.md). Monorepo-wide rules (catalog, TS 6/7 setup, commit flow): [`.claude/CLAUDE.md`](../../.claude/CLAUDE.md).

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

pnpm workspace. Install from the repo root (`pnpm install`); run app scripts in `apps/mobile` or through the root filters.

```bash
pnpm start                  # Metro dev server (root: pnpm dev:mobile)
pnpm android | pnpm ios     # expo run:* — builds and installs the dev build (root: dev:mobile:android|ios)
pnpm lint                   # ESLint (root: lint:fix:mobile)
pnpm typecheck              # TS 7 (root: typecheck:mobile); typecheck:ts6 to cross-check
pnpm exec expo export --platform ios --output-dir <tmp>   # bundle check — catches what typecheck misses
npx expo install <package>  # ALWAYS instead of pnpm add for Expo/RN packages — pins SDK-compatible versions
npx expo install --check    # SDK version drift
pnpm i18n:sync              # (root) sync copy from the Google Sheet into web AND mobile
```

Run lint and typecheck before declaring any task done. **Never start, stop or restart Metro** — the user runs it; attach to what is running. To look at a screen, use the `mobile-simulator` skill.

## Architecture

```
src/app/ → features/ → entities/ → shared/      (import downward only)
```

- `src/app/` — Expo Router routes only, kept thin (read params, render a feature screen). Every route is also listed in the root `Stack` in `app/_layout.tsx`. Import `Link`, `router`, `useLocalSearchParams` from `expo-router`.
- `features/<name>/` — `ui/` screens, `model/` hooks and stores, `lib/` pure logic, `index.ts` barrel. A feature must not import another feature; move shared pieces down.
- `entities/<domain>/` — query hooks + `keys.ts` and cards shared across features.
- `shared/` — `services/` (ky API), `lib/` (auth, query, i18n, utils), `ui/` primitives. No domain knowledge, never imports upward.
- `constants/theme.ts` — `Spacing`, `CardRow`, `HeaderHeight` and the type-size roles.
- Aliases: `@shared/*`, `@entities/*`, `@features/*`, `@/*` (= `src/*`).

## Rules that are easy to get wrong

- **Data**: `useAppQuery` / `useAppMutation` only (raw TanStack hooks are ESLint-banned). Guard renders in the order `paused → isPending → isError → empty → data`; offline queries pause rather than fail.
- **401 that is not a dead session** (wrong code, expired one-time token) must send `SKIP_AUTH_RETRY_HEADER`, or the client refreshes and logs the user out.
- **Pressables** go through `Touchable` (`@shared/ui/press`), buttons through `Button` (`@shared/ui/button`). Check `shared/ui` before drawing a new shape.
- **Copy** comes from `useTranslations()` — `t("key")`. Never hard-code UI text and never hand-edit `shared/lib/i18n/messages/*.json`; they are generated from the sheet.
- **Alert** is only for questions the user must answer; announcements use `showToast()`.
- **Icons** are SVGs in `@shared/ui/icons`; no Unicode glyphs as icons.
- **Styling**: NativeWind `className` with the shared tokens (`@seoul-moment/tailwind-config/tokens`, same as web). `cn` from `@seoul-moment/ui/utils` — never the `@seoul-moment/ui` root. Light theme only. Brand orange means "chosen / can go there"; primary actions are black; errors are `danger`.
- **Skeletons** match the real layout's height; change both together.

## Native code, dev build and variants

- LINE login is a native module, so the app runs on a **dev build** (`pnpm android`). Expo Go still runs every other screen; native-only modules are imported lazily and skipped under Expo Go.
- `ios/` and `android/` are generated (Continuous Native Generation) and gitignored. Never create or edit them — configure native behavior in `app.json`, `app.config.ts` and config plugins.
- Expo Go only includes its bundled native modules. Prefer packages from Expo's bundled set; anything else forces a dev-client rebuild. Check available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
- `app.config.ts` switches identifiers on `APP_VARIANT`: `development` → `tw.com.seoulmoment.app.dev` / `seoulmoment-dev://`, unset → live `tw.com.seoulmoment.app` / `seoulmoment://`. `eas.json` profiles `development` and `production` set it with the matching API and web URLs. Local `expo run:*` builds the live identifiers.
- Env: `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_WEB_BASE_URL`, `EXPO_PUBLIC_LINE_CHANNEL_ID` in `apps/mobile/.env` (see `.env.example`). Unset URLs fall back to **live**.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`). Run EAS CLI as `npx eas-cli@latest <command>`; substitute that for bare `eas` in docs examples. The project is not linked to EAS yet (`eas init`), and signing credentials are not set up.
Docs: https://docs.expo.dev/eas/index.md
