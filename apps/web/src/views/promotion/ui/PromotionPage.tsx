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
  brandPromotionId: number;
  promise: Promise<CommonRes<GetBrandPromotionResponse>>;
}

export default function PromotionPage({
  promotionId,
  brandPromotionId,
  promise,
}: PromotionPageProps) {
  const { data } = use(promise);

  return (
    <>
      <MainBanner bannerList={data.bannerList} />
      <BrandTab promotionId={promotionId} selectedId={brandPromotionId} />
      <BrandIntroduction
        brand={data.brand}
        brandPromotionId={brandPromotionId}
      />
      <BrandLookbook sectionList={data.sectionList} />
      <BrandSpecialEvent brandId={data.brand.id} products={data.productList} />
      <BrandOfflinePopup popupList={data.popupList} />
      <BrandOnlineEvent
        brand={data.brand}
        colorCode={data.brand.colorCode}
        eventList={data.eventList}
        logoImage={data.brand.profileImageUrl}
        noticeList={data.noticeList}
      />
      {/* 챗봇 플로팅 버튼(우측 하단, z-40) 위에 세로로 쌓는다.
          right 는 뷰포트 비율이 아니라 챗봇 버튼과 같은 중심축에 맞춘 고정값이다. */}
      <ScrollToTop className="bottom-23 max-sm:bottom-18 right-8 z-40 mx-auto size-10 shadow-2xl max-sm:right-5" />
    </>
  );
}
