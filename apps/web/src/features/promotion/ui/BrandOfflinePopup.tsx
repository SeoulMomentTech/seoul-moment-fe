"use client";

import { useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon } from "lucide-react";

import Image from "next/image";

import { useMediaQuery } from "@/shared/lib/hooks";

import { VStack, HStack, cn, Flex } from "@seoul-moment/ui";

interface PopupEvent {
  id: string;
  dateLabel: string;
  title: string;
  location: string;
  dateRange: string;
  time: string;
  address: string;
  description: string;
  imageUrl: string;
  mapImageUrl: string;
}

const POPUP_EVENTS: PopupEvent[] = [
  {
    id: "1",
    dateLabel: "10월 3일",
    title: "Musinsa Pop-up Event",
    location: "무신사 스페이스 성수",
    dateRange: "2025.10.01~2025.10.24",
    time: "09:00~16:30",
    address: "서울특별시 성동구 성수이로 97",
    description:
      "이번 무신사 가을 팝업 이벤트는 25시즌 트랜트에 맞춰 남녀 신상 상품들을 선보인다.\n다양한 브랜드와의 콜라보 상품 및 이벤트들을 보여주며, 유명인사 및 셀럽들의 참여가 예정되어 있어 뜨거운 관심을 보이고있다.",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/6b5c2110-1265-42ad-8acd-59c95b9e7e00",
    mapImageUrl:
      "https://www.figma.com/api/mcp/asset/189be788-8800-4ff1-ba49-594c447462d9",
  },
  {
    id: "2",
    dateLabel: "10월 9일",
    title: "Musinsa Pop-up Event 2",
    location: "무신사 스페이스 성수",
    dateRange: "2025.10.01~2025.10.24",
    time: "09:00~16:30",
    address: "서울특별시 성동구 성수이로 97",
    description: "내용 준비 중입니다.",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/6b5c2110-1265-42ad-8acd-59c95b9e7e00",
    mapImageUrl:
      "https://www.figma.com/api/mcp/asset/189be788-8800-4ff1-ba49-594c447462d9",
  },
  {
    id: "3",
    dateLabel: "10월 15일",
    title: "Musinsa Pop-up Event 3",
    location: "무신사 스페이스 성수",
    dateRange: "2025.10.01~2025.10.24",
    time: "09:00~16:30",
    address: "서울특별시 성동구 성수이로 97",
    description: "내용 준비 중입니다.",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/6b5c2110-1265-42ad-8acd-59c95b9e7e00",
    mapImageUrl:
      "https://www.figma.com/api/mcp/asset/189be788-8800-4ff1-ba49-594c447462d9",
  },
  {
    id: "4",
    dateLabel: "10월 21일",
    title: "Musinsa Pop-up Event 4",
    location: "무신사 스페이스 성수",
    dateRange: "2025.10.01~2025.10.24",
    time: "09:00~16:30",
    address: "서울특별시 성동구 성수이로 97",
    description: "내용 준비 중입니다.",
    imageUrl:
      "https://www.figma.com/api/mcp/asset/6b5c2110-1265-42ad-8acd-59c95b9e7e00",
    mapImageUrl:
      "https://www.figma.com/api/mcp/asset/189be788-8800-4ff1-ba49-594c447462d9",
  },
];

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <HStack align="start" className="text-body-3 w-full" gap={16}>
      <span className="shrink-0 text-black/40">{label}</span>
      <span className="text-black/80">{value}</span>
    </HStack>
  );
}

export function BrandOfflinePopup() {
  const [selectedId, setSelectedId] = useState(POPUP_EVENTS[0].id);
  const isMobile = useMediaQuery("(max-width: 40rem)", false);

  const activeEvent =
    POPUP_EVENTS.find((e) => e.id === selectedId) || POPUP_EVENTS[0];

  return (
    <section
      className={cn(
        "w-full min-w-[1280px] border-b border-black/10 bg-white py-[100px]",
        "max-sm:min-w-auto max-sm:py-[60px]",
      )}
    >
      <div className="mx-auto max-w-[1280px] px-4 max-sm:px-0">
        <VStack align="center" className="w-full" gap={isMobile ? 30 : 60}>
          <h2 className="text-title-2 max-sm:text-title-4 text-center font-bold text-black">
            오프라인 팝업 이벤트
          </h2>

          {/* Tabs */}
          <div className="no-scrollbar w-full max-sm:overflow-x-auto max-sm:px-5">
            <Flex className="max-sm:w-max" gap={10} justify="center">
              {POPUP_EVENTS.map((event) => (
                <button
                  className={cn(
                    "text-body-3 h-[40px] shrink-0 rounded-full px-4 outline-none transition-all",
                    selectedId === event.id
                      ? "bg-black font-semibold text-white"
                      : "border border-black/10 bg-white font-normal text-black/80",
                  )}
                  key={event.id}
                  onClick={() => setSelectedId(event.id)}
                  type="button"
                >
                  {event.dateLabel}
                </button>
              ))}
            </Flex>
          </div>

          {/* Main Content */}
          <div className="w-full max-sm:px-0">
            <div className="flex w-full flex-row gap-[40px] max-sm:flex-col max-sm:gap-[30px]">
              {/* Image Section */}
              <div className="relative h-[400px] w-[630px] shrink-0 overflow-hidden border border-black/10 max-sm:h-[230px] max-sm:w-full">
                <Image
                  alt={activeEvent.title}
                  className="object-cover"
                  fill
                  src={activeEvent.imageUrl}
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
                  <DetailRow label="장소" value={activeEvent.location} />
                  <DetailRow label="날짜" value={activeEvent.dateRange} />
                  <DetailRow label="시간" value={activeEvent.time} />
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

                  <Flex className="mt-2 w-full" direction="column" gap={16}>
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
          {!isMobile && (
            <div className="relative h-[300px] w-full overflow-hidden border border-black/10">
              <Image
                alt="Event Map"
                className="object-cover"
                fill
                src={activeEvent.mapImageUrl}
              />
            </div>
          )}
        </VStack>
      </div>
    </section>
  );
}
