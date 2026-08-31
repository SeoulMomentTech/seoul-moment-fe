# Changelog

All notable changes to `@seoul-moment/web` are documented here.

## 1.1.1 — 2026-08-31

### Fixes

- Enable ISR on the home page to unfreeze build-time data (`095ef3e`)

## 1.1.0 — 2026-08-27

### Features

- Add LINE SNS auth API and mutation hooks (`762e6e8`)
- Wire up LINE login UI on top of the SNS auth flow (`10a0dcc`)
- Add LINE email-verification step API and hooks (`5e8dc4c`)
- Verify a LINE email inside the SNS signup form (`c155bdc`)
- Label the nickname field on the SNS signup form (`357facd`)
- Let the signup submit decide whether a LINE email is taken (`582b76b`)
- Add an error-info util and read the server message through it (`a4ec27d`)

### Fixes

- Complete the LINE login handshake after the LIFF redirect (`c8c6dac`)
- Surface the server message when SNS login fails (`5d72bb0`)
- Drop the One Tap prompt moments FedCM no longer reports (`458d2cb`)
- Route the LINE email verify response through the link-confirm branch (`8a0a0bd`)
- Keep standard scrollbar properties behind a `@supports` guard (`7cb6a5e`)

### Other

- Model SNS signup state as tagged unions (`d454050`)
- Move toasts to the top center (`91f0ea8`)
- Centralize shared versions in a pnpm catalog (`1459e29`)
- Sync locales from sheet (`f38153a`)
- Sync SNS auth notes with the current flow (`e02ee6f`)

## 1.0.0 — 2026-08-19

First tagged release. Establishes the versioning baseline for `@seoul-moment/web`;
everything up to this point shipped through untagged `develop` → `main` promotions.

No functional changes in this release — the `main..develop` range contains only
repository tooling (`.claude/skills/release-deployer/SKILL.md`) and the root
`package.json` version bump. No `apps/web/**` path changed, so Netlify will not
rebuild the web app.
