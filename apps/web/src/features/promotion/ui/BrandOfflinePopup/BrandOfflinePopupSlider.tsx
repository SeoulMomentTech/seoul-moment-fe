"use client";

import { useEffect, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import Image from "next/image";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import { useMediaQuery } from "@shared/lib/hooks";

import "swiper/css";

interface BrandOfflinePopupSliderProps {
  imageUrlList: string[];
  title: string;
}

export function BrandOfflinePopupSlider({
  imageUrlList,
  title,
}: BrandOfflinePopupSliderProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 40rem)", false);

  useEffect(() => {
    if (swiper) {
      swiper.slideTo(0);
      setCurrentImageIndex(0);
    }
  }, [imageUrlList, swiper]);

  return (
    <div className="relative h-[400px] w-[630px] shrink-0 overflow-hidden border border-black/10 max-sm:h-[230px] max-sm:w-full">
      <Swiper
        className="h-full w-full"
        onSlideChange={(swiperInstance) =>
          setCurrentImageIndex(swiperInstance.activeIndex)
        }
        onSwiper={setSwiper}
        slidesPerView={1}
      >
        {imageUrlList.map((url, index) => (
          <SwiperSlide key={`${url}-${url}-${index + 1}`}>
            <Image
              alt={title}
              className="object-cover"
              fill
              sizes="(max-width: 640px) 100vw, 630px"
              src={url}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {!isMobile && imageUrlList.length > 1 && (
        <div className="absolute inset-x-5 top-1/2 z-10 flex -translate-y-1/2 justify-between">
          <button
            className="flex size-10 items-center justify-center rounded-full bg-black/20 text-white outline-none hover:bg-black/40"
            onClick={() => swiper?.slidePrev()}
            type="button"
          >
            <ChevronLeftIcon size={24} />
          </button>
          <button
            className="flex size-10 items-center justify-center rounded-full bg-black/20 text-white outline-none hover:bg-black/40"
            onClick={() => swiper?.slideNext()}
            type="button"
          >
            <ChevronRightIcon size={24} />
          </button>
        </div>
      )}

      {isMobile && imageUrlList.length > 1 && (
        <div className="absolute inset-x-5 bottom-[30px] z-10 h-0.5 bg-white/40">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{
              width: `${(1 / imageUrlList.length) * 100}%`,
              transform: `translateX(${currentImageIndex * 100}%)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
