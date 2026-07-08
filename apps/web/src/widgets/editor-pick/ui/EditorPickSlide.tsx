"use client";

import StyleCard from "@entities/article/ui/StyleCard";
import type { News } from "@shared/services/news";
import CardSlider from "@shared/ui/card-slider";

import "./editor-pick-slide.css";
import { cn } from "@seoul-moment/ui";

interface EditorPickSlideProps {
  items: News[];
}

export default function EditorPickSlide({ items }: EditorPickSlideProps) {
  return (
    <CardSlider
      breakpoints={{
        640: {
          slidesPerView: 4,
          spaceBetween: 40,
        },
      }}
      buttonClassName={cn(items.length < 5 && "hidden")}
      getKey={(item) => `pick-${item.id}`}
      items={items}
      renderItem={(item) => (
        <StyleCard
          author={item.writer}
          category={item.newsCategoryName}
          className="h-auto min-h-[321px] max-sm:h-[257px]"
          date={item.createDate}
          imageClassName="min-h-[200px] max-sm:h-[142px] max-sm:min-h-[142px]"
          imageUrl={item.homeImage}
          subTitle={item.content}
          title={item.title}
        />
      )}
      slideClassName="max-sm:first:pl-[20px]"
      swiperClassName="editor-pick-swiper"
    />
  );
}
