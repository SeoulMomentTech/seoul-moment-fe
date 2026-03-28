import { cache } from "react";

import { notFound } from "next/navigation";

import { isValidId } from "@shared/lib/utils";
import { getBrandPromotionListById } from "@shared/services/brandPromotion";

import type { LanguageType } from "@/i18n/const";
import { redirect } from "@/i18n/navigation";
import type { PageParams } from "@/types";

const fetchBrandPromotionList = cache((id: number) => {
  return getBrandPromotionListById(id);
});

export default async function Promotion({
  params,
}: PageParams<{ id: string }>) {
  const { id, locale } = await params;
  const promotionId = Number(id);

  if (!isValidId(promotionId)) {
    notFound();
  }

  const res = await fetchBrandPromotionList(promotionId).catch((error) => {
    console.error(
      `[PromotionPage] Failed to fetch promotion with id: ${promotionId}:`,
      error,
    );
    notFound();
  });

  if (!res.data.list.length) {
    notFound();
  }

  const brand = res.data.list[0];

  redirect({
    href: `/promotion/${id}/brand/${brand.brandId}`,
    locale: locale as LanguageType,
  });
}
