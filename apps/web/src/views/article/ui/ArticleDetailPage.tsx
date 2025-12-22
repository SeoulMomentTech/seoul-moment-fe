"use client";

import { use } from "react";

import type { GetArticleDetailRes } from "@shared/services/article";

import { ArticleDetailContent, ArticleDetailMain } from "@features/article";
import type { CommonRes } from "@shared/services";
import { BrandProducts } from "@widgets/brand-products";
import { RelatedList } from "@widgets/detail";

interface ArticleDetailPageProps {
  data: Promise<CommonRes<GetArticleDetailRes>>;
}

export default function ArticleDetailPage({ data }: ArticleDetailPageProps) {
  const articleData = use(data);
  const main = {
    title: articleData.data.title,
    category: articleData.data.category,
    summary: articleData.data.content,
    date: articleData.data.createDate,
    author: articleData.data.writer,
    avatarUrl: articleData.data.profileImage,
    imageUrl: articleData.data.banner,
  };
  const section = articleData.data.section ?? [];
  const brandId = articleData.data.brandId;
  const lastNews = articleData.data.lastNews ?? [];

  return (
    <>
      <ArticleDetailMain {...main} />
      <ArticleDetailContent data={section} />
      <RelatedList lastNews={lastNews} type="article" />
      <BrandProducts id={brandId} />
    </>
  );
}
