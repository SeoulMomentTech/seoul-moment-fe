import { getTranslations } from "next-intl/server";

import { ProductPage } from "@views/product";

export async function generateMetadata() {
  try {
    const t = await getTranslations();

    return {
      title: t("seo_shop_title"),
      description: t("seo_shop_description"),
    };
  } catch {
    return {};
  }
}

export default function Product() {
  return <ProductPage />;
}
