"use client";

import { use, useId, useRef } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Navigation } from "swiper/modules";
import type { SwiperRef } from "swiper/react";
import { Swiper, SwiperSlide } from "swiper/react";

import { cn } from "@shared/lib/style";
import type { getHome, HomePromotion } from "@shared/services/home";
import { BaseImage } from "@shared/ui/base-image";

import { Link } from "@/i18n/navigation";

import { Skeleton } from "@seoul-moment/ui";

import "swiper/css";
import "swiper/css/navigation";

interface PromotionListProps {
  promise: ReturnType<typeof getHome>;
}

export function PromotionList({ promise }: PromotionListProps) {
  const id = useId();
  const swiperRef = useRef<SwiperRef>(null);
  const res = use(promise);
  const promotionList: HomePromotion[] =
    res.data?.promotion?.length > 1 ? res.data.promotion.slice(1) : [];
  const isEmpty = !promotionList.length;

  if (isEmpty) return null;

  return (
    <section className="w-7xl mx-auto overflow-hidden bg-white py-[140px] max-sm:w-auto max-sm:py-[50px]">
      <div className="w-7xl relative mx-auto max-sm:w-full">
        <div className="group relative max-sm:px-5">
          <Swiper
            breakpoints={{
              1024: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
            className="overflow-visible! w-full"
            modules={[Navigation]}
            ref={swiperRef}
            slidesPerView="auto"
            spaceBetween={20}
          >
            {promotionList.map((promotion) => (
              <SwiperSlide
                className="max-sm:w-[calc(100vw-40px)]! w-auto!"
                key={`promotion-${promotion.promotionId}-${id}`}
              >
                <Link
                  className="group/item block w-[305px] max-sm:w-full"
                  href={`/promotion/${promotion.promotionId}`}
                >
                  <div className="flex flex-col gap-5">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <BaseImage
                        alt={promotion.title}
                        className="object-cover transition-transform duration-300 group-hover/item:scale-105"
                        fill
                        src={promotion.imageUrl}
                      />
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <h4 className="text-body-2 font-semibold leading-none text-black underline-offset-4 group-hover/item:underline">
                        {promotion.title}
                      </h4>
                      <p className="text-body-3 line-clamp-3 leading-none text-black opacity-80">
                        {promotion.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Desktop Navigation Buttons */}
          <button
            aria-label="Previous slide"
            className={cn(
              "absolute left-[10px] top-[152px] z-10 -translate-y-1/2",
              "flex h-8 w-8 items-center justify-center rounded-full border border-black/20 bg-white",
              "shadow-[0_0_4px_rgba(0,0,0,0.16)] transition-opacity",
              "hover:bg-gray-50 max-sm:hidden",
            )}
            onClick={() => swiperRef.current?.swiper.slidePrev()}
            type="button"
          >
            <ChevronLeft className="text-black" size={24} strokeWidth={1} />
          </button>
          <button
            aria-label="Next slide"
            className={cn(
              "absolute right-[10px] top-[152px] z-10 -translate-y-1/2",
              "flex h-8 w-8 items-center justify-center rounded-full border border-black/20 bg-white",
              "shadow-[0_0_4px_rgba(0,0,0,0.16)] transition-opacity",
              "hover:bg-gray-50 max-sm:hidden",
            )}
            onClick={() => swiperRef.current?.swiper.slideNext()}
            type="button"
          >
            <ChevronRight className="text-black" size={24} strokeWidth={1} />
          </button>
        </div>
      </div>
    </section>
  );
}

export function PromotionListSkeleton() {
  return (
    <section className="bg-white py-[140px] max-sm:py-[50px]">
      <div className="w-7xl mx-auto px-5 max-sm:w-full max-sm:px-5">
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              className="flex w-[305px] shrink-0 flex-col gap-5 max-sm:w-[calc(100vw-60px)]"
              key={`promotion-skeleton-${i + 1}`}
            >
              <Skeleton className="aspect-square w-full" />
              <div className="flex flex-col gap-2.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3.5 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
