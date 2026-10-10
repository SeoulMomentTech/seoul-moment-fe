import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type {
  GetBrandPromotionBrandListRes,
  GetBrandPromotionDetailRes,
} from "@shared/services/brandPromotion";
import {
  getBrandPromotionBrandList,
  getBrandPromotionDetail,
} from "@shared/services/brandPromotion";

import type { CommonRes } from "@shared/services";

/**
 * 프로모션에 묶인 브랜드 목록. 홈 카드가 넘겨주는 promotionId 로 부르고,
 * 여기서 나온 id(= brandPromotionId)가 상세 조회의 키가 된다.
 * 잘못된 id 면 요청하지 않는다 — 쿼리는 idle 에 머문다.
 */
export const usePromotionBrands = (promotionId: number) => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["promotion", "brands", promotionId, languageCode] as const,
    queryFn: () => getBrandPromotionBrandList({ promotionId, languageCode }),
    select: (
      res: CommonRes<GetBrandPromotionBrandListRes>,
    ): GetBrandPromotionBrandListRes => res.data,
    enabled: Number.isFinite(promotionId),
  });
};

/**
 * 고른 브랜드의 프로모션 상세. 브랜드 목록이 와야 id 를 알 수 있으므로 두 쿼리는 순차다 —
 * id 가 undefined 인 동안에는 enabled=false 로 묶어 둔다. undefined 로 쏘면
 * `brand/promotion/v1/undefined` 가 나간다.
 */
export const usePromotionDetail = (brandPromotionId?: number) => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["promotion", "detail", brandPromotionId, languageCode] as const,
    queryFn: () =>
      getBrandPromotionDetail({
        brandPromotionId: brandPromotionId as number,
        languageCode,
      }),
    select: (
      res: CommonRes<GetBrandPromotionDetailRes>,
    ): GetBrandPromotionDetailRes => res.data,
    enabled:
      typeof brandPromotionId === "number" && Number.isFinite(brandPromotionId),
  });
};
