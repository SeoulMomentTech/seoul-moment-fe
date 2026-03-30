# Mutation Hook Example

This example demonstrates how a **write API function**
is converted into a TanStack Query `useMutation` hook.

---

## Generated Mutation Hook

```ts
type UpdateAdminProductItemResponse = Awaited<
  ReturnType<typeof updateAdminProductItem>
>;

interface UpdateAdminProductItemParams {
  productItemId: AdminProductItemId;
  payload: UpdateAdminProductItemRequest;
}

type UpdateAdminProductItemMutationOptions = Omit<
  UseMutationOptions<
    UpdateAdminProductItemResponse,
    unknown,
    UpdateAdminProductItemParams
  >,
  "mutationFn"
>;

export const useUpdateAdminProductItemMutation = (
  options?: UpdateAdminProductItemMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productItemId, payload }) =>
      updateAdminProductItem(productItemId, payload),
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: productQueryKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: productQueryKeys.detail(variables.productItemId),
      });
      await options?.onSuccess?.(data, variables, context);
    },
  });
};
```
