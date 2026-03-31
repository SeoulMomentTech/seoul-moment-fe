# UI Components Pattern Guide (@seoul-moment/ui)

This document provides guidelines for utilizing the `@seoul-moment/ui` library when converting Figma designs into code.

## 1. Core Principles
- **No Raw Elements:** Never build standard UI elements (buttons, inputs, modals) using raw HTML (`<button>`, `<input>`, `<div>`) and Tailwind classes if a corresponding component exists in the `@seoul-moment/ui` library.
- **Import Path:** Always import UI components from the workspace package: `import { ... } from "@seoul-moment/ui";`

## 2. Layout Components (Critical)
The project strictly avoids using raw margins (`mt-4`, `mb-2`) for positioning sibling elements. Instead, layout primitives must be used to ensure consistent spacing.

- **VStack (Vertical Stack)**: Use for vertically aligning elements. Replaces `flex flex-col`.
  - Properties: `gap` (spacing between children, mapped to numeric values like 4, 8, 16).
- **HStack (Horizontal Stack)**: Use for horizontally aligning elements. Replaces `flex flex-row`.
  - Properties: `gap`, `justify` (start, center, between, end), `align` (start, center, end).
- **Flex**: General purpose flexible container when `VStack` or `HStack` is insufficient.

*Rule: Padding should still be applied to container elements using standard Tailwind utilities (e.g., `p-4`, `px-6`).*

## 3. Available Components
Ensure you check `packages/ui/src/components/ui/` for exact property types if unsure. Common components include:

- `Accordion`
- `Avatar`
- `Badge`
- `Button`
- `Card`
- `Dialog`
- `Drawer`
- `Input`
- `Label`
- `RadioGroup`
- `Select`
- `Table`
- `Tabs`
- `Textarea`

## 4. Code Conversion Example

**Bad Approach (Raw HTML & Margins):**
```tsx
<div className="flex flex-col p-6 bg-surface-soft">
  <div className="flex justify-between items-center w-full">
    <h2 className="text-title-4 font-bold text-foreground">Title</h2>
    <button className="bg-brand text-white px-4 py-2 rounded">Action</button>
  </div>
  <p className="mt-4 text-neutral text-body-3">Description text goes here.</p>
</div>
```

**Good Approach (Using `@seoul-moment/ui`):**
```tsx
import { VStack, HStack, Button, Card } from "@seoul-moment/ui";

export function ExampleCard() {
  return (
    <Card className="p-6 bg-surface-soft">
      <VStack gap={16}>
        <HStack justify="between" align="center">
          <h2 className="text-title-4 font-bold text-foreground">Title</h2>
          <Button variant="primary">Action</Button>
        </HStack>
        <p className="text-body-3 text-neutral">Description text goes here.</p>
      </VStack>
    </Card>
  );
}
```