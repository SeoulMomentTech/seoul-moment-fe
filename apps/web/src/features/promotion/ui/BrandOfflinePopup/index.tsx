"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useCopyToClipboard, useMediaQuery } from "@shared/lib/hooks";
import type { GetBrandPromotionPopupResponse } from "@shared/services/brandPromotion";

import { VStack, cn } from "@seoul-moment/ui";

import { BrandOfflinePopupInfo } from "./BrandOfflinePopupInfo";
import { BrandOfflinePopupMap } from "./BrandOfflinePopupMap";
import { BrandOfflinePopupSlider } from "./BrandOfflinePopupSlider";
import { BrandOfflinePopupTabs } from "./BrandOfflinePopupTabs";

interface BrandOnlineEventProps {
  popupList: GetBrandPromotionPopupResponse[];
}

export function BrandOfflinePopup({ popupList }: BrandOnlineEventProps) {
  const [selectedId, setSelectedId] = useState(popupList[0].id);
  const isMobile = useMediaQuery("(max-width: 40rem)", false);
  const { copy } = useCopyToClipboard();
  const t = useTranslations();

  const activeEvent =
    popupList.find((e) => e.id === selectedId) || popupList[0];

  const handleCopy = async () => {
    await copy(activeEvent.address);
    toast.success("Address Copied");
  };

  return (
    <section
      className={cn(
        "min-w-7xl w-full border-b border-black/10 bg-white py-[100px]",
        "max-sm:min-w-auto max-sm:py-[60px]",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 max-sm:px-0">
        <VStack align="center" className="w-full" gap={isMobile ? 30 : 60}>
          <h2 className="text-title-2 max-sm:text-title-4 text-center font-bold text-black">
            {t("offline_popup_event")}
          </h2>

          <BrandOfflinePopupTabs
            onSelect={setSelectedId}
            popupList={popupList}
            selectedId={selectedId}
          />

          <div className="w-full max-sm:px-0">
            <div className="flex w-full flex-row gap-10 max-sm:flex-col max-sm:gap-[30px]">
              <BrandOfflinePopupSlider
                imageUrlList={activeEvent.imageUrlList}
                title={activeEvent.title}
              />

              <BrandOfflinePopupInfo
                activeEvent={activeEvent}
                isMobile={isMobile}
                onCopy={handleCopy}
              />
            </div>
          </div>

          <BrandOfflinePopupMap
            latitude={activeEvent.latitude}
            longitude={activeEvent.longitude}
          />
        </VStack>
      </div>
    </section>
  );
}
