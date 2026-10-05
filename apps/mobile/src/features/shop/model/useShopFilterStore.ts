import { create } from "zustand";

export interface ShopFilter {
  search?: string;
  brandId?: number;
  categoryId?: number;
  productCategoryId?: number;
  optionIdList: number[];
  sortColumn?: string;
  sort?: string;
}

/** 모든 키를 반드시 적어야 하는 ShopFilter. 값은 undefined 여도 되지만 키는 생략할 수 없다. */
export type CompleteShopFilter = ShopFilter & Record<keyof ShopFilter, unknown>;

interface ShopFilterState extends ShopFilter {
  /** 넘긴 키만 덮어쓴다. 시트의 draft 를 "적용" 할 때는 draft 전체를 넘긴다. */
  setFilter(filter: Partial<ShopFilter>): void;
  /**
   * 다른 조건을 전부 버리고 브랜드 하나만 건다. 상품 상세에서 브랜드를 눌러 목록으로 갈 때 쓴다.
   * 남은 카테고리·옵션이 그 브랜드의 상품을 가려 빈 목록이 되는 일을 막는다.
   */
  selectOnlyBrand(brandId: number): void;
  /** 정렬을 포함한 모든 조건을 비운다. */
  reset(): void;
}

const initialFilter: ShopFilter = {
  search: undefined,
  brandId: undefined,
  categoryId: undefined,
  productCategoryId: undefined,
  optionIdList: [],
  sortColumn: undefined,
  sort: undefined,
};

export const useShopFilterStore = create<ShopFilterState>()((set) => ({
  ...initialFilter,
  setFilter: (filter) => set(() => ({ ...filter })),
  selectOnlyBrand: (brandId) => set(() => ({ ...initialFilter, brandId })),
  reset: () => set(() => ({ ...initialFilter })),
}));

/**
 * 적용된 필터 개수 (버튼 배지용). web 의 filterCount 와 같게 값이 있는 키를 센다.
 * 빈 배열·빈 문자열은 비어 있는 것으로 보고, sortColumn+sort 는 정렬 하나로 센다.
 */
export const countActiveFilters = (filter: ShopFilter): number =>
  [
    filter.search,
    filter.brandId,
    filter.categoryId,
    filter.productCategoryId,
    filter.optionIdList.length > 0 ? filter.optionIdList : undefined,
    filter.sortColumn ?? filter.sort,
  ].filter((value) => value != null && value !== "").length;

export const useShopFilterCount = () =>
  useShopFilterStore((s) => countActiveFilters(s));
