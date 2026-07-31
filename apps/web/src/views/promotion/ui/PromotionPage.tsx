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
      {/*
        챗봇 런처가 우하단(right-6 / bottom-6, 모바일 right-4 / bottom-4)으로
        오면서 기존 `bottom-20 right-[5%]` 는 런처와 8px 간격으로 겹쳤다.
        런처 위에 수직으로 쌓이도록 같은 우측 정렬(right-6)로 맞추고 bottom 을
        런처 높이(48~56) + 여백만큼 올린다.
        z-50 → z-30: 비모달 플로팅 컨트롤이므로 모달 대역(z-50)이 아니라
        런처와 같은 대역에 있어야 다이얼로그가 열릴 때 뒤로 물러난다.
      */}
      <ScrollToTop className="bottom-[88px] right-6 z-30 size-10 shadow-2xl max-sm:bottom-[80px] max-sm:right-4" />
    </>
  );
}
