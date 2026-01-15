"use client";

import { type ComponentProps, type RefObject } from "react";

import { SearchIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

import { Link } from "@/i18n/navigation";

import { ProductCard } from "@entities/product";
import { Empty } from "@widgets/empty";

interface ProductListSectionProps {
  data?: ComponentProps<typeof ProductCard>["data"][];
  isEmpty: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
}

export default function ProductListSection({
  data,
  isEmpty,
  loadMoreRef,
}: ProductListSectionProps) {
  const t = useTranslations();

  if (isEmpty) {
    return (
      <div>
        <Empty
          className="h-[400px] w-full"
          description={t("no_search_result")}
          icon={<SearchIcon className="text-black/30" height={24} width={24} />}
        />
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "gap-x-[20px] gap-y-[30px]",
          "min-h-[400px] w-full",
          "grid grid-cols-2",
        )}
      >
        {data?.map((product) => (
          <Link
            className="flex-1"
            href={`/product/${product.id}`}
            key={`mobile-product-${product.id}`}
          >
            <ProductCard
              className="h-full flex-1"
              contentClassName="h-full justify-between"
              contentWrapperClassName="h-full justify-between"
              data={product}
              imageClassName="max-sm:w-full max-sm:max-h-[150px] max-sm:min-h-[150px]"
            />
          </Link>
        ))}
      </div>
      <div className="h-px w-full" ref={loadMoreRef} />
    </>
  );
}
