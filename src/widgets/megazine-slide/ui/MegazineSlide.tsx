"use client";

import { Swiper, SwiperSlide } from "swiper/react"; // 예시: Swiper 라이브러리 사용
import { MegazineCard } from "@/entities/megazine";

import "swiper/css";

export default function MegazineSlide() {
  return (
    <Swiper className="hidden! w-full max-sm:block!">
      {[1, 2, 3].map((article) => (
        <SwiperSlide key={article}>
          <MegazineCard />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
