import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MyPageOrderList } from "@/views/mypage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("order_history"),
    // 로그인한 사람의 주문이라 색인 대상이 아니다
    robots: { index: false, follow: false },
  };
}

export default function MypageOrder() {
  return <MyPageOrderList />;
}
