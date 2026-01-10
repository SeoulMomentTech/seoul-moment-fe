# Project Overview

- **Framework**: Next.js 15.4.10 with App Router
- **Language**: TypeScript 5 with strict mode
- **Styling**: TailwindCSS v4 with custom design system
- **State Management**: Zustand (client), @tanstack/react-query (server)
- **HTTP Client**: ky
- **Package Manager**: pnpm (monorepo setup)

# Architecture

**FSD (Feature-Sliced Design) Structure**:

```
src/
├── app/          # Next.js App Router (views/pages)
├── shared/       # Cross-cutting concerns (utils, services, hooks)
├── entities/     # Business logic + UI components
├── features/     # User scenario features
├── widgets/      # UI compositions
├── views/        # Page compositions (App Router)
└── i18n/         # Internationalization
```

**Path Aliases**:

- `@/*` → `./src/*`
- `@shared/*` → `./src/shared/*`
- `@entities/*` → `./src/entities/*`
- `@features/*` → `./src/features/*`
- `@views/*` → `./src/views/*`
- `@widgets/*` → `./src/widgets/*`

# Development Commands

## Core Commands

- `pnpm run dev` - Start development server with Turbopack (auto-syncs i18n)
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Fix ESLint issues automatically
- `pnpm run i18n:sync` - Sync translations from Google Sheets

## Testing

**No testing framework is currently configured**. If tests are needed, set up Jest/Vitest first.

# Code Style Guidelines

## Naming Conventions

- **Folders**: kebab-case
- **Components**: PascalCase (files and names)
- **Files**: Follow component naming (PascalCase for components)
- **Constants**: UPPER_SNAKE_CASE for exported constants

## Import Rules (ESLint Enforcement)

**MANDATORY**: Use custom React Query wrappers instead of direct imports:

- ❌ `import { useQuery } from "@tanstack/react-query"`
- ✅ `import { useAppQuery } from "@shared/hooks/useAppQuery"`

Custom hooks to use:

- `useAppQuery` instead of `useQuery`
- `useAppInfiniteQuery` instead of `useInfiniteQuery`
- `useAppMutation` instead of `useMutation`

## Code Quality Standards

- Always clean up unused code and console.log statements
- Avoid magic numbers - use constants instead
- Reuse constant values for better maintainability
- Follow strict TypeScript configuration

## Styling Guidelines

- Use TailwindCSS with clsx/tailwind-merge for conditional classes
- Follow design system variables (CSS variables for colors/spaces)
- Use Pretendard font family as default
- Implement responsive design with mobile-first approach

# State & Data Flow Patterns

## URL Query Management

- Use `nuqs` `useQueryStates` for URL-based filters
- For array parameters like `optionIdList`, use `parseAsArrayOf`
- Example: `parseAsArrayOf(parseAsString)`

## Server State Management

- Use custom React Query wrappers (`useAppQuery`, `useAppInfiniteQuery`, `useAppMutation`)
- Reuse common query hooks (`useProductFilterList`, `useInfiniteProducts`, etc.)
- For option filter toggle logic, reuse `mergeOptionIdList` from `@shared/lib/utils/filter.ts`

## API Calls

- Use `ky` HTTP client from `shared/services`
- GET requests must include `languageCode` in searchParams (auto-converted to Accept-Language header)
- Use `useLanguage()` hook for current locale from App Router params

# UI Component Guidelines

## Component Libraries

- **Radix UI**: For primitives (dialog, dropdown, accordion, etc.)
- **Lucide React**: For icons
- **@seoul-moment/ui**: Workspace UI package
- **Swiper**: For carousels

## Overlay Components

- Use lazy loading with `React.lazy` for modals, sheets, etc.
- Example pattern: `const Modal = React.lazy(() => import('./Modal'))`

## Form Handling

- Use `react-hook-form` with `zod` validation
- Use `@hookform/resolvers` for schema integration
- Implement proper error handling with `react-error-boundary`

# Internationalization (i18n)

## Setup

- Supports 3 languages: ko, en, zh-TW
- Uses `next-intl` for internationalization
- Google Sheets integration for translation management

## Usage

- Use `useLanguage()` hook for current locale
- Translation files in `src/i18n/locales/`
- Auto-sync on `pnpm run dev` (requires Google credentials)

# Error Handling & Monitoring

## Error Boundaries

- Use `react-error-boundary` for React errors
- Implement proper fallback UIs

## Monitoring

- Sentry configured for error tracking and performance
- Error boundaries integrate with Sentry reporting

# Development Notes

## Pre-requisites

- Google credentials needed for `i18n:sync` command
- Node.js with ES2017+ support
- pnpm package manager

## Performance Considerations

- Turbopack enabled for faster development builds
- Lazy loading for overlay components
- Proper code splitting with Next.js dynamic imports
- Image optimization with Next.js Image component

## Common Patterns

- FSD architecture for scalable feature development
- Consistent error handling across components
- URL state management for filters and pagination
- Translation-aware API requests
