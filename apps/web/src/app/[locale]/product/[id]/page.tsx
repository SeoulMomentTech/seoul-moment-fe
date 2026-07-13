import { cache } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { reportMetadataError } from "@shared/lib/utils/log/report-metadata-error";
import { getProductDetail } from "@shared/services/product";

import type { LanguageType } from "@/i18n/const";
import { buildLocalizedAlternates } from "@/i18n/metadata";
import type { PageParams } from "@/types";

import { ProductDetailPage } from "@views/product";

const fetchProductDetail = cache((id: number, languageCode: LanguageType) =>
  getProductDetail({ id, languageCode }),
);

export async function generateMetadata({
  params,
}: PageParams<{ id: string }>): Promise<Metadata> {
  const { id, locale } = await params;
  const productId = parseInt(id);
  const t = await getTranslations();

  if (!Number.isInteger(productId)) {
    return {};
  }

  try {
    const { data: product } = await fetchProductDetail(productId, locale);

    const title = `${product.name} | ${t("title")}`;
    const description = `${product.brand.name} - ${product.name}`;
    const images = product.subImage?.[0] ? [product.subImage[0]] : [];

    return {
      title,
      description,
      alternates: buildLocalizedAlternates(locale, `/product/${productId}`),
      openGraph: {
        title,
        description,
        images: images.map((url) => ({ url })),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images,
      },
    };
  } catch (error) {
    reportMetadataError("fetch-product-detail", error, { productId });
    return {};
  }
}

export default async function ProductDetail({
  params,
}: PageParams<{ id: string }>) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || !productId) {
    notFound();
  }

  return <ProductDetailPage id={productId} />;
}
