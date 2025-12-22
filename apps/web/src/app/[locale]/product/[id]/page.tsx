import { notFound } from "next/navigation";

import type { PageParams } from "@/types";

import { ProductDetailPage } from "@views/product";

export default async function ProductDetail({
  params,
}: PageParams<{ id: string }>) {
  const { id } = await params;
  const productId = parseInt(id);

  if (!Number.isInteger(productId)) {
    notFound();
  }

  return <ProductDetailPage id={Number(id)} />;
}
