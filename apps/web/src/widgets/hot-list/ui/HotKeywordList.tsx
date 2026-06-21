"use client";

import { useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper/types";

import StyleCard from "@entities/article/ui/StyleCard";
import { cn } from "@shared/lib/style";
import type { News } from "@shared/services/news";

import { Button } from "@seoul-moment/ui";

import "swiper/css";
import "./hot-keyword-slide.css";

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

interface HotKeywordListProps {
  className?: string;
  items: News[];
}

export default function HotKeywordList({
  className,
  items,
}: HotKeywordListProps) {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateEdges = (swiper: SwiperClass) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <div className={cn("relative", className)}>
      <Swiper
        breakpoints={{
          640: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        }}
        className="hot-keyword-swiper w-full"
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
            key={`hot-${item.id}`}
          >
            <StyleCard
              author={item.writer}
              category={item.newsCategoryName}
              className="h-[418px] max-sm:h-[323px]"
              date={item.createDate}
              imageClassName="h-[297px] max-sm:h-[208px]"
              imageUrl={item.homeImage}
              subTitle={item.content}
              textColor="white"
              title={item.title}
            />
          </SwiperSlide>
        ))}
        <SlideButton disabled={isEnd} type="next" />
      </Swiper>
    </div>
  );
}
