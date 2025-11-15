import { cn } from "@shared/lib/style";

import { Banner, ProductList } from "@features/product";

export default function ProductPage() {
  return (
    <div className="px-[20px]">
      <section
        className={cn(
          "mx-auto w-[1280px] pt-[106px]",
          "max-sm:w-full max-sm:pt-[76px]",
        )}
      >
        <Banner />
        <ProductList />
      </section>
    </div>
  );
}
