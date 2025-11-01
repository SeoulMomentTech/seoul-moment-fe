import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useMemo } from "react";

export type FilterKey = keyof typeof initialFilter;

const initialFilter = {
  page: 1,
  search: null,
  brandId: null,
  sort: null,
  productCategoryId: null,
  sortColumn: null,
};

const useProductFilter = () => {
  const [filter, setFilter] = useQueryStates({
    search: parseAsString,
    brandId: parseAsInteger,
    sort: parseAsString,
    categoryId: parseAsInteger,
    productCategoryId: parseAsInteger,
    sortColumn: parseAsString,
  });

  const normalized = {
    ...filter,
    search: filter.search ?? undefined,
    brandId: filter.brandId ?? undefined,
    sort: filter.sort ?? undefined,
    productCategoryId: filter.productCategoryId ?? undefined,
    sortColumn: filter.sortColumn ?? undefined,
    categoryId: filter.categoryId ?? undefined,
  };

  const filterCount = useMemo(() => {
    return Object.values(filter).reduce(
      (prev: number, value) => (value == null ? prev : prev + 1),
      0,
    );
  }, [filter]);

  const handleUpdateFilter =
    (newFilter: Record<string, string | number | undefined | null>) => () => {
      const filtered = Object.entries(newFilter).reduce(
        (prev, [key, value]) => ({
          ...prev,
          [key]: value != null ? value : null,
        }),
        {},
      );

      setFilter((prev) => ({
        ...prev,
        ...filtered,
      }));
    };

  const handleResetFilter = (ignoreKeys: FilterKey[] = []) => {
    // TODO: 필터 초기화 로직 구현 및 ignoreKeys 내 없는 키는 유지되도록 수정
    setFilter((prev) => {
      const filtered = Object.entries(prev ?? initialFilter).reduce(
        (prev, [key, value]) => ({
          ...prev,
          [key]: ignoreKeys.includes(key as keyof typeof initialFilter)
            ? value
            : null,
        }),
        {},
      );

      return {
        ...prev,
        ...filtered,
      };
    });
  };
  return {
    filter: normalized,
    count: filterCount,
    handleUpdateFilter,
    handleResetFilter,
  };
};

export default useProductFilter;
