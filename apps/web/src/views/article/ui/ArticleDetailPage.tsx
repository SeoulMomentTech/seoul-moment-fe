"use client";

import type { GetArticleDetailRes } from "@shared/services/article";

import { ArticleDetailContent, ArticleDetailMain } from "@features/article";
import { BrandProducts } from "@widgets/brand-products";
import { RelatedList } from "@widgets/detail";

interface ArticleDetailPageProps {
  data: GetArticleDetailRes;
}

export default function ArticleDetailPage({ data }: ArticleDetailPageProps) {
  const main = {
    title: data.title,
    category: data.category,
    summary: data.content,
    date: data.createDate,
    author: data.writer,
    avatarUrl: data.profileImage,
    imageUrl: data.banner,
  };
  const section = data.section ?? [];
  const brandId = data.brandId;
  const lastNews = data.lastArticle ?? [];

  return (
    <>
      <ArticleDetailMain {...main} />
      <ArticleDetailContent data={section} />
      <RelatedList lastNews={lastNews} type="article" />
      <BrandProducts id={brandId} />
    </>
  );
}
