"use client";

import { Swiper, SwiperSlide } from "swiper/react"; // 예시: Swiper 라이브러리 사용
import { MegazineCard } from "@/entities/megazine";

import "swiper/css";

interface Magazine {
  id: number;
  title: string;
  imageUrl: string;
}

interface MegazineSlideProps {
  magazines: Magazine[];
}

export function MegazineSlide({ magazines }: MegazineSlideProps) {
  return (
    <Swiper className="hidden! w-full max-sm:block!">
      {magazines.map((magazine) => (
        <SwiperSlide key={magazine.id}>
          <MegazineCard title={magazine.title} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
