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
  const newsId = Number(id);
  const t = await getTranslations();

  if (!Number.isInteger(newsId) || newsId <= 0) {
    return {};
  }

  try {
    const { data: news } = await fetchNewsDetail(newsId, locale);

    const description = news.content.replace(/<[^>]*>/g, "").slice(0, 160);

    return {
      title: `${news.title} | ${t("title")}`,
      description,
      openGraph: {
        title: `${news.title} | ${t("title")}`,
        description,
        images: news.banner ? [{ url: news.banner }] : [],
        type: "article",
      },
    };
  } catch {
    return {};
  }
}

export default async function NewsDetail({
  params,
}: PageParams<{ id: string }>) {
  const { id, locale } = await params;
  const newsId = Number(id);

  if (!Number.isInteger(newsId) || newsId <= 0) {
    notFound();
  }

  const promise = fetchNewsDetail(newsId, locale as LanguageType).catch(() =>
    notFound(),
  );

  return <NewsDetailPage promise={promise} />;
}
