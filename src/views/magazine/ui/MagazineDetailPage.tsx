import { MagazineList, MagazineMain } from "@/features/magazine";
import { MagazineContents } from "@/features/magazine/ui/MagazineContents";
import { BrandProducts } from "@/widgets/brand-products";

export function MagazineDetailPage() {
  return (
    <>
      <MagazineMain />
      <MagazineContents />
      <MagazineList />
      <BrandProducts />
    </>
  );
}
