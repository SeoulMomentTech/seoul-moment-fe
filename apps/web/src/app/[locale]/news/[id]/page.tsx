import { cache } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getNewsDetail } from "@shared/services/news";

import type { LanguageType } from "@/i18n/const";
import type { PageParams } from "@/types";

import { NewsDetailPage } from "@views/news";

const fetchNewsDetail = cache((id: number, languageCode: LanguageType) => {
  return getNewsDetail({ id, languageCode });
});

export async function generateMetadata({
  params,
}: PageParams<{ id: string }>): Promise<Metadata> {
  const { id, locale } = await params;
  const t = await getTranslations();

  try {
    const { data: news } = await fetchNewsDetail(Number(id), locale);

    return {
      title: `${news.title} | ${t("title")}`,
      description: news.content.replace(/<[^>]*>/g, "").slice(0, 160),
    };
  } catch {
    return {};
  }
}

export default async function NewsDetail({
  params,
}: PageParams<{ id: string }>) {
  const { id } = await params;

  if (id == null || isNaN(Number(id))) {
    notFound();
  }

  return <NewsDetailPage id={Number(id)} />;
}
