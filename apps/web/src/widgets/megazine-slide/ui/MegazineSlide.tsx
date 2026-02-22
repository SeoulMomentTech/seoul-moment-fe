"use client";

import { useState } from "react";

import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@shared/ui/icon";

import { Link } from "@/i18n/navigation";

import { MegazineCard } from "@entities/megazine";
import { Flex, cn } from "@seoul-moment/ui";

import "swiper/css";

interface Magazine {
  id: number;
  title: string;
  banner: string;
}

interface MegazineSlideProps {
  magazines: Magazine[];
  type: "news" | "article";
}

export function MegazineSlide({ magazines, type }: MegazineSlideProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const totalSlides = magazines.length;

  return (
    <div className="hidden! max-sm:block! w-full space-y-[30px]">
      <Swiper
        className="w-full"
        loop
        onSlideChange={(s) => {
          console.log(s.realIndex);
          setActiveIndex(s.realIndex);
        }}
        onSwiper={setSwiper}
      >
        {magazines.map((magazine) => (
          <SwiperSlide key={magazine.id}>
            <Link href={`/${type}/${magazine.id}`}>
              <MegazineCard
                imageUrl={magazine.banner}
                title={
                  <Flex align="center" justify="space-between">
                    <span className="font-semibold">{magazine.title}</span>
                    <ArrowRightIcon />
                  </Flex>
                }
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Bottom Area: Progress Bar and Pagination */}
      <div className="flex flex-col gap-[30px] px-[20px]">
        {/* Progress Bar */}
        <div className="relative h-[2px] w-full bg-black/10">
          <div
            className="absolute left-0 top-0 h-full bg-black transition-all duration-300"
            style={{
              width: `${((activeIndex + 1) / totalSlides) * 100}%`,
            }}
          />
        </div>

        {/* Pagination Controls */}
        <Flex align="center" className="w-full" justify="center">
          <Flex align="center" gap="20px">
            <button
              aria-label="Previous slide"
              className={cn("p-1 transition-opacity")}
              onClick={() => swiper?.slidePrev()}
              type="button"
            >
              <ChevronLeftIcon className="size-6" />
            </button>

            <div className="text-body-5 min-w-[40px] text-center font-medium">
              <span>{activeIndex + 1}</span>
              <span className="mx-1 text-black/40">/</span>
              <span className="text-black/40">{totalSlides}</span>
            </div>

            <button
              aria-label="Next slide"
              className={cn("p-1 transition-opacity")}
              onClick={() => swiper?.slideNext()}
              type="button"
            >
              <ChevronRightIcon className="size-6" />
            </button>
          </Flex>
        </Flex>
      </div>
    </div>
  );
}
