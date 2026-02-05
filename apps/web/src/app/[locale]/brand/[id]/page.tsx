import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getBrandDetail } from "@shared/services/brand";

import type { PageParams } from "@/types";

import { BrandDetailPage } from "@views/brand";

export async function generateMetadata({
  params,
}: PageParams<{ id: string }>): Promise<Metadata> {
  const { id, locale } = await params;
  const brandId = parseInt(id);
  const t = await getTranslations();

  if (!Number.isInteger(brandId)) {
    return {};
  }

  try {
    const { data: brand } = await getBrandDetail({
      id: brandId,
      languageCode: locale,
    });

    return {
      title: `${brand.name} | ${t("title")}`,
      description: brand.description.replace(/<[^>]*>/g, "").slice(0, 160),
    };
  } catch {
    return {};
  }
}

export default async function BrandDetail({
  params,
}: PageParams<{ id: string }>) {
  const { id, locale } = await params;
  const brandId = parseInt(id);

  if (!Number.isInteger(brandId)) {
    notFound();
  }

  const promise = getBrandDetail({
    id: brandId,
    languageCode: locale,
  }).catch(() => notFound());

  return <BrandDetailPage promise={promise} />;
}
