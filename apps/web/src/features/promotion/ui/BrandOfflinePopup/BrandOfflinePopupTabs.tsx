"use client";

import type { GetBrandPromotionPopupResponse } from "@shared/services/brandPromotion";

import { Flex, cn } from "@seoul-moment/ui";

interface BrandOfflinePopupTabsProps {
  popupList: GetBrandPromotionPopupResponse[];
  selectedId: number;
  onSelect(id: number): void;
}

export function BrandOfflinePopupTabs({
  popupList,
  selectedId,
  onSelect,
}: BrandOfflinePopupTabsProps) {
  return (
    <div className="no-scrollbar w-full max-sm:overflow-x-auto max-sm:px-5">
      <Flex className="max-sm:w-max" gap={10} justify="center">
        {popupList.map((event) => (
          <button
            className={cn(
              "text-body-3 h-10 shrink-0 rounded-full px-4 outline-none transition-all",
              selectedId === event.id
                ? "bg-black font-semibold text-white"
                : "border border-black/10 bg-white font-normal text-black/80",
            )}
            key={event.id}
            onClick={() => onSelect(event.id)}
            type="button"
          >
            {new Date(event.startDate).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
            })}
          </button>
        ))}
      </Flex>
    </div>
  );
}
