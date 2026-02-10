import { cache, Suspense } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { BASE_URL } from "@shared/constants/env";
import { stripHtml } from "@shared/lib/utils";
import { getNewsDetail } from "@shared/services/news";
import { StructuredDataScript } from "@shared/ui/structured-data-script";

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

    const description = stripHtml(news.content).slice(0, 160);

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

  const responsePromise = fetchNewsDetail(newsId, locale as LanguageType).catch(
    () => notFound(),
  );

  const pageUrl = `${BASE_URL}/${locale}/news/${newsId}`;
  const schemaPromise = responsePromise.then(({ data }) => {
    const content = stripHtml(data.content);

    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
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
      <NewsDetailPage promise={responsePromise} />
    </>
  );
}
