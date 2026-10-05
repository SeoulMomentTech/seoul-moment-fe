import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { ProductBrandBanner } from "@shared/services/product";
import { getProductBrandBanner } from "@shared/services/product";

import type { CommonRes } from "@shared/services";

/** 브랜드를 고르지 않았으면 요청하지 않는다. */
export const useProductBrandBanner = (brandId?: number) => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["shop", "brand-banner", brandId, languageCode] as const,
    queryFn: () =>
      getProductBrandBanner({ brandId: brandId as number, languageCode }),
    select: (res: CommonRes<ProductBrandBanner>): ProductBrandBanner =>
      res.data,
    enabled: typeof brandId === "number" && Number.isFinite(brandId),
  });
};
