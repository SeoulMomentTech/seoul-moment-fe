"use client";

import { HeartIcon } from "lucide-react";

import { cn } from "@shared/lib/style";
import Empty from "@widgets/empty/ui/Empty";

import { Skeleton } from "@seoul-moment/ui";

import { InterestBrandCard } from "./InterestBrandCard";
import { useGetUserLikeBrandListQuery } from "../api/useGetUserLikeBrandListQuery";

interface InterestBrandTabProps {
  className?: string;
}

export function InterestBrandTab({ className }: InterestBrandTabProps) {
  const { data, isLoading } = useGetUserLikeBrandListQuery({ count: 20 });
  const brands = data?.list ?? [];

  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-[20px] max-sm:grid-cols-1",
          className,
        )}
      >
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton
            className="h-[260px] rounded-[12px]"
            key={`mypage-like-brand-skel-${i + 1}`}
          />
        ))}
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <Empty
        className="py-[60px]"
        description="관심 브랜드가 없습니다"
        icon={<HeartIcon className="size-10 text-black/20" />}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-[20px] max-sm:grid-cols-1",
        className,
      )}
    >
      {brands.map((brand) => (
        <InterestBrandCard data={brand} key={brand.brandId} />
      ))}
    </div>
  );
}
