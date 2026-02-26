"use client";

import {
  MainBanner,
  BrandTab,
  BrandIntroduction,
  BrandLookbook,
  BrandSpecialEvent,
  BrandOfflinePopup,
  BrandOnlineEvent,
} from "@/features/promotion";

interface PromotionPageProps {
  promotionId: number;
}

export default function PromotionPage({ promotionId }: PromotionPageProps) {
  return (
    <>
      <MainBanner />
      <BrandTab selectedId={promotionId} />
      <BrandIntroduction />
      <BrandLookbook />
      <BrandSpecialEvent />
      <BrandOfflinePopup />
      <BrandOnlineEvent />
    </>
  );
}
