"use client";

import { useEffect } from "react";

import Image from "next/image";
import { useTranslations } from "next-intl";

import useProductCategory from "@features/product/model/useProductCategory";
import useProductFilter from "@features/product/model/useProductFilter";
import { cn } from "@shared/lib/style";

interface ProductCategoryFilterProps {
  className?: string;
}

export function ProductCategoryFilter({
  className,
}: ProductCategoryFilterProps) {
  const { filter, handleUpdateFilter, handleClearFilter } = useProductFilter();
  const categoryId = filter.categoryId;
  const productCategoryId = filter.productCategoryId;

  const t = useTranslations();
  const { data: categories } = useProductCategory(categoryId);
  const isValid = categories.find(
    (category) => category.id === productCategoryId,
  );

  const handleChangeCategory = (id: number) => {
    handleUpdateFilter({
      productCategoryId: id,
    })();
  };

  useEffect(() => {
    if (!isValid) {
      handleClearFilter({ productCategoryId: null });
    }
  }, [isValid, handleClearFilter]);

  return (
    <div className={cn("flex items-center gap-[10px] max-sm:w-max", className)}>
      <button
        className={cn(
          "flex flex-col items-center gap-[8px]",
          "cursor-pointer rounded-full px-[8px] py-2 text-sm font-medium",
          productCategoryId == null && "font-semibold",
        )}
        onClick={() => handleClearFilter({ productCategoryId: null })}
        type="button"
      >
        <div
          className={cn(
            "flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full border border-black/5",
            productCategoryId == null && "border-black",
          )}
        >
          ALL
        </div>
        <span>{t("subcategory_all")}</span>
      </button>
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
              "h-[50px] w-[50px] overflow-hidden rounded-full border border-black/5",
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
