"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react"; // 예시: Swiper 라이브러리 사용

import StyleCard from "@entities/article/ui/StyleCard";
import { cn } from "@shared/lib/style";
import type { News } from "@shared/services/news";

import { Button } from "@seoul-moment/ui";

import "swiper/css";
import "./editor-pick-slide.css";

interface SlideButtonProps {
  type: "next" | "prev";
}

const SlideButton = ({ type }: SlideButtonProps) => {
  const swiper = useSwiper();

  const handleClick = () => {
    if (type === "next") {
      swiper.slideNext();
    }

    if (type === "prev") {
      swiper.slidePrev();
    }
  };

  return (
    <Button
      className={cn(
        "absolute z-[2] max-sm:hidden",
        "h-[32px] w-[32px] rounded-full border border-white/20 bg-white p-0 shadow-sm",
        "hover:bg-white",
        type === "prev" && "left-[14px] top-[40%]",
        type === "next" && "right-[14px] top-[40%]",
      )}
      onClick={handleClick}
    >
      {type === "prev" && (
        <ChevronLeft className="text-black" height={24} width={24} />
      )}
      {type === "next" && (
        <ChevronRight className="text-black" height={24} width={24} />
      )}
    </Button>
  );
};

interface EditorPickSlideProps {
  items: News[];
}

export default function EditorPickSlide({ items }: EditorPickSlideProps) {
  return (
    <div className="relative">
      <Swiper
        allowSlideNext
        allowSlidePrev
        breakpoints={{
          640: {
            slidesPerView: 4,
            spaceBetween: 40,
          },
        }}
        className="w-full max-sm:w-full"
        loop
        modules={[FreeMode]}
        slidesPerView="auto"
        spaceBetween={16}
      >
        <SlideButton type="prev" />
        {items.map((item) => (
          <SwiperSlide key={`pick-${item.id}`}>
            <StyleCard
              author={item.writer}
              category=""
              className="h-[321px] max-sm:h-[257px]"
              date={item.createDate}
              imageClassName="max-sm:h-[142px]"
              imageUrl={item.homeImage}
              subTitle={item.content}
              title={item.title}
            />
          </SwiperSlide>
        ))}
        <SlideButton type="next" />
      </Swiper>
    </div>
  );
}
