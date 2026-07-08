"use client";

import type { ReactNode } from "react";

import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperOptions } from "swiper/types";

import { useSwiperEdges } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";
import SlideButton from "@shared/ui/slide-button";

import "swiper/css";

interface CardSliderProps<T> {
  items: T[];
  getKey(item: T): string;
  renderItem(item: T): ReactNode;
  breakpoints?: SwiperOptions["breakpoints"];
  /** 바깥 컨테이너(relative)에 덧붙일 클래스 */
  className?: string;
  /** 슬라이드 너비/간격을 정의하는 스코프 클래스 (예: editor-pick-swiper) */
  swiperClassName?: string;
  slideClassName?: string;
  buttonClassName?: string;
}

/**
 * FreeMode Swiper + 양 끝에서 비활성화되는 prev/next 버튼(PC 전용) 골격.
 * 슬라이드 너비·간격은 swiperClassName으로 연결한 CSS에서 정의한다.
 */
export default function CardSlider<T>({
  items,
  getKey,
  renderItem,
  breakpoints,
  className,
  swiperClassName,
  slideClassName,
  buttonClassName,
}: CardSliderProps<T>) {
  const { isBeginning, isEnd, onEdge } = useSwiperEdges();

  return (
    <div className={cn("relative", className)}>
      <Swiper
        breakpoints={breakpoints}
        className={cn("w-full", swiperClassName)}
        modules={[FreeMode]}
        onProgress={onEdge}
        onResize={onEdge}
        onSlideChange={onEdge}
        onSwiper={onEdge}
        slidesPerView="auto"
        spaceBetween={16}
        watchOverflow
      >
        <SlideButton
          className={buttonClassName}
          disabled={isBeginning}
          type="prev"
        />
        {items.map((item) => (
          <SwiperSlide className={slideClassName} key={getKey(item)}>
            {renderItem(item)}
          </SwiperSlide>
        ))}
        <SlideButton className={buttonClassName} disabled={isEnd} type="next" />
      </Swiper>
    </div>
  );
}
