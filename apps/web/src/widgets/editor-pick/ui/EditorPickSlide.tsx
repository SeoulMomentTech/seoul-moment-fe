"use client";

import { useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { FreeMode } from "swiper/modules";
import type { SwiperClass } from "swiper/react";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react"; // 예시: Swiper 라이브러리 사용

import StyleCard from "@entities/article/ui/StyleCard";
import { cn } from "@shared/lib/style";
import type { News } from "@shared/services/news";

import { Button } from "@seoul-moment/ui";

import "swiper/css";
import "./editor-pick-slide.css";

interface SlideButtonProps {
  type: "next" | "prev";
  disabled?: boolean;
}

const SlideButton = ({ type, disabled }: SlideButtonProps) => {
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
        "z-2 absolute max-sm:hidden",
        "h-[32px] w-[32px] rounded-full border border-white/20 bg-white p-0 shadow-sm",
        "hover:bg-white",
        "disabled:cursor-not-allowed disabled:bg-white disabled:opacity-40",
        type === "prev" && "left-[14px] top-[40%]",
        type === "next" && "right-[14px] top-[40%]",
      )}
      disabled={disabled}
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
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateEdges = (swiper: SwiperClass) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

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
        className="editor-pick-swiper w-full max-sm:w-full"
        modules={[FreeMode]}
        onProgress={updateEdges}
        onResize={updateEdges}
        onSlideChange={updateEdges}
        onSwiper={updateEdges}
        slidesPerView="auto"
        spaceBetween={16}
        watchOverflow
      >
        <SlideButton disabled={isBeginning} type="prev" />
        {items.map((item) => (
          <SwiperSlide
            className="max-sm:first:pl-[20px]"
            key={`pick-${item.id}`}
          >
            <StyleCard
              author={item.writer}
              category={item.newsCategoryName}
              className="h-auto min-h-[321px] max-sm:h-[257px]"
              date={item.createDate}
              imageClassName="min-h-[200px] max-sm:min-h-[142px] max-sm:h-[142px]"
              imageUrl={item.homeImage}
              subTitle={item.content}
              title={item.title}
            />
          </SwiperSlide>
        ))}
        <SlideButton disabled={isEnd} type="next" />
      </Swiper>
    </div>
  );
}
