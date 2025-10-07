import { useSuspenseQuery } from "@tanstack/react-query";
import useLanguage from "@/shared/lib/hooks/useLanguage";
import type { BrandFilter } from "@/shared/services/brand";
import { getBrandFilter } from "@/shared/services/brand";

const filterName = {
  A_TO_D: "A ~ D",
  E_TO_H: "E ~ H",
  I_TO_L: "I ~ L",
  M_TO_P: "M ~ P",
  Q_TO_T: "Q ~ T",
  U_TO_Z: "U ~ Z",
};

export interface BrandFilterType extends BrandFilter {
  name: string;
}

const useBrandFilter = (categoryId?: number) => {
  const languageCode = useLanguage();
  return useSuspenseQuery({
    queryKey: ["brand-filter", languageCode, categoryId],
    queryFn: () => getBrandFilter(categoryId),
    select: (res) =>
      res.data.list.map((brand) => ({
        name: filterName[brand.filter],
        ...brand,
      })),
  });
};

export default useBrandFilter;
