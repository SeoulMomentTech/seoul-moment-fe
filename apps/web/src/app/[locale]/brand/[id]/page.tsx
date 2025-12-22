import { notFound } from "next/navigation";

import { getBrandDetail } from "@shared/services/brand";

import type { PageParams } from "@/types";

import { BrandDetailPage } from "@views/brand";

export default async function BrandDetail({
  params,
}: PageParams<{ id: string }>) {
  const { id, locale } = await params;

  const brandId = Number(id);

  if (!Number.isInteger(brandId)) {
    notFound();
  }

  const promise = getBrandDetail({
    id: brandId,
    languageCode: locale,
  }).catch(() => notFound());

  return <BrandDetailPage promise={promise} />;
}
