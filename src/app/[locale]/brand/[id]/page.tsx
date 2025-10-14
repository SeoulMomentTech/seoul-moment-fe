import { notFound } from "next/navigation";
import type { PageParams } from "@/types";
import { BrandDetailPage } from "@views/brand";

export default async function BrandDetail({
  params,
}: PageParams<{ id: string }>) {
  const { id } = await params;

  if (id == null || isNaN(Number(id))) {
    notFound();
  }

  return <BrandDetailPage id={Number(id)} />;
}
