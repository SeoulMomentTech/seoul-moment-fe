import { cache } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getBrandDetail } from "@shared/services/brand";

import type { LanguageType } from "@/i18n/const";
import type { PageParams } from "@/types";

import { BrandDetailPage } from "@views/brand";

const fetchBrandDetail = cache((id: number, languageCode: LanguageType) => {
  return getBrandDetail({ id, languageCode });
});

export async function generateMetadata({
  params,
}: PageParams<{ id: string }>): Promise<Metadata> {
  const { id, locale } = await params;
  const brandId = Number(id);
  const t = await getTranslations();

  if (!Number.isInteger(brandId) || brandId <= 0) {
    return {};
  }

  try {
    const { data: brand } = await fetchBrandDetail(brandId, locale);

    const description = brand.description.replace(/<[^>]*>/g, "").slice(0, 160);

    return {
      title: `${brand.name} | ${t("title")}`,
      description,
      openGraph: {
        title: `${brand.name} | ${t("title")}`,
        description,
        images: brand.bannerList?.[0] ? [{ url: brand.bannerList[0] }] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function BrandDetail({
  params,
}: PageParams<{ id: string }>) {
  const { id, locale } = await params;
  const brandId = Number(id);

  if (!Number.isInteger(brandId) || brandId <= 0) {
    notFound();
  }

  const promise = fetchBrandDetail(brandId, locale as LanguageType).catch(() =>
    notFound(),
  );

  return <BrandDetailPage promise={promise} />;
}
