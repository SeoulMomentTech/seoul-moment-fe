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

Baseline conventions every component follows:

- **Named exports only** — no default exports
- **`cn()` utility** (`src/lib/utils.ts`) — wraps `clsx` + `tailwind-merge`. Use `cn(baseClasses, conditionalClasses, className)` for all class composition so consumer-supplied `className` always wins.
- **Spread `{...props}`** onto the rendered element so consumers can pass any native attribute.

### Variant Styling: Object Map vs CVA

Default to **plain object maps** keyed by variant name. This is what most components use — see `src/components/ui/button.tsx`:

```tsx
const VARIANT_CLASSES = {
  default: "bg-black text-white hover:bg-neutral-800",
  outline: "border border-neutral-200 bg-white text-black hover:bg-neutral-100",
  ghost: "bg-transparent hover:bg-neutral-100 text-black",
  destructive: "bg-red-600 text-white hover:bg-red-700",
};
const SIZE_CLASSES = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-base", lg: "h-12 px-6 text-lg" };
// ...
className={cn("inline-flex ...", VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
```

Use **`cva`** only when you need to derive the variant prop type via `VariantProps<typeof xxxVariants>`. Currently only `src/components/ui/badge.tsx` does this:

```tsx
const badgeVariants = cva("inline-flex ...", {
  variants: { variant: { default: "...", secondary: "...", destructive: "...", outline: "..." } },
  defaultVariants: { variant: "default" },
});
type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean };
```

Both are valid. Pick object map unless you specifically want `VariantProps` inference.

### Polymorphic `as` Prop

Layout primitives (`Flex`, `HStack`, `VStack`) accept an `as` prop typed by `Extract<ElementType, ...>` so only semantic tags are allowed. The component is generic over the element. See `src/components/ui/flex.tsx`:

```tsx
export interface FlexBaseProps {
  as?: Extract<ElementType, "div" | "main" | "aside" | "footer" | "header" | "section" | "span" | "nav" | "article" | "form" | "ul" | "ol" | "li">;
  // ...
}
export type FlexProps<T extends ElementType> = PropsWithChildren<
  FlexBaseProps & Omit<ComponentPropsWithoutRef<T>, keyof FlexBaseProps>
>;
export function Flex<T extends ElementType = "div">({ as = "div", ...props }: FlexProps<T>) {
  const Component = as;
  return <Component {...props} />;
}
```

### Slot + asChild Composition

Interactive/wrappable components accept `asChild?: boolean` and switch the rendered element to Radix `Slot`. Used by `Button`, `Badge`. See `src/components/ui/button.tsx`:

```tsx
import { Slot } from "@radix-ui/react-slot";

export function Button({ asChild = false, className, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(...)} {...props} />;
}
```

This lets consumers wrap, e.g., `<Button asChild><Link href="..." /></Button>` so the styles apply to the child.

### Sub-Components (Radix Wrappers)

Radix primitives are wrapped as separate **prefix-named** components, not dot-notation compounds. Each part is its own export with its own `data-slot`. See `src/components/ui/tabs.tsx`:

```tsx
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) { ... }
function TabsList(...) { ... }
function TabsTrigger(...) { ... }
function TabsContent(...) { ... }

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

Same shape in `avatar.tsx` (`Avatar`, `AvatarImage`, `AvatarFallback`) and `dialog.tsx` (10 exports including `Dialog`, `DialogContent`, `DialogTrigger`, `DialogTitle`, `DialogPortal`, ...). Do **not** attach sub-components as static properties (e.g., `Tabs.List`).

### Icon Prop via cloneElement

When a component renders a swappable SVG, take it as `icon?: React.ReactElement` and inject classes/aria via `React.cloneElement`. See `src/components/ui/spinner.tsx`:

```tsx
const iconToRender = icon || defaultIcon;
return React.cloneElement(iconToRender, {
  "aria-label": "Loading",
  role: "status",
  className: cn("size-4 animate-spin", className, iconToRender.props.className),
  ...props,
} as React.ComponentProps<"svg">);
```

Note the order: caller `className` is merged with the consumer's element's existing className via `cn()`.

### Ref Forwarding

Most components do **not** forward refs — they spread `{...props}` onto a native element which already accepts `ref`. Only `src/components/ui/search-bar.tsx` uses `React.forwardRef`, because it renders a wrapping `<div>` and needs to expose the inner `<input>` ref:

```tsx
const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, onSearch, ...props }, ref) => (
    <div className={cn("relative ...", className)}>
      <input ref={ref} {...props} />
      <Search ... />
    </div>
  ),
);
SearchBar.displayName = "SearchBar";
```

Reach for `forwardRef` only when the component wraps the user-facing element in extra DOM.

### Props Typing

Two styles coexist; both are accepted:

1. **`interface ... extends React.ComponentProps<"el">`** — used by `input.tsx`, `search-bar.tsx`, `button.tsx`:
   ```tsx
   export interface ButtonProps extends React.ComponentProps<"button"> {
     variant?: "default" | "outline" | "ghost" | "destructive";
     // ...
   }
   ```
2. **Inline intersection** — used by `badge.tsx` to mix `VariantProps`:
   ```tsx
   function Badge({ ... }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) { ... }
   ```

For Radix wrappers, type props as `React.ComponentProps<typeof XxxPrimitive.Yyy>` so you inherit Radix's full surface (see `tabs.tsx`).

Always extend `React.ComponentProps<"element">` — not `React.HTMLAttributes` — so refs and element-specific props (e.g., `disabled` on `<button>`) are included.

### `data-slot` Attribute

Every root element (and each sub-component's root) gets `data-slot="<component-name>"`. This is used for CSS targeting and devtools inspection. Examples: `data-slot="button"`, `data-slot="tabs-trigger"`, `data-slot="badge"`. Apply it before spreading props.

### `"use client"` Directive

Add `"use client";` only when the component uses React hooks, Radix primitives that rely on hooks/portals, or browser APIs. Current usage:

- **With** `"use client"`: `accordion.tsx`, `avatar.tsx`, `button.tsx`, `dialog.tsx`, `drawer.tsx`, `dropdown-menu.tsx`, `form.tsx`, `label.tsx`, `radio.tsx`, `select.tsx`, `switch.tsx`, `table.tsx`, `tabs.tsx`
- **Without**: pure layout/markup components — `badge.tsx`, `card.tsx`, `flex.tsx`, `hstack.tsx`, `input.tsx`, `search-bar.tsx`, `skeleton.tsx`, `spinner.tsx`, `textarea.tsx`, `vstack.tsx`

Omitting the directive on server-renderable components keeps consuming Next.js apps RSC-friendly.

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
