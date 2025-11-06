# Seoul Moment Frontend Monorepo

This repository now follows a pnpm-based monorepo layout. The existing Next.js application lives in `apps/web`, and additional apps or shared packages can be added under `apps/*` and `packages/*`.

## Structure

- `apps/web` – primary Next.js application
- `packages/*` – (optional) shared libraries and utilities
- Root configs – workspace-wide tooling such as Husky hooks and lint-staged rules

## Scripts

Run commands from the repository root (all executed through Turborepo):

```bash
pnpm dev         # start the web app in watch mode
pnpm dev:admin   # start the Vite admin app
pnpm build       # run builds for every package
pnpm start       # launch the production Next.js server
pnpm lint        # lint every package
pnpm lint:fix    # lint web with --fix
pnpm i18n:sync   # sync locale data for the web app
```

You can still `cd` into each app (`apps/web`, `apps/admin`) and run their scripts directly when you need more fine-grained control.

## Tooling

- Husky git hooks live at the repository root (`.husky`)
- lint-staged formats/lints staged files in `apps/web` and `apps/admin`
- turborepo pipeline definition: `turbo.json`
- pnpm workspace definition: `pnpm-workspace.yaml`
- pnpm uses isolated `node_modules` per package (`.npmrc`)

## Adding More Packages

1. Create a new folder under `apps/` or `packages/`
2. Add its own `package.json`
3. Install dependencies with `pnpm install`
4. Reference the package using standard pnpm workspace tooling (`pnpm --filter` or package aliases)

This setup keeps the Next.js app intact while making space for shared UI kits, server apps, or other tooling in the monorepo.
