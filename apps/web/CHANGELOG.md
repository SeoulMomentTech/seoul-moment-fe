# Changelog

All notable changes to `@seoul-moment/web` are documented here.

## 1.0.0 — 2026-08-19

First tagged release. Establishes the versioning baseline for `@seoul-moment/web`;
everything up to this point shipped through untagged `develop` → `main` promotions.

No functional changes in this release — the `main..develop` range contains only
repository tooling (`.claude/skills/release-deployer/SKILL.md`) and the root
`package.json` version bump. No `apps/web/**` path changed, so Netlify will not
rebuild the web app.
