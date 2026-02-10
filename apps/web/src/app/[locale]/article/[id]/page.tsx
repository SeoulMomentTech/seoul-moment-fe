import { cache, Suspense } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { BASE_URL } from "@shared/constants/env";
import { stripHtml } from "@shared/lib/utils";
import { getArticleDetail } from "@shared/services/article";
import { StructuredDataScript } from "@shared/ui/structured-data-script";

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
  } catch {
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

  const responsePromise = fetchArticleDetail(
    articleId,
    locale as LanguageType,
  ).catch(() => notFound());

  const pageUrl = `${BASE_URL}/${locale}/article/${articleId}`;
  const schemaPromise = responsePromise.then(({ data }) => {
    const content = stripHtml(data.content);

    return {
      "@context": "https://schema.org",
      "@type": "Article",
      mainEntityOfPage: pageUrl,
      headline: data.title,
      description: content.slice(0, 160),
      articleBody: content,
      image: data.banner ? [data.banner] : [],
      datePublished: data.createDate,
      dateModified: data.createDate,
      inLanguage: locale,
      author: {
        "@type": "Person",
        name: data.writer,
      },
      publisher: {
        "@type": "Organization",
        name: "Seoul Moment",
        url: BASE_URL,
      },
      url: pageUrl,
    };
  });

  return (
    <>
      <Suspense fallback={null}>
        <StructuredDataScript schemaPromise={schemaPromise} />
      </Suspense>
      <ArticleDetailPage data={responsePromise} />
    </>
  );
}
