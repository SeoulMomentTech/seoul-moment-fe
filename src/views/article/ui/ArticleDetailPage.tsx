"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ArticleDetailContent, ArticleDetailMain } from "@/features/article";
import useLanguage from "@/shared/lib/hooks/useLanguage";
import { getArticleDetail } from "@/shared/services/article";
import { BrandProducts } from "@/widgets/brand-products";
import { RelatedList } from "@/widgets/detail";

interface ArticleDetailPageProps {
  id: number;
}

export function ArticleDetailPage({ id }: ArticleDetailPageProps) {
  const languageCode = useLanguage();
  const { data } = useSuspenseQuery({
    queryKey: ["articleDetail", id, languageCode],
    queryFn: () => getArticleDetail({ languageCode, id }),
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
      <ArticleDetailMain {...data.main} />
      <ArticleDetailContent data={data.section} />
      <RelatedList />
      <BrandProducts />
    </>
  );
}
