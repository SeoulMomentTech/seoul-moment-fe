"use client";

import useFilter from "@/shared/lib/hooks/useFilter";
import ProductBanner from "./ProductBanner";
import ProductBrandBanner from "./ProductBrandBanner";

function Banner() {
  const { filter } = useFilter();

  if (!filter.brandId) {
    return <ProductBanner />;
  }

  return <ProductBrandBanner id={filter.brandId} />;
}

export default Banner;
