import { useShopFilterStore } from "./useShopFilterStore";

/**
 * 필터 버튼 배지용 개수. 시트 안에 있는 것(상품 카테고리·브랜드·옵션)만 센다.
 * 정렬은 바로 옆 정렬 컨트롤이, 최상위 categoryId 는 바로 위 칩 줄이 따로 보여 주므로
 * 세면 시트는 비었는데 "필터 1" 로 보이게 된다. 그래서 countActiveFilters 를 쓰지 않는다.
 */
export const useShopFilterBadge = () =>
  useShopFilterStore(
    (s) =>
      [
        s.productCategoryId,
        s.brandId,
        s.optionIdList.length > 0 ? s.optionIdList : undefined,
      ].filter((value) => value != null).length,
  );
