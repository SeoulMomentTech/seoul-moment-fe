import { parseAsInteger, useQueryState } from "nuqs";

export function useInterestProductCategory() {
  const [cat, setCat] = useQueryState("cat", parseAsInteger);

  return {
    productCategoryId: cat ?? undefined,
    setProductCategoryId: (next: number | undefined) => setCat(next ?? null),
  };
}
