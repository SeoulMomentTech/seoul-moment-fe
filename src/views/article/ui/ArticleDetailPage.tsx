import { ArticleDetailContent, ArticleDetailMain } from "@/features/article";
import { BrandProducts } from "@/widgets/brand-products";
import { RelatedList } from "@/widgets/detail";

export function ArticleDetailPage() {
  return (
    <>
      <ArticleDetailMain />
      <ArticleDetailContent />
      <RelatedList />
      <BrandProducts />
    </>
  );
}
