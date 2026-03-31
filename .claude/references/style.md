# Styling & UI Components

## Tailwind CSS v4

- **Utility-first inline classes** — no CSS modules
- Use design tokens from the shared config; avoid arbitrary values when a token exists
- Class composition: `cn()` utility from `@seoul-moment/ui` (wraps `clsx` + `tailwind-merge`)

```tsx
import { cn } from "@seoul-moment/ui";

<div className={cn("flex items-center", isActive && "text-brand")} />
```

## Design Tokens

Defined in `packages/tailwind-config/shared-styles.css` and mapped to Tailwind theme:

### Colors (use as `text-brand`, `bg-danger`, etc.)

| Token            | CSS Variable       | Value     |
| ---------------- | ------------------ | --------- |
| `brand`          | `--brand-500`      | `#f37b2a` |
| `neutral`        | `--neutral-600`    | `#707070` |
| `neutral-subtle` | `--neutral-200`    | `#dddddd` |
| `surface-soft`   | `--surface-soft`   | `#f0f6ff` |
| `info`           | `--info-500`       | `#0088ff` |
| `danger`         | `--danger-500`     | `#ff383c` |
| `background`     | `--background`     | `#ffffff` |
| `foreground`     | `--foreground`     | `#171717` |

### Typography (use as `text-title-1`, `text-body-3`, etc.)

| Token       | Size  |
| ----------- | ----- |
| `title-1`   | 36px  |
| `title-2`   | 32px  |
| `title-3`   | 24px  |
| `title-4`   | 20px  |
| `body-1`    | 18px  |
| `body-2`    | 16px  |
| `body-3`    | 14px  |
| `body-4`    | 13px  |
| `body-5`    | 12px  |

### Duration (use as `duration-fast`, `duration-slow`, etc.)

| Token     | Value  |
| --------- | ------ |
| `instant` | 0ms    |
| `fast`    | 100ms  |
| `normal`  | 200ms  |
| `slow`    | 300ms  |
| `slower`  | 500ms  |

## CSS Import Order

Both apps follow this import sequence:

```css
@import "tailwindcss";
@import "@seoul-moment/tailwind-config";
@import "@seoul-moment/ui/styles.css";
```

Web adds: Pretendard font import, `tailwind-scrollbar-hide/v4`, custom scrollbar utilities.

## @seoul-moment/ui Component Library

Import from `@seoul-moment/ui`:

```tsx
import { Button, Dialog, Input, Card, VStack, HStack, Flex } from "@seoul-moment/ui";
```

### Available Components (23)

**Form**: Button, Input, Textarea, Label, Form, Select, Radio, Switch, SearchBar
**Layout**: Card (+ Header/Title/Description/Action/Content/Footer), Flex, VStack, HStack
**Overlay**: Dialog, Drawer, DropdownMenu
**Display**: Tabs, Accordion, Table, Avatar, Badge, Skeleton, Spinner

### Component Patterns

- Built on **Radix UI** primitives for accessibility
- Use `data-slot` attribute for styling hooks
- Support `asChild` prop with Radix `Slot` for composition:

```tsx
<Button asChild>
  <a href="/link">Link styled as button</a>
</Button>
```

- Variants defined as plain objects (e.g., `VARIANT_CLASSES`, `SIZE_CLASSES`):

```tsx
<Button variant="outline" size="sm">Click</Button>
// variants: "default" | "outline" | "ghost" | "destructive"
// sizes: "sm" | "md" | "lg"
```

- Layout primitives for flex composition:

```tsx
<VStack className="gap-4">
  <HStack className="justify-between">
    <span>Left</span>
    <span>Right</span>
  </HStack>
</VStack>
```

## Custom Animations

Defined in shared-styles.css, available as Tailwind utilities:

- `animate-accordion-down` / `animate-accordion-up`
- `animate-in` / `animate-out` (enter/exit with customizable transforms)
- `fade-in-0` / `fade-out-0`
- `zoom-in-95` / `zoom-out-95`
- `slide-in-from-top` / `slide-in-from-bottom` / `slide-in-from-left` / `slide-in-from-right`
- `slide-out-to-top` / `slide-out-to-bottom` / `slide-out-to-left` / `slide-out-to-right`
- Smaller variants: `slide-in-from-top-2` (0.5rem offset)

## Toasts

Use `sonner` library for toast notifications:

```tsx
import { toast } from "sonner";

toast.success("Saved!");
toast.error("Something went wrong");
```
