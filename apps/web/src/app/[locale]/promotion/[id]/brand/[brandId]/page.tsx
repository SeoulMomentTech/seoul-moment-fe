import { cache } from "react";

import { notFound } from "next/navigation";

import { getBrandPromotionDetail } from "@shared/services/brandPromotion";
import PromotionPage from "@views/promotion/ui/PromotionPage";

import type { LanguageType } from "@/i18n/const";
import type { PageParams } from "@/types";

const fetchBrandPromotion = cache((id: number, languageCode: LanguageType) => {
  return getBrandPromotionDetail(id, languageCode);
});

export default async function PromotionBrand({
  params,
}: PageParams<{ brandId: string }>) {
  const { brandId, locale } = await params;
  const id = Number(brandId);

  const isValidId = Number.isInteger(id) && id > 0;

  if (!isValidId) {
    notFound();
  }

  const promise = fetchBrandPromotion(id, locale as LanguageType).catch(
    (error) => {
      console.error(
        `[PromotionPage] Failed to fetch promotion with brandId: ${id}:`,
        error,
      );
      notFound();
    },
  );

  return <PromotionPage promise={promise} promotionId={id} />;
}
