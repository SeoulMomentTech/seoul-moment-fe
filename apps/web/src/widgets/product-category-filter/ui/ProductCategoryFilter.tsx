"use client";

import Image from "next/image";

import useProductCategory from "@features/product/model/useProductCategory";
import useProductFilter from "@features/product/model/useProductFilter";
import { cn } from "@shared/lib/style";

interface ProductCategoryFilterProps {
  className?: string;
}

export function ProductCategoryFilter({
  className,
}: ProductCategoryFilterProps) {
  const { filter, handleUpdateFilter } = useProductFilter();
  const categoryId = filter.categoryId;
  const productCategoryId = filter.productCategoryId;

  const { data: categories } = useProductCategory(categoryId);

  const handleChangeCategory = (id: number) => {
    handleUpdateFilter({
      productCategoryId: id,
    })();
  };

  return (
    <div className={cn("flex items-center gap-[10px] max-sm:w-max", className)}>
      {categories.map((category) => (
        <button
          className={cn(
            "flex flex-col items-center gap-[8px]",
            "cursor-pointer rounded-full px-[8px] py-2 text-sm font-medium",
            category.id === productCategoryId && "font-semibold",
          )}
          key={category.id}
          onClick={() => handleChangeCategory(category.id)}
          type="button"
        >
          <div
            className={cn(
              "h-[50px] w-[50px] overflow-hidden rounded-full border border-black/5 bg-slate-300",
              category.id === productCategoryId && "border-black",
            )}
          >
            <Image
              alt={category.name}
              height={50}
              src={category.image}
              unoptimized
              width={50}
            />
          </div>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}
