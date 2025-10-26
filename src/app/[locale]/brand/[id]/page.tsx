import { notFound } from "next/navigation";
import type { LanguageType } from "@/i18n/const";
import type { PageParams } from "@/types";
import { getBrandDetail } from "@shared/services/brand";
import { BrandDetailPage } from "@views/brand";

export default async function BrandDetail({
  params,
}: PageParams<{ id: string; locale: LanguageType }>) {
  const { id, locale } = await params;
  const promise = getBrandDetail({
    id: Number(id),
    languageCode: locale,
  }).catch(() => notFound());

  if (id == null || isNaN(Number(id))) {
    notFound();
  }

  return <BrandDetailPage id={Number(id)} promise={promise} />;
}
