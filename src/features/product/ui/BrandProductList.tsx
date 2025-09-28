import { ProductCard } from "@/entities/product";
import { cn } from "@/shared/lib/style";

export default function BrandProductList() {
  return (
    <div
      className={cn(
        "flex w-[1280px] gap-[20px]",
        "max-sm:w-full max-sm:gap-[16px] max-sm:overflow-auto",
      )}
    >
      <ProductCard
        className="flex-1"
        hideExtraInfo
        imageClassName="w-full h-[216px] max-sm:w-[150px] max-sm:h-[150px]"
      />
      <ProductCard
        className="flex-1"
        hideExtraInfo
        imageClassName="w-full h-[216px] max-sm:w-[150px] max-sm:h-[150px]"
      />
      <ProductCard
        className="flex-1"
        hideExtraInfo
        imageClassName="w-full h-[216px] max-sm:w-[150px] max-sm:h-[150px]"
      />
      <ProductCard
        className="flex-1"
        hideExtraInfo
        imageClassName="w-full h-[216px] max-sm:w-[150px] max-sm:h-[150px]"
      />
      <ProductCard
        className="flex-1"
        hideExtraInfo
        imageClassName="w-full h-[216px] max-sm:w-[150px] max-sm:h-[150px]"
      />
    </div>
  );
}
