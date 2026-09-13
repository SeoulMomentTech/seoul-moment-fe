import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { OrderPage } from "@/views/order";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("seo_order_title"),
    description: t("seo_order_description"),
    // 장바구니에서 고른 라인에만 의미가 있는 개인화 화면이라 색인 대상이 아니다
    robots: { index: false, follow: false },
  };
}

export default function Order() {
  return <OrderPage />;
}
