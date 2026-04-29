import { cache } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { isValidId, stripHtml } from "@shared/lib/utils";
import { reportMetadataError } from "@shared/lib/utils/log/report-metadata-error";
import { getBrandPromotionDetailV1 } from "@shared/services/brandPromotion";

import type { LanguageType } from "@/i18n/const";
import type { PageParams } from "@/types";

import { PromotionPage } from "@views/promotion";

const fetchBrandPromotion = cache((id: number, languageCode: LanguageType) => {
  return getBrandPromotionDetailV1(id, languageCode);
});

export async function generateMetadata({
  params,
}: PageParams<{ id: string; brandPromotionId: string }>): Promise<Metadata> {
  const { id, brandPromotionId, locale } = await params;
  const promotionId = Number(id);
  const parsedBrandPromotionId = Number(brandPromotionId);

  const t = await getTranslations();

  if (!isValidId(parsedBrandPromotionId) || !isValidId(promotionId)) {
    return {};
  }

  try {
    const { data: promotion } = await fetchBrandPromotion(
      parsedBrandPromotionId,
      locale,
    );

    const description = stripHtml(promotion.brand.description).slice(0, 160);
    const ogImage = promotion.sectionList?.[0]?.imageUrlList?.[0];
    const title = `${t("seo_brand_promotion_title", { Brand: promotion.brand.name })}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        ...(ogImage && { images: [{ url: ogImage }] }),
        type: "article",
      },
    };
  } catch (error) {
    reportMetadataError("fetch-brand-promotion-detail", error, {
      promotionId,
      brandPromotionId: parsedBrandPromotionId,
    });
    return {};
  }
}

export default async function PromotionBrand({
  params,
}: PageParams<{ id: string; brandPromotionId: string }>) {
  const { id, brandPromotionId, locale } = await params;
  const promotionId = Number(id);
  const parsedBrandId = Number(brandPromotionId);

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
      brandPromotionId={parsedBrandId}
      promise={promise}
      promotionId={promotionId}
    />
  );
}
