# Changelog

All notable changes to `@seoul-moment/admin` are documented here.

## 0.1.1 — 2026-09-14

No functional changes in this release — no `apps/admin/src/**` path changed. The shared
pnpm catalog moved `@tanstack/react-query` from `^5.90.6` to `^5.102.8`, which admin
consumes via `catalog:stable`, so its build output changes even though its source does not.

## 0.1.0 — 2026-08-27

First tagged release. Establishes the versioning baseline for `@seoul-moment/admin`;
everything up to this point shipped through untagged `develop` → `main` promotions.

No functional changes in this release — no `apps/admin/src/**` path changed. The only
admin-scoped edit moves its dependency declarations onto the shared pnpm catalog.

### Other

- Centralize shared versions in a pnpm catalog (`1459e29`)
