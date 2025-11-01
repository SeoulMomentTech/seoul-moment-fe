"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { NewsDetailContent, NewsDetailMain } from "@features/news";
import useLanguage from "@shared/lib/hooks/useLanguage";
import { getNewsDetail } from "@shared/services/news";
import { BrandProducts } from "@widgets/brand-products";
import { RelatedList } from "@widgets/detail";

interface NewsDetailPageProps {
  id: number;
}

export function NewsDetailPage({ id }: NewsDetailPageProps) {
  const languageCode = useLanguage();
  const { data } = useSuspenseQuery({
    queryKey: ["newsDetail", id, languageCode],
    queryFn: () => getNewsDetail({ languageCode, id }),
    select: ({ data }) => {
      return {
        main: {
          title: data.title,
          category: data.category,
          summary: data.content,
          date: data.createDate,
          author: data.writer,
          avatarUrl: data.profileImage,
          imageUrl: data.banner,
        },
        ...data,
      };
    },
  });

  return (
    <>
      <NewsDetailMain {...data.main} />
      <NewsDetailContent data={data.section} />
      <RelatedList lastNews={data.lastNews} />
      <BrandProducts id={data.brandId} />
    </>
  );
}
