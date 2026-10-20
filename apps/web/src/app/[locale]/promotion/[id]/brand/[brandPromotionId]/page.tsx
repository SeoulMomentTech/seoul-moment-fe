import { cache } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { isValidId, stripHtml } from "@shared/lib/utils";
import { reportMetadataError } from "@shared/lib/utils/log/report-metadata-error";
import { getBrandPromotionDetailV1 } from "@shared/services/brandPromotion";

import type { LanguageType } from "@/i18n/const";
import { buildLocalizedAlternates } from "@/i18n/metadata";
import { resolveLocale } from "@/i18n/routing";

import { PromotionPage } from "@views/promotion";

const fetchBrandPromotion = cache((id: number, languageCode: LanguageType) => {
  return getBrandPromotionDetailV1(id, languageCode);
});

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/promotion/[id]/brand/[brandPromotionId]">): Promise<Metadata> {
  const { id, brandPromotionId, locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
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

    // 다른 프로모션의 브랜드 id 가 붙은 URL 은 페이지가 notFound 를 내므로
    // 그 주소로 canonical 을 만들지 않는다.
    if (promotion.promotionId !== promotionId) {
      return {};
    }

    const description = stripHtml(promotion.brand.description).slice(0, 160);
    const ogImage = promotion.sectionList?.[0]?.imageUrlList?.[0];
    const title = `${t("seo_brand_promotion_title", { Brand: promotion.brand.name })}`;

    return {
      title,
      description,
      alternates: buildLocalizedAlternates(
        locale,
        `/promotion/${promotionId}/brand/${parsedBrandPromotionId}`,
      ),
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
}: PageProps<"/[locale]/promotion/[id]/brand/[brandPromotionId]">) {
  const { id, brandPromotionId, locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const promotionId = Number(id);
  const parsedBrandId = Number(brandPromotionId);

  if (!isValidId(parsedBrandId) || !isValidId(promotionId)) {
    notFound();
  }

  const promise = fetchBrandPromotion(parsedBrandId, locale)
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
