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
}: PageParams<{ id: string; brandId: string }>) {
  const { id, brandId, locale } = await params;
  const promotionId = Number(id);
  const parsedBrandId = Number(brandId);

  const isValidId = Number.isInteger(parsedBrandId) && parsedBrandId > 0;

  if (!isValidId) {
    notFound();
  }

  const promise = fetchBrandPromotion(
    parsedBrandId,
    locale as LanguageType,
  ).catch((error) => {
    console.error(
      `[PromotionPage] Failed to fetch promotion with brandId: ${parsedBrandId}:`,
      error,
    );
    notFound();
  });

  return (
    <PromotionPage
      brandId={parsedBrandId}
      promise={promise}
      promotionId={promotionId}
    />
  );
}
