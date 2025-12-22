import { notFound } from "next/navigation";

import { getArticleDetail } from "@shared/services/article";

import type { PageParams } from "@/types";

import { ArticleDetailPage } from "@views/article";

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
