import { notFound } from "next/navigation";

import type { PageParams } from "@/types";
import PromotionPage from "@/views/promotion/ui/PromotionPage";

export default async function Promotion({
  params,
}: PageParams<{ id: string }>) {
  const { id } = await params;
  const promotionId = Number(id);

  if (!Number.isInteger(promotionId) || promotionId <= 0) {
    notFound();
  }

  return <PromotionPage promotionId={promotionId} />;
}
