import { Suspense } from "react";

import { getLocale } from "next-intl/server";
import { ErrorBoundary } from "react-error-boundary";

import { getArticleList } from "@shared/services/article";

import type { LanguageType } from "@/i18n/const";

import { Article as ArticleClient, ArticleSkeleton } from "./Article.client";

export default async function Article() {
  const locale = (await getLocale()) as LanguageType;
  const promise = getArticleList({ count: 9, languageCode: locale });

  return (
    // 섹션 하나의 요청이 실패해도 홈 전체가 에러 페이지로 넘어가지 않게 그 섹션만 뺀다
    <ErrorBoundary fallback={null}>
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleClient promise={promise} />
      </Suspense>
    </ErrorBoundary>
  );
}
