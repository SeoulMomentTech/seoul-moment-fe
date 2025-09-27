import { DetailContent, DetailMain, RelatedList } from "@/features/detail";
import { BrandProducts } from "@/widgets/brand-products";

export function NewsDetailPage() {
  return (
    <>
      <DetailMain />
      <DetailContent />
      <RelatedList />
      <BrandProducts />
    </>
  );
}
