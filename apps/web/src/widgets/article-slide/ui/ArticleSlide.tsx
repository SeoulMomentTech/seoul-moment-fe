"use client";

import { useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper/types";

import type { Article } from "@shared/services/article";

import { Link } from "@/i18n/navigation";

import { ArticleCard } from "@entities/article";

import "swiper/css";

interface ArticleSlideProps {
  data: Article[];
}

export default function ArticleSlide({ data }: ArticleSlideProps) {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const total = data.length;
  const current = activeIndex + 1;
  const progress = total > 0 ? (current / total) * 100 : 0;
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === total - 1;

  return (
    <div className="hidden w-full max-sm:block">
      <Swiper
        onSlideChange={(s) => setActiveIndex(s.activeIndex)}
        onSwiper={setSwiper}
        slidesPerView={1}
        spaceBetween={16}
      >
        {data.map((article) => (
          <SwiperSlide key={article.id}>
            <Link href={`/article/${article.id}`}>
              <ArticleCard
                author={article.writer}
                date={article.createDate}
                imageUrl={article.homeImage}
                subTitle={article.content}
                title={article.title}
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {total > 1 && (
        <div className="mt-10">
          <div className="relative h-px w-full bg-gray-200">
            <div
              className="absolute left-0 top-0 h-full bg-black transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-sm text-gray-600">
            <button
              aria-label="이전 슬라이드"
              className="disabled:cursor-not-allowed disabled:opacity-30"
              disabled={isFirst}
              onClick={() => swiper?.slidePrev()}
              type="button"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="tabular-nums">
              {current} / {total}
            </span>
            <button
              aria-label="다음 슬라이드"
              className="disabled:cursor-not-allowed disabled:opacity-30"
              disabled={isLast}
              onClick={() => swiper?.slideNext()}
              type="button"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
