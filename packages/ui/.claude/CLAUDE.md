# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

`@seoul-moment/ui` is a shared React component library used by both `apps/web` (Next.js) and `apps/admin` (Vite + React Router). Built on Radix UI primitives with Tailwind CSS v4 styling.

## Commands

```bash
# Build (ES + CJS bundles, type declarations, CSS)
pnpm build                     # or: pnpm -F @seoul-moment/ui build

# Dev (watches and rebuilds CSS only)
pnpm dev

# Lint
pnpm lint
```

After modifying components, run `pnpm build` to regenerate `dist/` before testing in consuming apps.

## Build Pipeline

Three sequential steps in `pnpm build`:

1. **`vite build`** - Bundles to `dist/index.js` (ES) and `dist/index.cjs` (CJS) with sourcemaps. React, react-dom, and all `@radix-ui/*` packages are externalized.
2. **`tsc -b --force`** - Emits declaration files to `dist/types/` (declaration-only, no JS output).
3. **`@tailwindcss/cli`** - Compiles `src/styles.css` to `dist/styles.css`.

## Component Patterns

### Adding a New Component

1. Create `src/components/ui/<component>.tsx`
2. Re-export from `src/components/ui/index.ts`
3. `src/index.ts` already re-exports everything from `src/components/ui`

### Conventions

- **Named exports only** - no default exports
- **`"use client"` directive** - add to components using React hooks or browser APIs (e.g., Button uses it; Flex does not)
- **`cn()` utility** (`src/lib/utils.ts`) - use `cn(baseClasses, conditionalClasses, className)` for all class composition. It wraps `clsx` + `tailwind-merge`
- **Variant styling** - use plain object maps (e.g., `VARIANT_CLASSES`, `SIZE_CLASSES`) for variants rather than `class-variance-authority` in most components. CVA is a dependency but not consistently used
- **Polymorphic `as` prop** - layout components (Flex, VStack, HStack) accept an `as` prop restricted to semantic HTML elements
- **`asChild` pattern** - interactive components (Button) use Radix `Slot` for composition via `asChild` prop
- **Props extending native elements** - use `React.ComponentProps<"element">` (not `React.HTMLAttributes`)
- **`data-slot` attribute** - add to root element for CSS targeting (e.g., `data-slot="button"`)

### Design Tokens

Component colors use CSS custom properties defined in `src/styles.css` (`:root` and `.dark` scopes). Shared design tokens (brand colors, typography, spacing) come from `packages/tailwind-config`.

### Consumer Setup

Apps must configure Tailwind to scan this package's source files and import styles:

```css
@source "../../packages/ui/src/**/*.{ts,tsx}";
@import "tailwindcss";
@import "@seoul-moment/tailwind-config";
@import "@seoul-moment/ui/styles.css";
```

## Architecture

```
src/
  index.ts              # Package entry: re-exports components + cn()
  styles.css            # CSS custom properties (color tokens, light/dark)
  lib/utils.ts          # cn() utility
  components/ui/        # All components (flat structure, one file per component)
    index.ts            # Barrel re-exports
```

The package uses path alias `@` -> `src/` (configured in vite.config.ts) but components currently use relative imports.

## Peer Dependencies

Consumers must provide `react`, `react-dom`, and `lucide-react`.
