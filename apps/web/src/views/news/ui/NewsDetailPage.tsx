"use client";

import { use } from "react";

import type { GetNewsDetailRes } from "@shared/services/news";

import { NewsDetailContent, NewsDetailMain } from "@features/news";
import type { CommonRes } from "@shared/services";
import { BrandProducts } from "@widgets/brand-products";
import { RelatedList } from "@widgets/detail";

interface NewsDetailPageProps {
  promise: Promise<CommonRes<GetNewsDetailRes>>;
}

export function NewsDetailPage({ promise }: NewsDetailPageProps) {
  const newsData = use(promise);
  const data = {
    main: {
      title: newsData.data.title,
      category: newsData.data.category,
      summary: newsData.data.content,
      date: newsData.data.createDate,
      author: newsData.data.writer,
      avatarUrl: newsData.data.profileImage,
      imageUrl: newsData.data.banner,
    },
    ...newsData.data,
  };

  return (
    <>
      <NewsDetailMain {...data.main} />
      <NewsDetailContent data={data.section} />
      <RelatedList lastNews={data.lastNews} type="news" />
      <BrandProducts id={data.brandId} />
    </>
  );
}
