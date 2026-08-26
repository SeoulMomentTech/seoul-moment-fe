# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seoul Moment frontend monorepo: a multilingual e-commerce/content platform with two apps and shared packages.

- **apps/web** - Next.js 16 (App Router, Turbopack) main service with i18n (ko, en, zh-TW)
- **apps/admin** - Vite 7 + React Router v7 SPA admin backoffice
- **packages/ui** - Shared Radix UI component library (@seoul-moment/ui)
- **packages/tailwind-config** - Shared Tailwind CSS v4 config
- **packages/eslint-config** - Shared ESLint v9 config
- **packages/prettier-config** - Shared Prettier config

App-specific guides (commands, architecture, API layer, conventions):
- Web: [`apps/web/.claude/CLAUDE.md`](../../apps/web/.claude/CLAUDE.md)
- Admin: [`apps/admin/.claude/CLAUDE.md`](../../apps/admin/.claude/CLAUDE.md)
- UI: [`packages/ui/.claude/CLAUDE.md`](../../packages/ui/.claude/CLAUDE.md)

## Monorepo Tooling

- **pnpm workspaces** (v10) with **Turborepo** for task orchestration and caching
- **Husky** pre-commit hooks run lint-staged (ESLint + Prettier on staged files); the formatter may reorder/remove imports during commit, so re-read modified files before chained edits
- **GitHub Actions** `ci.yml` runs `pnpm typecheck` + `pnpm lint` on PRs to `develop`
- Package references use `workspace:*` protocol

### Dependency versions (catalog)

Anything used by **2+ workspaces** lives in the `stable` catalog in `pnpm-workspace.yaml`; each
package.json references it as `"catalog:stable"`. Bump the version there, not in package.json.
Single-app deps (`next`, `axios`, `swiper`, …) stay declared locally as normal ranges.

Two rules that are easy to get wrong:

- **peerDependencies are never catalogued.** Peer ranges are deliberately wide (`react: ^19.0.0`);
  collapsing them onto the catalog's exact pin would over-constrain consumers of `@seoul-moment/ui`.
- **`pnpm.overrides` still holds `postcss`.** It is a security pin (4 GHSAs) on a *transitive*
  dependency of `@tailwindcss/postcss` and `vite`. Catalogs only reach direct dependencies, so this
  one cannot move — see 0bc70ba. `packages/ui` is `private: false`, so if it is ever published it
  must go out via `pnpm publish`, which rewrites `catalog:` to real versions; plain `npm publish`
  would ship the unresolved protocol.

The four `tailwindcss` / `@tailwindcss/*` entries are pinned exactly and must move together — they
are one release train, and letting them drift installs multiple copies of the engine.

For an experiment that spans several packages, add a `beta` catalog and point only the packages
under test at `catalog:beta`. Catalogs do **not** compose (`catalog:beta` will not fall back to
`stable`), and pnpm never warns about an unused catalog — so restore the references and delete the
`beta` block in the same commit that ends the experiment.

## TypeScript 6/7 Dual Setup

TypeScript 7 is the Go-native compiler. It ships **no compiler API** (stable API lands in 7.1),
so anything that does `require("typescript")` — typescript-eslint, Next.js, tsconfck — cannot run
on it. `apps/web`, `apps/admin`, and `packages/ui` therefore install both, via npm aliases. Both
aliases live in the `stable` catalog, so the pair is defined once in `pnpm-workspace.yaml`:

```yaml
"@typescript/native": npm:typescript@~7.0.2          # real TS 7  -> `tsc`  binary
typescript: npm:@typescript/typescript6@~6.0.2       # TS 6 API   -> `tsc6` binary
```

The three packages just carry `"typescript": "catalog:stable"` and `"@typescript/native":
"catalog:stable"`.

| Runs on | What |
| --- | --- |
| **TS 7** (`tsc`) | `pnpm typecheck`, `apps/admin` `tsc -b`, `packages/ui` `.d.ts` emit |
| **TS 6** (`typescript` API) | ESLint / typescript-eslint, `next build` type check, editor |

**Never point the `typescript` name at TS 7.** typescript-eslint hard-errors
(`typescript-eslint does not support TS 7.0`) and pnpm `overrides` cannot fix it — `typescript`
is a *peerDependency*, so it always resolves from the importing package.

`apps/web/next.config.ts` sets `experimental.useTypeScriptCli: false` for the same reason: Next 16
defaults to spawning `typescript`'s `bin.tsc`, and the compat package only exposes `tsc6`, which
would break `next build`. API mode costs ~8s extra on `next build` (10s → 18s).

**When TS 7.1 ships a stable API**: replace the two catalog entries with a plain
`typescript: ~7.x` (one edit, all three packages follow), drop the `@typescript/native` references,
remove `useTypeScriptCli` from `next.config.ts`, and delete the `typecheck:ts6` scripts.

Each package has a `typecheck:ts6` script (`tsc6`) to cross-check TS 7 results against TS 6 when a
diagnostic looks suspicious. Editors use VS Code's bundled TypeScript; the compat package ships no
`tsserver.js`, so do **not** set `typescript.tsdk` to `node_modules/typescript/lib`. For a TS 7
language server, install the official "TypeScript 7" VS Code extension — note the Next.js LS plugin
(`plugins: [{ "name": "next" }]`) only works under the TS 6 tsserver.

## Root Commands

Common monorepo-wide tasks (filtered variants live in sub-CLAUDE.md files):

```bash
pnpm dev                  # Run dev for every workspace (turbo run dev)
pnpm build                # Build every workspace
pnpm lint                 # Lint every workspace
pnpm lint:fix:all         # Auto-fix web + admin
pnpm typecheck            # Type-check every workspace with TS 7 (web runs `next typegen` first)
pnpm test:e2e             # Run all Playwright e2e suites
pnpm i18n:sync            # Sync web translations from Google Sheets
```

App-scoped shortcuts (`dev:web`, `dev:admin`, `build:ui`, `test:web-e2e`, etc.) are also exposed at root via Turborepo `--filter`.

## Detailed References

For deeper conventions with code examples, see `.claude/references/`:

- **[general.md](references/general.md)** — TypeScript rules, ESLint conventions, import ordering, restricted imports, FSD layer rules, React rules, Toss frontend principles
- **[style.md](references/style.md)** — Tailwind v4 design tokens, CSS import order, @seoul-moment/ui component catalog and patterns, custom animations
- **[api.md](references/api.md)** — Web (ky) / Admin (axios) API layers, service file patterns, query hook wrappers, token refresh flow
- **[sns-auth-flow.md](references/sns-auth-flow.md)** — Web SNS(Google) 로그인·가입 3-step 플로우 (login/link/signup), 공통 가입 화면 + Google 전용 통신 계층
