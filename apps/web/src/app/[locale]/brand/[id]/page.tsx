import { cache } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { reportMetadataError } from "@shared/lib/utils/log/report-metadata-error";
import { getBrandDetail } from "@shared/services/brand";

import type { LanguageType } from "@/i18n/const";
import { buildLocalizedAlternates } from "@/i18n/metadata";
import { resolveLocale } from "@/i18n/routing";

import { BrandDetailPage } from "@views/brand";

const fetchBrandDetail = cache((id: number, languageCode: LanguageType) => {
  return getBrandDetail({ id, languageCode });
});

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/brand/[id]">): Promise<Metadata> {
  const { id, locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const brandId = Number(id);
  const t = await getTranslations();

  if (!Number.isInteger(brandId) || brandId <= 0) {
    return {};
  }

  try {
    const { data: brand } = await fetchBrandDetail(brandId, locale);

    const description = brand.description.replace(/<[^>]*>/g, "").slice(0, 160);

    const images = brand.bannerList?.[0] ? [brand.bannerList[0]] : [];

    return {
      title: `${brand.name} | ${t("title")}`,
      description,
      alternates: buildLocalizedAlternates(locale, `/brand/${brandId}`),
      openGraph: {
        title: `${brand.name} | ${t("title")}`,
        description,
        images: images.map((url) => ({ url })),
      },
      twitter: {
        card: "summary_large_image",
        title: `${brand.name} | ${t("title")}`,
        description,
        images,
      },
    };
  } catch (error) {
    reportMetadataError("fetch-brand-detail", error, { brandId });
    return {};
  }
}

export default async function BrandDetail({
  params,
}: PageProps<"/[locale]/brand/[id]">) {
  const { id, locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const brandId = Number(id);

  if (!Number.isInteger(brandId) || brandId <= 0) {
    notFound();
  }

  const promise = fetchBrandDetail(brandId, locale).catch(() => notFound());

  return <BrandDetailPage promise={promise} />;
}
