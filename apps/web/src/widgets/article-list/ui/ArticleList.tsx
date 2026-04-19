"use client";

import { useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Navigation } from "swiper/modules";
import type { SwiperRef } from "swiper/react";
import { Swiper, SwiperSlide } from "swiper/react";

import { cn } from "@shared/lib/style";
import type { Article } from "@shared/services/article";

import { Link } from "@/i18n/navigation";

import { ArticleCard } from "@entities/article";

import "swiper/css";
import "swiper/css/navigation";

interface ArticleListProps {
  className?: string;
  data: Article[];
}

export default function ArticleList({ className, data }: ArticleListProps) {
  const swiperRef = useRef<SwiperRef>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(data.length <= 3);

  return (
    <div className={cn("group relative max-sm:hidden", className)}>
      <Swiper
        className="overflow-hidden! w-full"
        modules={[Navigation]}
        onSlideChange={(swiper) => {
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        onSwiper={(swiper) => {
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        ref={swiperRef}
        slidesPerGroup={3}
        slidesPerView={3}
        spaceBetween={30}
        watchOverflow
      >
        {data.map((article) => (
          <SwiperSlide key={article.id}>
            <Link href={`/article/${article.id}`}>
              <ArticleCard
                author={article.writer}
                className="w-[407px] flex-none"
                date={article.createDate}
                imageUrl={article.homeImage}
                subTitle={article.content}
                title={article.title}
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        aria-label="Previous slide"
        className={cn(
          "absolute left-[10px] top-[250px] z-10 -translate-y-1/2",
          "flex h-8 w-8 items-center justify-center rounded-full border border-black/20 bg-white",
          "shadow-[0_0_4px_rgba(0,0,0,0.16)] transition-opacity",
          "hover:bg-gray-50",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white",
        )}
        disabled={isBeginning}
        onClick={() => swiperRef.current?.swiper.slidePrev()}
        type="button"
      >
        <ChevronLeft className="text-black" size={24} strokeWidth={1} />
      </button>
      <button
        aria-label="Next slide"
        className={cn(
          "absolute right-[10px] top-[250px] z-10 -translate-y-1/2",
          "flex h-8 w-8 items-center justify-center rounded-full border border-black/20 bg-white",
          "shadow-[0_0_4px_rgba(0,0,0,0.16)] transition-opacity",
          "hover:bg-gray-50",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white",
        )}
        disabled={isEnd}
        onClick={() => swiperRef.current?.swiper.slideNext()}
        type="button"
      >
        <ChevronRight className="text-black" size={24} strokeWidth={1} />
      </button>
    </div>
  );
}
