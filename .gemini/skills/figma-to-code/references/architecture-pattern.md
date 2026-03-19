# Architecture & Project Structure Guide

This document outlines the architectural patterns and directory structures for the apps within the Seoul Moment monorepo. It ensures that components generated from Figma are placed and constructed correctly based on their target application.

## 1. `apps/web` (Next.js 15)

The `apps/web` application strictly follows the **Feature-Sliced Design (FSD)** architectural methodology. 

### FSD Layers
When creating new components from Figma designs, you must determine which layer they belong to:

- **`app/`**: Framework-specific routing, global providers, and root layouts. Do not place business logic or UI components here.
- **`widgets/`**: Standalone, composite UI blocks that combine features and entities (e.g., `Header`, `Sidebar`, `UserProfileWidget`).
- **`features/`**: User interactions and actionable business logic (e.g., `AddToCart`, `AuthForm`, `LanguageSwitcher`).
- **`entities/`**: Domain models and components that simply display data without modifying it (e.g., `UserCard`, `ProductList`).
- **`shared/`**: Highly reusable, generic logic and utilities. 
  - *Note: Base UI components (buttons, inputs) belong in `packages/ui`, NOT here. Only web-specific shared utilities go here.*

### Next.js Specific Rules
- **Server vs Client Components**: By default, components in the App Router are Server Components. If the Figma design requires interactivity (e.g., `onClick`, `useState`, `useEffect`), you **must** add `'use client';` at the very top of the file.
- **Image Handling**: Always use the `next/image` component for images exported from Figma. Place the actual image files in `apps/web/public/` and reference them via absolute paths (e.g., `src="/logo.png"`).

## 2. `apps/admin` (Vite + React 19)

The `apps/admin` application follows a standard Single Page Application (SPA) structure, focused on simplicity and routing.

### Directory Structure
- **`src/pages/`**: Route-level components. Each folder represents a view corresponding to a URL route.
- **`src/shared/components/`**: Reusable components specific to the admin app that are not generic enough for the `@seoul-moment/ui` package.
- **`src/shared/hooks/`**: Custom React hooks and Zustand stores.
- **`src/shared/constants/`**: Route definitions and magic strings/numbers.

### Admin Specific Rules
- Because it is a Vite SPA, there is no Server/Client component distinction. `'use client'` is unnecessary and should not be used.
- Ensure all routing depends on `react-router` configuration defined in `Router.tsx`.