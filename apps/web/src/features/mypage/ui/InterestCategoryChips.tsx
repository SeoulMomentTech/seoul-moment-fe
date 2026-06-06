"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import Image from "next/image";
import { useTranslations } from "next-intl";

import useProductCategory from "@features/product/model/useProductCategory";
import { cn } from "@shared/lib/style";

import { Skeleton } from "@seoul-moment/ui";

interface InterestCategoryChipsProps {
  className?: string;
  value: number | undefined;
  onChange(next: number | undefined): void;
}

const SCROLL_AMOUNT = 200;

const CONTAINER_CLASS =
  "no-scrollbar flex items-center gap-[10px] overflow-x-auto scrollbar-thin";
const CHIP_BUTTON_CLASS =
  "flex shrink-0 cursor-pointer flex-col items-center gap-[8px] px-[8px] text-body-4 font-normal sm:text-body-3";
const CHIP_CIRCLE_CLASS =
  "flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full border border-transparent bg-black/5";
const SCROLL_BUTTON_CLASS = cn(
  "absolute top-[25px] z-10 hidden -translate-y-1/2",
  "h-8 w-8 items-center justify-center rounded-full border border-black/20 bg-white sm:flex",
  "shadow-[0_0_4px_rgba(0,0,0,0.16)] transition-opacity hover:bg-gray-50",
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white",
);

export function InterestCategoryChips({
  className,
  value,
  onChange,
}: InterestCategoryChipsProps) {
  const { data: categories } = useProductCategory();
  const t = useTranslations();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
          className={cn(CHIP_BUTTON_CLASS, value == null && "font-semibold")}
          onClick={() => onChange(undefined)}
          type="button"
        >
          <div
            className={cn(CHIP_CIRCLE_CLASS, value == null && "border-black")}
          >
            ALL
          </div>
          <span>{t("subcategory_all")}</span>
        </button>
        {categories.map((category) => {
          const selected = category.id === value;
          return (
            <button
              className={cn(CHIP_BUTTON_CLASS, selected && "font-semibold")}
              key={category.id}
              onClick={() => onChange(category.id)}
              type="button"
            >
              <div
                className={cn(CHIP_CIRCLE_CLASS, selected && "border-black")}
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
          );
        })}
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

export function InterestCategoryChipsSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div aria-busy="true" className={cn(CONTAINER_CLASS, className)}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          className="flex shrink-0 flex-col items-center gap-[8px] px-[8px]"
          key={`mypage-cat-skel-${i + 1}`}
        >
          <Skeleton className="h-[50px] w-[50px] rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}
