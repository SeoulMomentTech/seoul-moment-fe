import { ProductCard } from "@/entities/product";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/style";

export default function BrandProductList() {
  return (
    <div
      className={cn(
        "px-[20px] pt-[50px] pb-[76px] max-sm:pt-[40px] max-sm:pb-[40px]",
      )}
    >
      <h3
        className={cn(
          "text-title-3 mb-[30px] font-semibold",
          "max-sm:text-body-1",
        )}
      >
        동일 브랜드 다른 상품
      </h3>
      <div
        className={cn(
          "flex w-full gap-[20px]",
          "max-sm:gap-[16px] max-sm:overflow-auto",
        )}
      >
        {[1, 2, 3, 4, 5].map((_, idx) => (
          <Link
            className="flex-1"
            href={`/product/${idx + 1}`}
            key={`product-${idx + 1}`}
          >
            <ProductCard
              hideExtraInfo
              imageClassName="w-full h-[216px] max-sm:w-[150px] max-sm:h-[150px]"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
