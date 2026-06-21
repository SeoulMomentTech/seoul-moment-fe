"use client";

import StyleCard from "@entities/article/ui/StyleCard";
import type { News } from "@shared/services/news";
import CardSlider from "@shared/ui/card-slider";

import "./hot-keyword-slide.css";

interface HotKeywordListProps {
  className?: string;
  items: News[];
}

export default function HotKeywordList({
  className,
  items,
}: HotKeywordListProps) {
  return (
    <CardSlider
      breakpoints={{
        640: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
      }}
      className={className}
      getKey={(item) => `hot-${item.id}`}
      items={items}
      renderItem={(item) => (
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
      )}
      slideClassName="max-sm:first:pl-[20px]"
      swiperClassName="hot-keyword-swiper"
    />
  );
}
