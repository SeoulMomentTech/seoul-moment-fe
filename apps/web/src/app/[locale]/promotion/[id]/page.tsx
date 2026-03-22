import { cache } from "react";

import { notFound } from "next/navigation";

import { getBrandPromotionList } from "@shared/services/brandPromotion";

import type { LanguageType } from "@/i18n/const";
import { redirect } from "@/i18n/navigation";
import type { PageParams } from "@/types";

const fetchBrandPromotionList = cache(() => {
  return getBrandPromotionList();
});

export default async function Promotion({
  params,
}: PageParams<{ id: string }>) {
  const { id, locale } = await params;
  const res = await fetchBrandPromotionList();

  if (!res) {
    notFound();
  }

  const brand = res.data.list[0];

  redirect({
    href: `/promotion/${id}/brand/${brand.brandId}`,
    locale: locale as LanguageType,
  });
}
