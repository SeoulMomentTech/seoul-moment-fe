"use client";

import { useRef } from "react";

import LifeStyleCard from "@entities/article/ui/StyleCard";
import { useInfiniteNewsByCategory } from "@features/news/model/useInfiniteNewsByCategory";
import { useIntersectionObserver, useLanguage } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";

interface LifeStyleListProps {
  className?: string;
}

export default function LifeStyleList({ className }: LifeStyleListProps) {
  const languageCode = useLanguage();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteNewsByCategory({ languageCode });

  useIntersectionObserver({
    target: loadMoreRef,
    enabled: hasNextPage,
    rootMargin: "200px",
    onIntersect: () => {
      if (!isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const items = data ?? [];

  return (
    <>
      <div
        className={cn(
          "grid gap-x-[40px] gap-y-[50px]",
          "max-sm:flex max-sm:flex-col max-sm:gap-[30px]",
          className,
        )}
        style={{
          gridTemplateColumns: `repeat(4,1fr)`,
        }}
      >
        {items.map((item) => (
          <LifeStyleCard
            author={item.writer}
            category=""
            date={item.createDate}
            imageUrl={item.homeImage}
            key={`lifestyle-${item.id}`}
            subTitle={item.content}
            title={item.title}
          />
        ))}
      </div>
      <div aria-hidden className="h-px w-full" ref={loadMoreRef} />
    </>
  );
}
