"use client";

import useValidateFilter from "@features/product/model/useValidateProductFilter";
import { cn } from "@shared/lib/style";

import { Banner, ProductList } from "@features/product";

export default function ProductPage() {
  useValidateFilter();

  return (
    <div>
      <section
        className={cn("w-330 pt-26.5 mx-auto", "max-sm:w-full max-sm:pt-14")}
      >
        <Banner />
        <div className="px-5">
          <ProductList />
        </div>
      </section>
    </div>
  );
}
