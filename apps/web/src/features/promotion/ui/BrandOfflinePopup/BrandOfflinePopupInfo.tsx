"use client";

import { MapPinIcon } from "lucide-react";

import type { GetBrandPromotionPopupResponse } from "@shared/services/brandPromotion";

import { VStack, HStack, Flex } from "@seoul-moment/ui";

interface BrandOfflinePopupInfoProps {
  activeEvent: GetBrandPromotionPopupResponse;
  isMobile: boolean;
  onCopy(): void;
}

export function BrandOfflinePopupInfo({
  activeEvent,
  isMobile,
  onCopy,
}: BrandOfflinePopupInfoProps) {
  return (
    <Flex
      align="center"
      className="flex-1 max-sm:px-5"
      direction="column"
      gap={isMobile ? 20 : 40}
      justify="center"
    >
      <h3 className="text-title-3 max-sm:text-body-1 w-full font-semibold text-black">
        {activeEvent.title}
      </h3>

      <VStack className="w-full" gap={isMobile ? 8 : 30}>
        <DetailRow label="장소" value={activeEvent.place} />
        <DetailRow
          label="날짜"
          value={`${new Date(activeEvent.startDate).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })} ~ ${new Date(activeEvent.endDate ?? activeEvent.startDate).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })}`}
        />
        <DetailRow label="시간" value={"09:00 ~ 16:30"} />
        <div className="flex w-full items-center justify-between">
          <DetailRow label="주소" value={activeEvent.address} />
          {isMobile && (
            <button
              className="flex size-8 items-center justify-center rounded-full border border-black/20 bg-white outline-none"
              onClick={onCopy}
              type="button"
            >
              <MapPinIcon className="text-black" size={18} />
            </button>
          )}
        </div>

        <Flex className="w-full" direction="column" gap={16}>
          <span className="text-body-3 text-black/40">Description</span>
          <p className="text-body-3 whitespace-pre-wrap leading-relaxed text-black/80">
            {activeEvent.description}
          </p>
        </Flex>
      </VStack>
    </Flex>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <HStack align="start" className="text-body-3 w-full" gap={16}>
      <span className="shrink-0 text-black/40">{label}</span>
      <span className="text-black/80">{value}</span>
    </HStack>
  );
}
