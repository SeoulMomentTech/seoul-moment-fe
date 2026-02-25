"use client";

import { useState } from "react";

import {
  MainBanner,
  BrandTab,
  BrandIntroduction,
  BrandLookbook,
  BrandSpecialEvent,
  BrandOfflinePopup,
  BrandOnlineEvent,
} from "@/features/promotion";

export default function PromotionPage() {
  const [selectedBrandId, setSelectedBrandId] = useState("1");

  return (
    <>
      <MainBanner />
      <BrandTab onSelect={setSelectedBrandId} selectedId={selectedBrandId} />
      <BrandIntroduction />
      <BrandLookbook />
      <BrandSpecialEvent />
      <BrandOfflinePopup />
      <BrandOnlineEvent />
    </>
  );
}
