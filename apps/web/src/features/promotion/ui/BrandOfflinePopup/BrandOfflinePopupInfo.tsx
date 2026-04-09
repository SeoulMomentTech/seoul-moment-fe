"use client";

import { MapPinIcon } from "lucide-react";

import { useTranslations } from "next-intl";

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
  const t = useTranslations();
  const isEndless = new Date(activeEvent.endDate ?? "").getFullYear() >= 2300;
  const startDate = new Date(activeEvent.startDate).toLocaleDateString(
    "ko-KR",
    { year: "numeric", month: "2-digit", day: "2-digit" },
  );
  const endDate = isEndless
    ? ""
    : new Date(activeEvent.endDate ?? activeEvent.startDate).toLocaleDateString(
        "ko-KR",
        { year: "numeric", month: "2-digit", day: "2-digit" },
      );

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
        <DetailRow label={t("location")} value={activeEvent.place} />
        <DetailRow label={t("date")} value={`${startDate} ~ ${endDate}`} />
        <DetailRow
          label={t("time")}
          value={`${activeEvent.startTime} ~ ${activeEvent.endTime}`}
        />
        <div className="flex w-full items-center justify-between">
          <DetailRow
            label={t("promotion_address")}
            value={activeEvent.address}
          />
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
          <span className="text-body-3 text-black/40">
            {t("promotion_description")}
          </span>
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
