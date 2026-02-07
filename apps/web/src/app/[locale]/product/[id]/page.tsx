import { cache } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getProductDetail } from "@shared/services/product";

import type { LanguageType } from "@/i18n/const";
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

    return {
      title: `${product.name} | ${t("title")}`,
      description: `${product.brand.name} - ${product.name}`,
      openGraph: {
        title: `${product.name} | ${t("title")}`,
        description: `${product.brand.name} - ${product.name}`,
        images: product.subImage?.[0] ? [{ url: product.subImage[0] }] : [],
      },
    };
  } catch (error) {
    console.error("Failed to fetch product details:", error);
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
