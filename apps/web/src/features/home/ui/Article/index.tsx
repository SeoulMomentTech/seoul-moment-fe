import { Suspense } from "react";

import { getLocale } from "next-intl/server";

import { getArticleList } from "@shared/services/article";

import type { LanguageType } from "@/i18n/const";

import { Article as ArticleClient, ArticleSkeleton } from "./Article.client";

export default async function Article() {
  const locale = (await getLocale()) as LanguageType;
  const promise = getArticleList({ count: 3, languageCode: locale });

  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ArticleClient promise={promise} />
    </Suspense>
  );
}
