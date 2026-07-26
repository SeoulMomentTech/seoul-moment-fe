"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import Image from "next/image";
import { useTranslations } from "next-intl";

import useProductCategory from "@features/product/model/useProductCategory";
import useProductFilter from "@features/product/model/useProductFilter";
import { cn } from "@shared/lib/style";

interface ProductCategoryFilterProps {
  className?: string;
}

const SCROLL_AMOUNT = 200;

const CONTAINER_CLASS =
  "no-scrollbar flex items-center gap-[10px] overflow-x-auto";
const CHIP_BUTTON_CLASS = cn(
  "flex shrink-0 flex-col items-center gap-[8px]",
  "cursor-pointer rounded-full px-[8px] py-2 text-sm font-medium",
);
const SCROLL_BUTTON_CLASS = cn(
  "absolute top-[33px] z-10 hidden -translate-y-1/2",
  "h-8 w-8 items-center justify-center rounded-full border border-black/20 bg-white sm:flex",
  "shadow-[0_0_4px_rgba(0,0,0,0.16)] transition-opacity hover:bg-gray-50",
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white",
);

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

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const updateScrollState = () => {
      setCanScrollLeft(element.scrollLeft > 0);
      setCanScrollRight(
        element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
      );
    };

    updateScrollState();
    element.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [categories]);

  const handleScroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("relative", className)}>
      <button
        aria-label="Previous categories"
        className={cn(SCROLL_BUTTON_CLASS, "left-[-18px]")}
        disabled={!canScrollLeft}
        onClick={() => handleScroll("left")}
        type="button"
      >
        <ChevronLeft className="text-black" size={20} strokeWidth={1} />
      </button>

      <div className={CONTAINER_CLASS} ref={scrollRef}>
        <button
          className={cn(
            CHIP_BUTTON_CLASS,
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
              CHIP_BUTTON_CLASS,
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

      <button
        aria-label="Next categories"
        className={cn(SCROLL_BUTTON_CLASS, "right-[-18px]")}
        disabled={!canScrollRight}
        onClick={() => handleScroll("right")}
        type="button"
      >
        <ChevronRight className="text-black" size={20} strokeWidth={1} />
      </button>
    </div>
  );
}
