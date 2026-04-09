import { cache } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { isValidId, stripHtml } from "@shared/lib/utils";
import { getBrandPromotionDetail } from "@shared/services/brandPromotion";
import PromotionPage from "@views/promotion/ui/PromotionPage";

import type { LanguageType } from "@/i18n/const";
import type { PageParams } from "@/types";

const fetchBrandPromotion = cache((id: number, languageCode: LanguageType) => {
  return getBrandPromotionDetail(id, languageCode);
});

export async function generateMetadata({
  params,
}: PageParams<{ id: string; brandId: string }>): Promise<Metadata> {
  const { id, brandId, locale } = await params;
  const promotionId = Number(id);
  const parsedBrandId = Number(brandId);

  const t = await getTranslations();

  if (!isValidId(parsedBrandId) || !isValidId(promotionId)) {
    return {};
  }

  try {
    const { data: promotion } = await fetchBrandPromotion(
      parsedBrandId,
      locale,
    );

    const description = stripHtml(promotion.brand.description).slice(0, 160);
    const ogImage = promotion.sectionList?.[0]?.imageUrlList?.[0];

    return {
      title: `${promotion.brand.name} | ${t("title")}`,
      description,
      openGraph: {
        title: `${promotion.brand.name} | ${t("title")}`,
        description,
        ...(ogImage && { images: [{ url: ogImage }] }),
        type: "article",
      },
    };
  } catch (error) {
    console.error("Failed to fetch brand promotion:", error);
    return {};
  }
}

export default async function PromotionBrand({
  params,
}: PageParams<{ id: string; brandId: string }>) {
  const { id, brandId, locale } = await params;
  const promotionId = Number(id);
  const parsedBrandId = Number(brandId);

  if (!isValidId(parsedBrandId) || !isValidId(promotionId)) {
    notFound();
  }

  const promise = fetchBrandPromotion(parsedBrandId, locale as LanguageType)
    .then((res) => {
      if (res.data.promotionId !== promotionId) {
        notFound();
      }
      return res;
    })
    .catch((error) => {
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
