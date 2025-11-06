"use client";

import { Swiper, SwiperSlide } from "swiper/react"; // 예시: Swiper 라이브러리 사용
import { Link } from "@/i18n/navigation";
import { MegazineCard } from "@entities/megazine";

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
  return (
    <Swiper className="hidden! max-sm:block! w-full">
      {magazines.map((magazine) => (
        <SwiperSlide key={magazine.id}>
          <Link href={`/${type}/${magazine.id}`}>
            <MegazineCard imageUrl={magazine.banner} title={magazine.title} />
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
