# General Coding Conventions

## TypeScript

- **Strict mode** enabled in all apps/packages
- No `any` — use proper typed interfaces
- `consistent-type-imports`: always use `import type { Foo }` for type-only imports
- `consistent-type-definitions`: prefer `interface` over `type` for object shapes
- `method-signature-style: method` — use `method(): void` not `method: () => void`
- Admin-specific: `noUnusedLocals: true`, `noUnusedParameters: true`, `erasableSyntaxOnly: true`

## Exports & Naming

- **Named exports only** — no default exports
- **PascalCase** for components
- **camelCase** for functions, hooks, variables
- **UPPER_SNAKE_CASE** for constants (e.g., `ANIMATION_DELAY_MS`)

## Import Ordering (ESLint enforced)

Groups with newlines between, alphabetized within each group:

```
1. builtin (node:fs, path, etc.)
2. external — react, react-dom first, then lucide-react, then others
3. internal — @/ aliases (@shared/, @entities/, @features/, etc.)
4. parent/sibling
5. index
```

## Restricted Imports

Direct use of TanStack React Query hooks is **banned** via ESLint. Always use the project wrappers:

| Banned                                          | Use Instead            |
| ----------------------------------------------- | ---------------------- |
| `useQuery` from `@tanstack/react-query`         | `useAppQuery`          |
| `useMutation` from `@tanstack/react-query`      | `useAppMutation`       |
| `useInfiniteQuery` from `@tanstack/react-query` | `useAppInfiniteQuery`  |

- Web: `@shared/lib/hooks/query/useAppQuery`, `useAppMutation`, `useAppInfiniteQuery`
- Admin: `@shared/hooks/useAppQuery`, `@shared/hooks/useAppMutation`

## React Rules (ESLint enforced)

- `jsx-sort-props` — JSX props must be alphabetically sorted
- `no-array-index-key` — never use array index as React key
- `self-closing-comp` — use `<Component />` not `<Component></Component>`
- `button-has-type` — all `<button>` elements must have explicit `type`
- No unused imports (auto-removed)

## Path Aliases

**Web** (tsconfig):
```
@/*        → src/*
@shared/*  → src/shared/*
@entities/* → src/entities/*
@features/* → src/features/*
@views/*   → src/views/*
@widgets/* → src/widgets/*
```

**Admin** (tsconfig + vite):
```
@/*        → src/*
@shared/*  → src/shared/*
@pages/*   → src/pages/*
```

## FSD Architecture (apps/web only)

Feature-Sliced Design with strict downward-only imports:

```
app/ → views/ → widgets/ → features/ → entities/ → shared/
```

- **app/** — Next.js App Router routes (`[locale]/`), providers, global config
- **views/** — Page-level compositions (one per route)
- **widgets/** — Reusable blocks (Header, Footer)
- **features/** — User interaction modules (About, Article, Home, Inquiry, News, Product, Promotion, Search)
- **entities/** — Domain models (Article, Brand, Lookbook, Magazine, News, Partner, Product)
- **shared/** — Services, hooks, constants, UI re-exports

A feature can import from entities and shared, but **never** from widgets, views, or app.

## Forms

- Use `react-hook-form` with `@hookform/resolvers/zod` + `zod` schemas
- Field-level validation for independent fields; form-level (zodResolver) for interdependent validation
- UI form components from `@seoul-moment/ui` (`Form`, `Input`, `Textarea`, `Select`, `Label`)

## Icons

- Use `lucide-react` exclusively — no other icon libraries

## Toss Frontend Principles (from `.cursor/rules/`)

These design principles guide code review and implementation decisions:

1. **Readability** — Name magic numbers as constants; abstract complex logic into dedicated components; separate divergent conditional rendering into distinct components; name complex boolean conditions
2. **Predictability** — Consistent return types for similar functions/hooks; no hidden side effects in functions; unique descriptive names for wrappers
3. **Cohesion** — Organize by feature/domain, not by code type; colocate constants near related logic
4. **Coupling** — Avoid premature abstraction (some duplication is OK if use cases may diverge); break broad state hooks into focused ones; use composition over props drilling
