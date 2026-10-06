import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetProductListRes, ProductItem } from "@shared/services/product";
import { getProductList } from "@shared/services/product";

import type { CommonRes } from "@shared/services";

// 웹 brand-products 위젯과 같은 4개. 소개 페이지의 맛보기지 목록이 아니다.
const COUNT = 4;

/** 브랜드 소개 하단의 상품 줄. 잘못된 id 면 요청하지 않는다. */
export const useBrandProducts = (brandId?: number) => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["brand", "products", brandId, languageCode] as const,
    queryFn: () =>
      getProductList({
        languageCode,
        brandId,
        page: 1,
        count: COUNT,
      }),
    select: (res: CommonRes<GetProductListRes>): ProductItem[] =>
      res.data.list ?? [],
    enabled: typeof brandId === "number" && Number.isFinite(brandId),
  });
};
