import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getArticleDetail } from "@shared/services/article";

import type { PageParams } from "@/types";

import { ArticleDetailPage } from "@views/article";

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
    const { data: article } = await getArticleDetail({
      id: articleId,
      languageCode: locale,
    });

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

  const data = getArticleDetail({ id: articleId, languageCode: locale }).catch(
    () => notFound(),
  );

  return <ArticleDetailPage data={data} />;
}
