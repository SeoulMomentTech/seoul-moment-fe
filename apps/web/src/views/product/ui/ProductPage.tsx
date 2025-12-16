"use client";

import useValidateFilter from "@features/product/model/useValidateProductFilter";
import { cn } from "@shared/lib/style";

import { Banner, ProductList } from "@features/product";

export default function ProductPage() {
  useValidateFilter();

  return (
    <div>
      <section
        className={cn(
          "mx-auto w-[1320px] pt-[106px]",
          "max-sm:w-full max-sm:pt-[56px]",
        )}
      >
        <Banner />
        <div className="px-[20px]">
          <ProductList />
        </div>
      </section>
    </div>
  );
}
