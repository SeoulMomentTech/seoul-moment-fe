import { notFound } from "next/navigation";
import type { PageParams } from "@/types";
import { ArticleDetailPage } from "@/views/article";

export default async function ArticleDetail({
  params,
}: PageParams<{ id: string }>) {
  const { id } = await params;

  if (id == null || isNaN(Number(id))) {
    notFound();
  }

  return <ArticleDetailPage id={Number(id)} />;
}
