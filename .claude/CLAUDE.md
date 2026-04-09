# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seoul Moment frontend monorepo: a multilingual e-commerce/content platform with two apps and shared packages.

- **apps/web** - Next.js 15 (App Router, Turbopack) main service with i18n (ko, en, zh-TW)
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
- **Husky** pre-commit hooks run lint-staged (ESLint + Prettier on staged files)
- Package references use `workspace:*` protocol

## Detailed References

For deeper conventions with code examples, see `.claude/references/`:

- **[general.md](references/general.md)** — TypeScript rules, ESLint conventions, import ordering, restricted imports, FSD layer rules, React rules, Toss frontend principles
- **[style.md](references/style.md)** — Tailwind v4 design tokens, CSS import order, @seoul-moment/ui component catalog and patterns, custom animations
- **[api.md](references/api.md)** — Web (ky) / Admin (axios) API layers, service file patterns, query hook wrappers, token refresh flow
