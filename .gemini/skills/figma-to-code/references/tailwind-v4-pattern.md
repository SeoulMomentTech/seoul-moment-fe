# Tailwind v4 Coding Pattern for Seoul Moment

This document provides a guide for utilizing project-specific tokens and patterns when converting Figma designs into Tailwind v4 classes.

## 1. Theme Variables and Token System

The project uses CSS variables defined in `packages/tailwind-config/shared-styles.css` and `@theme` extensions. Use the following token classes instead of hardcoding HEX values.

### Colors
- **Brand**: `text-brand`, `bg-brand`, `border-brand` (Mapped to Figma's Primary/Brand color)
- **Neutral**: 
  - `text-neutral` (Base text, #707070)
  - `text-foreground` (Strong text, #171717)
  - `border-neutral-subtle` (#DDDDDD)
- **Surface**: `bg-surface-soft` (#F0F6FF)
- **Feedback**:
  - `text-info`, `bg-info` (#0088FF)
  - `text-danger`, `bg-danger`, `text-error` (#FF383C)

### Typography
Figma text styles are mapped to the following custom utility classes:

| Figma Style | Tailwind v4 Class | Size |
| :--- | :--- | :--- |
| Title 1 | `text-title-1` | 36px |
| Title 2 | `text-title-2` | 32px |
| Title 3 | `text-title-3` | 24px |
| Title 4 | `text-title-4` | 20px |
| Body 1 | `text-body-1` | 18px |
| Body 2 | `text-body-2` | 16px |
| Body 3 | `text-body-3` | 14px |
| Body 4 | `text-body-4` | 13px |
| Body 5 | `text-body-5` | 12px |

## 2. Tailwind v4 Key Syntax Patterns

### Avoid Arbitrary Values
Avoid using arbitrary values like `w-[342px]` unless the design values absolutely do not match any tokens. Use project spacing tokens whenever possible.

### Utilize Inline Theme
The project follows the new CSS-first setup of `v4`. You can directly use CSS variables (`var(--token)`) if you need to extend styles dynamically inside components.

### Minimize Absolute/Relative Positioning
Avoid using `absolute` and `relative` positioning unless absolutely necessary (e.g., for overlays, floating icons, or badges). Rely on Flexbox (`VStack`, `HStack`) and Grid layouts to manage the document flow. This ensures better maintainability and responsiveness across different screen sizes.

### Component-First Approach
Prioritize using components from the `@seoul-moment/ui` package over raw Tailwind class combinations.
- **Button**: `<Button variant="primary">`
- **Tabs**: `<Tabs>`, `<TabsList>`, `<TabsTrigger>`

## 3. Code Conversion Example

**Figma Design:**
- Background: #F0F6FF
- Text: "Seoul Moment", 24px Bold, #171717
- Button: Orange (#f37b2a), White Text, 16px

**Converted Code:**
```tsx
<div className="bg-surface-soft p-6">
  <h1 className="text-title-3 font-bold text-foreground">
    Seoul Moment
  </h1>
  <Button className="mt-4 bg-brand text-neutral-0 text-body-2">
    Confirm
  </Button>
</div>
```
