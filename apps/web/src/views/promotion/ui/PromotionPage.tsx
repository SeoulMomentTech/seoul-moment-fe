"use client";

import { use } from "react";

import type { GetBrandPromotionResponse } from "@shared/services/brandPromotion";

import { ScrollToTop } from "@/widgets/scroll-to-top";

import {
  MainBanner,
  BrandTab,
  BrandIntroduction,
  BrandLookbook,
  BrandSpecialEvent,
  BrandOfflinePopup,
  BrandOnlineEvent,
} from "@features/promotion";
import type { CommonRes } from "@shared/services";

interface PromotionPageProps {
  promotionId: number;
  promise: Promise<CommonRes<GetBrandPromotionResponse>>;
}

export default function PromotionPage({
  promotionId,
  promise,
}: PromotionPageProps) {
  const { data } = use(promise);

  return (
    <>
      <MainBanner bannerList={data.bannerList} />
      <BrandTab selectedId={promotionId} />
      <BrandIntroduction brand={data.brand} />
      <BrandLookbook sectionList={data.sectionList} />
      <BrandSpecialEvent products={data.productList} />
      <BrandOfflinePopup popupList={data.popupList} />
      <BrandOnlineEvent
        colorCode={data.brand.colorCode}
        eventList={data.eventList}
        logoImage={data.brand.profileImageUrl}
        noticeList={data.noticsList}
      />
      <ScrollToTop className="bottom-20 right-[5%] z-50 mx-auto size-10 shadow-2xl" />
    </>
  );
}
