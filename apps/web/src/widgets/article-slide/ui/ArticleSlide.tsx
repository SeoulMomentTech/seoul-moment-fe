"use client";

import { Swiper, SwiperSlide } from "swiper/react";

import type { Article } from "@shared/services/article";

import { Link } from "@/i18n/navigation";

import { ArticleCard } from "@entities/article";

import "swiper/css";

interface ArticleSlideProps {
  data: Article[];
}

export default function ArticleSlide({ data }: ArticleSlideProps) {
  return (
    <div className="hidden w-full max-sm:block">
      <Swiper slidesPerView={1} spaceBetween={16}>
        {data.map((article) => (
          <SwiperSlide key={article.id}>
            <Link href={`/article/${article.id}`}>
              <ArticleCard
                author={article.writer}
                date={article.createDate}
                imageUrl={article.homeImage}
                subTitle={article.content}
                title={article.title}
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
