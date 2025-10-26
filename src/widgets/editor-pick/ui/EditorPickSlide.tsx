"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react"; // 예시: Swiper 라이브러리 사용
import StyleCard from "@entities/article/ui/StyleCard";
import { cn } from "@shared/lib/style";
import { Button } from "@shared/ui/button";

import "swiper/css";
import "./editor-pick-slide.css";

const MOCK_DATA = [
  {
    author: "오끼드",
    date: "2025.05.30",
    category: "ITEM",
    title: "디자인 갤러리",
    subTitle: "마음이 모이는곳",
    imageUrl: "",
  },
  {
    author: "오끼드",
    date: "2025.05.30",
    category: "ITEM",
    title: "디자인 갤러리",
    subTitle: "마음이 모이는곳",
    imageUrl: "",
  },
  {
    author: "오끼드",
    date: "2025.05.30",
    category: "ITEM",
    title: "디자인 갤러리",
    subTitle: "마음이 모이는곳",
    imageUrl: "",
  },
  {
    author: "오끼드",
    date: "2025.05.30",
    category: "ITEM",
    title: "디자인 갤러리",
    subTitle: "마음이 모이는곳",
    imageUrl: "",
  },
  {
    author: "오끼드",
    date: "2025.05.30",
    category: "ITEM",
    title: "디자인 갤러리",
    subTitle: "마음이 모이는곳",
    imageUrl: "",
  },
  {
    author: "오끼드",
    date: "2025.05.30",
    category: "ITEM",
    title: "디자인 갤러리",
    subTitle: "마음이 모이는곳",
    imageUrl: "",
  },
];

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
        type === "prev" && "top-[40%] left-[14px]",
        type === "next" && "top-[40%] right-[14px]",
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

export default function EditorPickSlide() {
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
        {MOCK_DATA.map((item, index) => (
          <SwiperSlide key={`pick-${item.title}-${index + 1}`}>
            <StyleCard
              className="h-[321px] max-sm:h-[257px]"
              imageClassName="max-sm:h-[142px]"
              {...item}
            />
          </SwiperSlide>
        ))}
        <SlideButton type="next" />
      </Swiper>
    </div>
  );
}
