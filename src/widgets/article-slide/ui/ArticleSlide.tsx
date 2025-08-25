"use client";

import { Swiper, SwiperSlide } from "swiper/react"; // 예시: Swiper 라이브러리 사용
import { ArticleCard } from "@/entities/article";

import "swiper/css";

export default function ArticleSlide() {
  return (
    <Swiper className="hidden! w-full max-sm:block!">
      {[1, 2].map((article) => (
        <SwiperSlide key={article}>
          <ArticleCard />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
