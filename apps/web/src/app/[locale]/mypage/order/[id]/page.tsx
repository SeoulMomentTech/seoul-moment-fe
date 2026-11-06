import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { MyPageOrderDetail } from "@/views/mypage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("order_detail_title"),
    // 로그인한 사람의 주문이라 색인 대상이 아니다
    robots: { index: false, follow: false },
  };
}

export default async function MypageOrderDetail({
  params,
}: PageProps<"/[locale]/mypage/order/[id]">) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  return <MyPageOrderDetail orderId={orderId} />;
}
