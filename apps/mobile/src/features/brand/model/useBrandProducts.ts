import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetProductListRes, ProductItem } from "@shared/services/product";
import { getProductList } from "@shared/services/product";

import type { CommonRes } from "@shared/services";

// 가로로 넘기는 줄이라 웹(4개)보다 넉넉히 가져온다.
const COUNT = 10;

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
