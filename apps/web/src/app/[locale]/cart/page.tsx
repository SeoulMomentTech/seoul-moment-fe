import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CartPage } from "@/views/cart";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("seo_cart_title"),
    description: t("seo_cart_description"),
    // 개인화된 화면이라 색인 대상이 아니다
    robots: { index: false, follow: false },
  };
}

export default function Cart() {
  return <CartPage />;
}
