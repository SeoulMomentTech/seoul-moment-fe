import { useAppQuery, useLanguage } from "@shared/lib/hooks";
import type { GetBrandPromotionResponse } from "@shared/services/brandPromotion";
import { getBrandPromotionDetailV1 } from "@shared/services/brandPromotion";

import type { LanguageType } from "@/i18n/const";

import type { CommonRes } from "@shared/services";
import { useSuspenseQuery, type UseQueryOptions } from "@tanstack/react-query";

interface UseBrandPromotionDetailQueryProps<T> {
  brandPromotionId: number;
  languageCode?: LanguageType;
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;
}

export const useBrandPromotionDetailQuery = ({
  brandPromotionId,
  languageCode,
  options,
}: UseBrandPromotionDetailQueryProps<CommonRes<GetBrandPromotionResponse>>) => {
  const fallbackLanguage = useLanguage();
  const lang = languageCode ?? fallbackLanguage;

  return useAppQuery({
    ...options,
    queryKey: ["brandPromotionDetail", brandPromotionId, lang],
    queryFn: () => getBrandPromotionDetailV1(brandPromotionId, lang),
    select: (res) => res.data,
    enabled: !!brandPromotionId,
  });
};

export const useSuspenseBrandPromotionDetailQuery = ({
  brandPromotionId,
  languageCode,
  options,
}: UseBrandPromotionDetailQueryProps<CommonRes<GetBrandPromotionResponse>>) => {
  const fallbackLanguage = useLanguage();
  const lang = languageCode ?? fallbackLanguage;

  return useSuspenseQuery({
    ...options,
    queryKey: ["brandPromotionDetail", brandPromotionId, lang],
    queryFn: () => getBrandPromotionDetailV1(brandPromotionId, lang),
    select: (res) => res.data,
  });
};
