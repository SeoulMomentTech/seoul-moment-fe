import { cache } from "react";

import { notFound } from "next/navigation";

import { getBrandPromotionDetail } from "@shared/services/brandPromotion";
import PromotionPage from "@views/promotion/ui/PromotionPage";

import type { LanguageType } from "@/i18n/const";
import type { PageParams } from "@/types";

const fetchBrandPromotion = cache((id: number, languageCode: LanguageType) => {
  return getBrandPromotionDetail(id, languageCode);
});

export default async function Promotion({
  params,
}: PageParams<{ id: string }>) {
  const { id, locale } = await params;
  const promotionId = Number(id);

  if (!Number.isInteger(promotionId) || promotionId <= 0) {
    notFound();
  }
  const promise = fetchBrandPromotion(
    promotionId,
    locale as LanguageType,
  ).catch(() => notFound());

  return <PromotionPage promise={promise} promotionId={promotionId} />;
}
