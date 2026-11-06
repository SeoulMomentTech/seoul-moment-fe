import { Suspense } from "react";

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PaymentResultPage } from "@/views/payment-result";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("seo_payment_result_title"),
    // 토큰으로만 열리는 개인화 화면이라 색인 대상이 아니다
    robots: { index: false, follow: false },
  };
}

export default function PaymentResult() {
  // 결과 토큰은 `?h=` 에서 읽는다(nuqs). URL 훅은 정적 프리렌더에서 경계 없이 쓸 수 없다.
  // `null` fallback 은 주문서와 같은 이유 — 화면이 바로 로딩 상태를 그린다.
  return (
    <Suspense fallback={null}>
      <PaymentResultPage />
    </Suspense>
  );
}
