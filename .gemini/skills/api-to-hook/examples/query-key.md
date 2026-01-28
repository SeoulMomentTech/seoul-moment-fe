# Query Key Example

This example demonstrates how **stable and reusable query keys**
are generated and shared across TanStack Query hooks.

---

## Generated Query Keys

```ts
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
```
