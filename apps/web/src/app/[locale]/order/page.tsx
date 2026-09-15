import { Suspense } from "react";

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
  // 주문서는 고를 라인을 `?items=` 에서 읽는다(`useOrderItems` → nuqs). URL 훅은
  // 정적 프리렌더에서 경계 없이 쓸 수 없어 빌드가 멈춘다.
  //
  // fallback 이 `null` 인 것은 화면이 이미 그렇게 동작하기 때문이다 — `AuthOnly` 가
  // hydration 전까지 아무것도 그리지 않으므로, 스켈레톤을 두면 여기서만 잠깐 보였다가
  // 다시 빈 화면으로 돌아간다.
  return (
    <Suspense fallback={null}>
      <OrderPage />
    </Suspense>
  );
}
