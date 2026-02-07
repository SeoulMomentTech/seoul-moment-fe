import { cache } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

  if (!Number.isInteger(productId)) {
    return {};
  }

  try {
    const { data: product } = await fetchProductDetail(productId, locale);

    return {
      title: product.name,
      description: `${product.brand.name} - ${product.name}`,
      openGraph: {
        title: product.name,
        description: `${product.brand.name} - ${product.name}`,
        images: product.subImage?.[0] ? [{ url: product.subImage[0] }] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductDetail({
  params,
}: PageParams<{ id: string }>) {
  const { id, locale } = await params;
  const productId = parseInt(id);

  if (!Number.isInteger(productId)) {
    notFound();
  }

  const initialData = await fetchProductDetail(productId, locale).catch(() =>
    notFound(),
  );

  return <ProductDetailPage id={productId} initialData={initialData} />;
}
