"use client";

import Image from "next/image";

import useProductCategory from "@features/product/model/useProductCategory";
import { cn } from "@shared/lib/style";

import { Skeleton } from "@seoul-moment/ui";

interface InterestCategoryChipsProps {
  className?: string;
  value: number | undefined;
  onChange(next: number | undefined): void;
}

const CONTAINER_CLASS =
  "no-scrollbar flex items-center gap-[10px] overflow-x-auto";
const CHIP_BUTTON_CLASS =
  "flex shrink-0 cursor-pointer flex-col items-center gap-[8px] px-[8px] text-body-4 font-normal sm:text-body-3";
const CHIP_CIRCLE_CLASS =
  "flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full border border-transparent bg-black/5";

export function InterestCategoryChips({
  className,
  value,
  onChange,
}: InterestCategoryChipsProps) {
  const { data: categories } = useProductCategory();

  return (
    <div className={cn(CONTAINER_CLASS, className)}>
      <button
        className={cn(CHIP_BUTTON_CLASS, value == null && "font-semibold")}
        onClick={() => onChange(undefined)}
        type="button"
      >
        <div className={cn(CHIP_CIRCLE_CLASS, value == null && "border-black")}>
          ALL
        </div>
        <span>전체</span>
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
            <div className={cn(CHIP_CIRCLE_CLASS, selected && "border-black")}>
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
