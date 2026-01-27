# Query Hook Example

This example demonstrates how a **read-only API function**
is converted into a TanStack Query `useQuery` hook.

---

## Generated Query Hook

```ts
type AdminProductItemListQueryResponse = Awaited<
  ReturnType<typeof getAdminProductItemList>
>;

type AdminProductItemListQueryOptions = Omit<
  UseQueryOptions<
    AdminProductItemListQueryResponse,
    unknown,
    AdminProductItemListQueryResponse,
    ReturnType<typeof productQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useAdminProductItemListQuery = (
  params?: AdminProductItemListParams,
  options?: AdminProductItemListQueryOptions,
) =>
  useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => getAdminProductItemList(params),
    ...options,
  });
```
