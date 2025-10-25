"use client";

import ProductBanner from "./ProductBanner";
import ProductBrandBanner from "./ProductBrandBanner";
import useProductFilter from "../../model/useProductFilter";

function Banner() {
  const { filter } = useProductFilter();

  if (!filter.brandId) {
    return <ProductBanner />;
  }

  return <ProductBrandBanner id={filter.brandId} />;
}

export default Banner;
