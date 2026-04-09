# Seoul Moment Frontend Monorepo

다국어 e-commerce/content 플랫폼의 프론트엔드 모노레포.

## Structure

- `apps/web` — Next.js 15 메인 서비스 (i18n: ko, en, zh-TW)
- `apps/admin` — Vite 7 + React Router v7 admin backoffice
- `packages/ui` — 공유 Radix UI 컴포넌트 라이브러리 (@seoul-moment/ui)
- `packages/tailwind-config` — 공유 Tailwind CSS v4 config
- `packages/eslint-config` — 공유 ESLint v9 config
- `packages/prettier-config` — 공유 Prettier config

앱별 상세 가이드 (명령어, 아키텍처, API, 코딩 규약 포함):
- Web: `apps/web/.codex/AGENTS.md`
- Admin: `apps/admin/.codex/AGENTS.md`
- UI: `packages/ui/.codex/AGENTS.md`

## Monorepo Tooling

- **pnpm workspaces** (v10) + **Turborepo**로 task orchestration 및 caching
- **Husky** pre-commit hooks → lint-staged (ESLint + Prettier on staged files)
- 패키지 참조: `workspace:*` protocol
- Pipeline 정의: `turbo.json`

## Codex Hooks

- 레포 로컬 훅 설정: `.codex/hooks.json`
- `Stop` hook: 각 작업 종료 시 `pnpm run lint:fix:all` 실행 (`apps/web`, `apps/admin` lint fix)
- 사용 전 개인 환경 `~/.codex/config.toml`의 `[features]`에 `codex_hooks = true` 설정 필요
