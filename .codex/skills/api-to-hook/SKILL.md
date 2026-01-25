---
name: api-to-hook
description: Generates TanStack Query hooks based on generated API functions.
---

# API to Hook Skill

## Role

You are a **TanStack Query hook generation expert**.

You understand how API service functions are structured and how to wrap them
into reusable, type-safe hooks using TanStack Query.

Rather than mechanically converting functions, you focus on:

- Clear and predictable hook naming
- Proper query / mutation classification
- Stable and descriptive query keys
- Developer-friendly defaults that fit real projects

---

## Prerequisite

This skill **must be executed after `swagger-to-code`**.

- API service files must already exist under:
  shared/services/[domain].ts

- Hooks are generated **based on the exported API functions** from those files.

---

## Procedure

1. Load generated API service files

- Read API functions from `shared/services/[domain].ts`
- Analyze function names, parameters, and return types

2. Classify API functions

- Treat `get*`, `fetch*`, `list*` functions as **queries**
- Treat `create*`, `update*`, `patch*`, `delete*` functions as **mutations**
- Allow explicit overrides when naming is ambiguous

3. Determine hook structure

- Identify the project type (`admin` or `web`)
- Resolve hook output path based on the project type:
  - **Admin project**
    - Generate hooks under:
      ```
      pages/[domain]Page/hooks
      ```
    - Create the directory if it does not exist

  - **Web project**
    - Generate hooks under the user-provided hooks directory path
    - Create the directory if it does not exist

- Generate one hook file per domain
- Use the following file naming convention:
  ```
  use[Domain].ts
  ```
  (e.g. `useProduct.ts`, `useAdminUser.ts`)

4. Generate query key definitions

- Create a dedicated query key file:
  ```
  queryKey.ts
  ```
  in the same hooks directory
- Define query keys as functions to ensure stability and reusability
- Group query keys by domain and operation

5. Generate TanStack Query hooks

- Generate `useQuery` hooks for read operations
- Generate `useMutation` hooks for write operations
- Import query keys from `queryKey.ts`
- Preserve parameter and response typing from API functions

6. Apply sensible defaults

- Enable caching and refetching best practices
- Avoid opinionated side effects unless explicitly required
- Keep hooks composable and easy to extend

---

## Output

The skill generates TanStack Query hooks with the following characteristics:

- One hook file per domain
- `useXxxQuery` hooks for queries
- `useXxxMutation` hooks for mutations
- Shared, stable query key definitions
- Fully typed hook return values

---

## Output Code Example

```ts
// pages/productPage/hooks/queryKey.ts

import {
  type AdminProductItemId,
  type AdminProductItemListParams,
} from "@shared/services/products";

export const PRODUCT_QUERY_KEY = ["admin", "products"] as const;

export const productQueryKeys = {
  all: PRODUCT_QUERY_KEY,
  list: (params?: AdminProductItemListParams) =>
    [...PRODUCT_QUERY_KEY, "list", params] as const,
  detail: (productItemId: AdminProductItemId | number) =>
    [...PRODUCT_QUERY_KEY, "detail", productItemId] as const,
};

// pages/productPage/hooks/useProduct.ts

export const useAdminProductOptionDetailQuery = (optionId: ProductOptionId) =>
  useQuery({
    queryKey: ["adminProductOptionDetail", optionId],
    queryFn: () => getAdminProductOptionDetail(optionId),
  });

export const useUpdateAdminProductOptionMutation = () =>
  useMutation({
    mutationFn: ({
      optionId,
      payload,
    }: {
      optionId: ProductOptionId;
      payload: UpdateAdminProductOptionRequest;
    }) => updateAdminProductOption(optionId, payload),
  });
```
