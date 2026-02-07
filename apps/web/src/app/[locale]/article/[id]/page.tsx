import { cache } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getArticleDetail } from "@shared/services/article";

import type { LanguageType } from "@/i18n/const";
import type { PageParams } from "@/types";

import { ArticleDetailPage } from "@views/article";

const fetchArticleDetail = cache((id: number, languageCode: LanguageType) => {
  return getArticleDetail({ id, languageCode });
});

export async function generateMetadata({
  params,
}: PageParams<{ id: string }>): Promise<Metadata> {
  const { id, locale } = await params;
  const articleId = parseInt(id);
  const t = await getTranslations();

  if (!Number.isInteger(articleId)) {
    return {};
  }

  try {
    const { data: article } = await fetchArticleDetail(articleId, locale);

    return {
      title: `${article.title} | ${t("title")}`,
      description: article.content.replace(/<[^>]*>/g, "").slice(0, 160),
    };
  } catch {
    return {};
  }
}

export default async function ArticleDetail({
  params,
}: PageParams<{ id: string }>) {
  const { id, locale } = await params;
  const articleId = parseInt(id);

  if (!Number.isInteger(articleId)) {
    notFound();
  }

  const data = fetchArticleDetail(articleId, locale).catch(() => notFound());

  return <ArticleDetailPage data={data} />;
}
