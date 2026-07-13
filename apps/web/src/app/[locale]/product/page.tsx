import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { buildLocalizedAlternates } from "@/i18n/metadata";
import type { PageParams } from "@/types";

import { ProductPage } from "@views/product";

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;

  try {
    const t = await getTranslations();

    return {
      title: t("seo_shop_title"),
      description: t("seo_shop_description"),
      alternates: buildLocalizedAlternates(locale, "/product"),
    };
  } catch {
    return {
      alternates: buildLocalizedAlternates(locale, "/product"),
    };
  }
}

export default function Product() {
  return <ProductPage />;
}
