"use client";

import { useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon } from "lucide-react";

import Image from "next/image";

import { useMediaQuery } from "@shared/lib/hooks";
import type { GetBrandPromotionPopupResponse } from "@shared/services/brandPromotion";

import { VStack, HStack, cn, Flex } from "@seoul-moment/ui";

interface BrandOnlineEventProps {
  popupList: GetBrandPromotionPopupResponse[];
}

export function BrandOfflinePopup({ popupList }: BrandOnlineEventProps) {
  const [selectedId, setSelectedId] = useState(popupList[0].id);
  const isMobile = useMediaQuery("(max-width: 40rem)", false);

  const activeEvent =
    popupList.find((e) => e.id === selectedId) || popupList[0];

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
            오프라인 팝업 이벤트
          </h2>

          {/* Tabs */}
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
                  onClick={() => setSelectedId(event.id)}
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

          {/* Main Content */}
          <div className="w-full max-sm:px-0">
            <div className="flex w-full flex-row gap-10 max-sm:flex-col max-sm:gap-[30px]">
              {/* Image Section */}
              <div className="relative h-[400px] w-[630px] shrink-0 overflow-hidden border border-black/10 max-sm:h-[230px] max-sm:w-full">
                <Image
                  alt={activeEvent.title}
                  className="object-cover"
                  fill
                  src={activeEvent.imageUrlList[0]}
                />
                {!isMobile && (
                  <div className="absolute inset-x-5 top-1/2 flex -translate-y-1/2 justify-between">
                    <button
                      className="flex size-10 items-center justify-center rounded-full bg-black/20 text-white outline-none hover:bg-black/40"
                      type="button"
                    >
                      <ChevronLeftIcon size={24} />
                    </button>
                    <button
                      className="flex size-10 items-center justify-center rounded-full bg-black/20 text-white outline-none hover:bg-black/40"
                      type="button"
                    >
                      <ChevronRightIcon size={24} />
                    </button>
                  </div>
                )}
                {isMobile && (
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                    <div className="h-0.5 w-10 bg-black" />
                    <div className="h-0.5 w-10 bg-white/40" />
                    <div className="h-0.5 w-10 bg-white/40" />
                  </div>
                )}
              </div>

              {/* Info Section */}
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
                        type="button"
                      >
                        <MapPinIcon className="text-black" size={18} />
                      </button>
                    )}
                  </div>

                  <Flex className="w-full" direction="column" gap={16}>
                    <span className="text-body-3 text-black/40">
                      Description
                    </span>
                    <p className="text-body-3 whitespace-pre-wrap leading-relaxed text-black/80">
                      {activeEvent.description}
                    </p>
                  </Flex>
                </VStack>
              </Flex>
            </div>
          </div>

          {/* Map Section - Only Desktop */}

          <iframe
            className="w-full max-sm:h-[130px]"
            height="300"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${activeEvent.latitude},${activeEvent.longitude}&z=16&output=embed`}
            width="600"
          />
        </VStack>
      </div>
    </section>
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
