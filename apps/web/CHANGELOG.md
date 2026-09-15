# Changelog

All notable changes to `@seoul-moment/web` are documented here.

## 1.3.0 — 2026-09-16

### Features

- Add the order form page (`057b362`)
- Link the cart order button to the order form (`3e76282`)
- Enable the order pay button once the address is complete (`12df609`)

### Fixes

- Repair the order shipping fields flagged in the UI review (`1456823`)
- Normalise the order phone number to one +886 form (`da62c84`)
- Let the cart order CTA fill its whole button (`9ef239c`)
- Put the order page behind a suspense boundary (`7de03ee`)

### Other

- Lift the shared user queries and region data out of mypage (`efb2508`)
- Drop the order agreement section (`04fc3e5`)
- Drop the disabled buy-now button from product detail (`dd7c222`)
- Correct the order mockup shipping fee and add the agreement section (`78f6276`)
- Sync locales from sheet (`ed79faf`)

## 1.2.0 — 2026-09-14

### Features

- Add the cart and order API services (`6cf582e`)
- Add the user cart query and mutation hooks (`f580934`)
- Drive the cart from the server cart API (`613bd56`)
- Add cart lines in one batched request (`a490168`)
- Drive the cart badge from the server count (`dc133b2`)
- Add a save-for-later cart (`589be37`)
- Slide the cart's recently-viewed row with prev/next on PC (`3986e7b`)
- Surface sold-out and low stock across the cart flow (`5256868`)
- Label the cart shipping fee as a main-island estimate (`196321e`)
- Add options and quantity to the product page, and wire it to the cart (`2f16e20`)
- Pick a cart SKU from one combination select (`283a4f6`)
- Generate OptionType from the product option API (`5c5c557`)
- Cc the verified address on contact inquiries (`91a55b9`)

### Fixes

- Repair the product build broken by the option type migration (`9e6ba01`)
- Count only selectable lines in the brand checkbox (`a1ccd92`)
- Pin the product page control height so the CTA row lines up (`e6687ed`)
- Render season collection description line breaks as paragraphs (`b9ce021`)
- Handle CRLF and CR in splitLineBreaks (`d34aafa`)
- Drop empty lines and use stable keys in SeasonCollection (`ea065c4`)
- Align PromotionDetailLoading with the real render (`b063c72`)

### Other

- Extract ProductDetailInfo from the product detail page (`9a51d02`)
- Extract ProductPrice from the product detail page (`877549d`)
- Use spacing scale instead of arbitrary values on ProductPage (`b0164c5`)
- Document the cart domain (`ea2970d`)
- Sync locales from sheet (`ac89a5b`, `a6e5c67`, `e690549`, `45e93d4`)

## 1.1.2 — 2026-08-31

### Other

- Use Tailwind spacing scale in PrimeSection (`1b53077`)

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
