"use client";

import { useId, useRef } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { chunk } from "es-toolkit";
import { Navigation } from "swiper/modules";
import type { SwiperRef } from "swiper/react";
import { Swiper, SwiperSlide } from "swiper/react";

import { FeaturedMainNewsCard, FeaturedSubNewsCard } from "@entities/news/ui";
import { cn } from "@shared/lib/style";
import type { News } from "@shared/services/news";

import { Link } from "@/i18n/navigation";

import "swiper/css";
import "swiper/css/navigation";

interface NewsDesktopSliderProps {
  data: News[];
}

export function NewsDesktopSlider({ data }: NewsDesktopSliderProps) {
  const id = useId();
  const swiperRef = useRef<SwiperRef>(null);
  const pages = chunk(data, 3);

  return (
    <div className="group relative max-sm:hidden">
      <Swiper
        className="overflow-hidden! w-full"
        modules={[Navigation]}
        ref={swiperRef}
        slidesPerView={1}
        spaceBetween={40}
        watchOverflow
      >
        {pages.map((page) => {
          const [main, ...subs] = page;
          const pageKey = page.map((news) => news.id).join("-");

          return (
            <SwiperSlide key={`news-page-${pageKey}-${id}`}>
              <div className="flex gap-[40px]">
                {main && (
                  <Link href={`/news/${main.id}`}>
                    <FeaturedMainNewsCard
                      author={main.writer}
                      date={main.createDate}
                      imageUrl={main.homeImage}
                      subTitle={main.content}
                      title={main.title}
                    />
                  </Link>
                )}
                {subs.map((news) => (
                  <div className="flex justify-start" key={`sub-${news.id}`}>
                    <Link href={`/news/${news.id}`}>
                      <FeaturedSubNewsCard
                        author={news.writer}
                        date={news.createDate}
                        imageUrl={news.homeImage}
                        subTitle={news.content}
                        title={news.title}
                      />
                    </Link>
                  </div>
                ))}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <button
        aria-label="Previous slide"
        className={cn(
          "absolute left-[10px] top-[298px] z-10 -translate-y-1/2",
          "flex h-8 w-8 items-center justify-center rounded-full border border-black/20 bg-white",
          "shadow-[0_0_4px_rgba(0,0,0,0.16)] transition-opacity",
          "hover:bg-gray-50",
        )}
        onClick={() => swiperRef.current?.swiper.slidePrev()}
        type="button"
      >
        <ChevronLeft className="text-black" size={24} strokeWidth={1} />
      </button>
      <button
        aria-label="Next slide"
        className={cn(
          "absolute right-[10px] top-[298px] z-10 -translate-y-1/2",
          "flex h-8 w-8 items-center justify-center rounded-full border border-black/20 bg-white",
          "shadow-[0_0_4px_rgba(0,0,0,0.16)] transition-opacity",
          "hover:bg-gray-50",
        )}
        onClick={() => swiperRef.current?.swiper.slideNext()}
        type="button"
      >
        <ChevronRight className="text-black" size={24} strokeWidth={1} />
      </button>
    </div>
  );
}
