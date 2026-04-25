import { cache } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { BASE_URL } from "@shared/constants/env";
import { stripHtml } from "@shared/lib/utils";
import { reportMetadataError } from "@shared/lib/utils/log/report-metadata-error";
import { getArticleDetail, getArticleList } from "@shared/services/article";
import { StructuredDataScript } from "@shared/ui/structured-data-script";

import type { LanguageType } from "@/i18n/const";
import { routing } from "@/i18n/routing";
import type { PageParams } from "@/types";

import { ArticleDetailPage } from "@views/article";

const PRERENDER_ARTICLE_COUNT = 30;

const fetchArticleDetail = cache((id: number, languageCode: LanguageType) => {
  return getArticleDetail({ id, languageCode });
});

export const revalidate = 1800;

export async function generateStaticParams() {
  try {
    const { data } = await getArticleList({
      count: PRERENDER_ARTICLE_COUNT,
      languageCode: routing.defaultLocale,
    });

    return routing.locales.flatMap((locale) =>
      data.list.map((article) => ({
        locale,
        id: String(article.id),
      })),
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageParams<{ id: string }>): Promise<Metadata> {
  const { id, locale } = await params;
  const articleId = Number(id);
  const t = await getTranslations();

  if (!Number.isInteger(articleId) || articleId <= 0) {
    return {};
  }

  try {
    const { data: article } = await fetchArticleDetail(articleId, locale);

    const description = stripHtml(article.content).slice(0, 160);

    return {
      title: `${article.title} | ${t("title")}`,
      description,
      openGraph: {
        title: `${article.title} | ${t("title")}`,
        description,
        images: article.banner ? [{ url: article.banner }] : [],
        type: "article",
      },
    };
  } catch (error) {
    reportMetadataError("fetch-article-detail", error, { articleId });
    return {};
  }
}

export default async function ArticleDetail({
  params,
}: PageParams<{ id: string }>) {
  const { id, locale } = await params;
  const articleId = Number(id);

  if (!Number.isInteger(articleId) || articleId <= 0) {
    notFound();
  }

  const response = await fetchArticleDetail(
    articleId,
    locale as LanguageType,
  ).catch(() => notFound());

  const article = response.data;
  const pageUrl = `${BASE_URL}/${locale}/article/${articleId}`;
  const content = stripHtml(article.content);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: pageUrl,
    headline: article.title,
    description: content.slice(0, 160),
    articleBody: content,
    image: article.banner ? [article.banner] : [],
    datePublished: article.createDate,
    dateModified: article.createDate,
    inLanguage: locale,
    author: {
      "@type": "Person",
      name: article.writer,
    },
    publisher: {
      "@type": "Organization",
      name: "Seoul Moment",
      url: BASE_URL,
    },
    url: pageUrl,
  };

  return (
    <>
      <StructuredDataScript schemaPromise={Promise.resolve(schema)} />
      <ArticleDetailPage data={article} />
    </>
  );
}
