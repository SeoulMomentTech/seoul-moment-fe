import { NewsDetailContent, NewsDetailMain } from "@/features/news";
import { BrandProducts } from "@/widgets/brand-products";
import { RelatedList } from "@/widgets/detail";

export function NewsDetailPage() {
  return (
    <>
      <NewsDetailMain />
      <NewsDetailContent />
      <RelatedList />
      <BrandProducts />
    </>
  );
}
