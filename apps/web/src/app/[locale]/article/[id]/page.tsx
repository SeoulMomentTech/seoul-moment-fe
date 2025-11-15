import { notFound } from "next/navigation";

import { getArticleDetail } from "@shared/services/article";

import type { PageParams } from "@/types";

import { ArticleDetailPage } from "@views/article";

export default async function ArticleDetail({
  params,
}: PageParams<{ id: string }>) {
  const { id, locale } = await params;
  const data = getArticleDetail({ id: Number(id), languageCode: locale }).catch(
    () => notFound(),
  );

  if (id == null || isNaN(Number(id))) {
    notFound();
  }

  return <ArticleDetailPage data={data} id={Number(id)} />;
}
