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
import { ScrollToTop } from "@/widgets/scroll-to-top";

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
      <ScrollToTop className="bottom-20 right-[5%] z-50 mx-auto size-10 shadow-2xl" />
    </>
  );
}
