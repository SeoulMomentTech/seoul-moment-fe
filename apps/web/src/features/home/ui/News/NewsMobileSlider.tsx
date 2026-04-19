"use client";

import { Swiper, SwiperSlide } from "swiper/react";

import { FeaturedMainNewsCard } from "@entities/news/ui";
import type { News } from "@shared/services/news";

import { Link } from "@/i18n/navigation";

import "swiper/css";

interface NewsMobileSliderProps {
  data: News[];
}

export function NewsMobileSlider({ data }: NewsMobileSliderProps) {
  return (
    <div className="hidden w-full max-sm:block">
      <Swiper slidesPerView={1} spaceBetween={16}>
        {data.map((news) => (
          <SwiperSlide key={`mobile-${news.id}`}>
            <Link href={`/news/${news.id}`}>
              <FeaturedMainNewsCard
                author={news.writer}
                date={news.createDate}
                imageUrl={news.homeImage}
                subTitle={news.content}
                title={news.title}
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
