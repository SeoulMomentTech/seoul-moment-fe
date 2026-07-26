"use client";

import type { GetNewsDetailRes } from "@shared/services/news";

import { BrandProducts } from "@widgets/brand-products";
import { RelatedList } from "@widgets/detail";

import { NewsDetailContent } from "./NewsDetailContent";
import { NewsDetailMain } from "./NewsDetailMain";

interface NewsDetailPageProps {
  data: GetNewsDetailRes;
}

export function NewsDetailPage({ data }: NewsDetailPageProps) {
  const main = {
    title: data.title,
    category: data.category,
    summary: data.content,
    date: data.createDate,
    author: data.writer,
    avatarUrl: data.profileImage,
    imageUrl: data.banner,
  };

  return (
    <>
      <NewsDetailMain {...main} />
      <NewsDetailContent data={data.section} />
      <RelatedList lastNews={data.lastNews} type="news" />
      <BrandProducts id={data.brandId} />
    </>
  );
}
