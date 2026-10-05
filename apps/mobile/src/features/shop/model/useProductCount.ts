import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetProductListRes } from "@shared/services/product";
import { getProductList } from "@shared/services/product";

import type { CommonRes } from "@shared/services";

import type { ShopFilter } from "./useShopFilterStore";

/**
 * 필터 시트의 "N개 보기" 용 개수. 시트의 draft 는 아직 적용 전이라 store 가 아니라 인자로 받고,
 * draft 가 키에 들어가므로 바뀔 때마다 다시 조회한다. 개수만 필요해서 count: 1 로 받는다.
 */
export const useProductCount = (filter: ShopFilter) => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["shop", "count", filter, languageCode] as const,
    queryFn: () =>
      getProductList({ languageCode, page: 1, count: 1, ...filter }),
    select: (res: CommonRes<GetProductListRes>): number => res.data.total,
  });
};
