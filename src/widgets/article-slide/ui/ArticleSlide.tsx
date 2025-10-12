"use client";

import { Swiper, SwiperSlide } from "swiper/react"; // 예시: Swiper 라이브러리 사용
import { Link } from "@/i18n/navigation";
import { ArticleCard } from "@entities/article";
import { useArticle } from "@entities/article/model/hooks";

import "swiper/css";

export default function ArticleSlide() {
  const { data } = useArticle({ count: 2 });

  return (
    <Swiper className="hidden! w-full max-sm:block!">
      {data.map((article) => (
        <SwiperSlide key={article.id}>
          <Link href={`/article/${article.id}`}>
            <ArticleCard
              author={article.writer}
              date={article.createDate}
              imageUrl={article.image}
              subTitle={article.content}
              title={article.title}
            />
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
