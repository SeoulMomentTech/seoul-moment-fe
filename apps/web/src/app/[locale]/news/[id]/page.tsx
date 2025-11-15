import { notFound } from "next/navigation";

import type { PageParams } from "@/types";

import { NewsDetailPage } from "@views/news";

export default async function NewsDetail({
  params,
}: PageParams<{ id: string }>) {
  const { id } = await params;

  if (id == null || isNaN(Number(id))) {
    notFound();
  }

  return <NewsDetailPage id={Number(id)} />;
}
