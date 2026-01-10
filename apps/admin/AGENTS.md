# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this repository.

## Project Overview

This is a React 19.1.1 admin dashboard application built with TypeScript, Vite, and pnpm workspaces. It's part of a monorepo using Turbo for build orchestration.

## Development Commands

```bash
# Development
pnpm dev                    # Start development server

# Build & Quality
pnpm build                  # Build for production (TypeScript check + Vite build)
pnpm lint                    # Run ESLint
pnpm preview                 # Preview production build

# Monorepo commands (run from root)
pnpm turbo build             # Build all packages
pnpm turbo lint              # Lint all packages
```

## Testing

**No testing framework is currently configured**. If adding tests:

1. Choose between Vitest, Jest, or React Testing Library
2. Add test script to package.json
3. Follow the naming convention: `*.test.tsx` or `*.spec.tsx`

## Code Style Guidelines

### Import Order (strict)

```typescript
// 1. React imports
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

// 2. External libraries (alphabetical)
import { Plus } from "lucide-react";
import { z } from "zod";

// 3. Workspace packages (@seoul-moment/*)
import { Button, HStack } from "@seoul-moment/ui";

// 4. Internal imports (using path aliases)
import { PATH } from "@shared/constants/route";
import { useDebounceValue } from "@shared/hooks/useDebounceValue";
```

### Naming Conventions

- **Components**: PascalCase (`BrandListPage`)
- **Hooks**: camelCase with `use` prefix (`useAdminBrandListQuery`)
- **Constants**: UPPER_SNAKE_CASE (`PATH`, `BRAND_QUERY_KEY`)
- **Files**: kebab-case for utilities, camelCase for components
- **Variables**: camelCase
- **Functions**: camelCase

### TypeScript Guidelines

- Strict mode enabled - no implicit any
- Use proper typing for all props and returns
- Prefer interface for object shapes, type for unions
- Use generic types where appropriate
- No unused variables or parameters

### State Management Patterns

#### React Query (Server State)

```typescript
// Query hooks
export const useAdminBrandListQuery = (params?, options?) =>
  useQuery({
    queryKey: brandQueryKeys.list(params),
    queryFn: () => getAdminBrandList(params),
    ...options,
  });

// Mutation hooks
export const useDeleteAdminBrandMutation = (options?) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ brandId }) => deleteAdminBrand(brandId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEY });
    },
    ...options,
  });
};
```

#### Zustand (Global State)

```typescript
// Store pattern
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
```

### Component Structure

```typescript
// Feature-based component structure
BrandPage/
├── index.tsx              # Main component export
├── components/
│   ├── BrandList.tsx
│   └── BrandForm.tsx
├── hooks/
│   └── useBrandPage.ts
├── utils/
│   └── brandHelpers.ts
└── constants/
    └── brandConstants.ts
```

### Error Handling

- Use `GlobalErrorBoundary` for route-level errors
- React Error Boundary for component-level errors
- React Query has built-in error handling with retry disabled
- Always handle loading and error states in queries

### Styling Guidelines

- Use Tailwind CSS v4 classes
- Import components from `@seoul-moment/ui` when available
- Follow the existing design system patterns
- Use semantic HTML elements

### Form Handling

- Use Formik or React Hook Form for complex forms
- Implement proper validation with Zod schemas
- Handle form submission with loading states

### File Organization

- Feature-based folders in `src/pages/`
- Shared utilities in `src/shared/`
- Barrel exports (`index.ts`) for clean imports
- Keep components focused and single-responsibility

### Path Aliases

```typescript
"@/*": ["./src/*"],
"@shared/*": ["./src/shared/*"],
"@pages/*": ["./src/pages/*"]
```

## Quality Standards

### Before Committing

1. Run `pnpm lint` - fix all ESLint errors
2. Run `pnpm build` - ensure TypeScript compilation succeeds
3. Test functionality manually
4. Follow import order strictly

### Code Review Checklist

- [ ] Proper TypeScript typing
- [ ] Correct import order
- [ ] Error handling implemented
- [ ] Loading states for async operations
- [ ] Responsive design considerations
- [ ] Accessibility (ARIA labels, semantic HTML)

## Architecture Patterns

### Route Structure

- Public routes: login, signup
- Private routes: wrapped with authentication check
- Layout wrapper for authenticated content
- Error boundaries at route level

### API Integration

- Use React Query for all API calls
- Implement proper query keys for cache management
- Handle optimistic updates where appropriate
- Use proper error boundaries for failed requests

### Component Patterns

- Prefer composition over inheritance
- Use custom hooks for complex logic
- Implement proper prop interfaces
- Consider accessibility in all components

## Common Patterns to Follow

### Query Key Management

```typescript
export const brandQueryKeys = {
  all: ["brand"] as const,
  list: (params?: BrandListParams) =>
    [...brandQueryKeys.all, "list", params] as const,
  detail: (id: string) => [...brandQueryKeys.all, "detail", id] as const,
} as const;
```

### Constant Management

```typescript
// Route constants
export const PATH = {
  BRAND: "/brand",
  BRAND_DETAIL: (id: string) => `/brand/${id}`,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  BRAND_LIST: "/api/admin/brand",
  BRAND_DETAIL: (id: string) => `/api/admin/brand/${id}`,
} as const;
```

## Tools and Configuration

- **Package Manager**: pnpm with workspaces
- **Build Tool**: Vite 7.1.7
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with custom React config
- **Styling**: Tailwind CSS v4
- **State Management**: React Query + Zustand
- **Routing**: React Router v7

## Important Notes

- This is a production admin dashboard - prioritize reliability and performance
- No current test coverage - be extra careful with changes
- Follow existing patterns exactly for consistency
- Always use TypeScript - no JavaScript files
- Use semantic HTML and proper accessibility practices
