"use client";

import { use } from "react";

import { PackageSearchIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import type { getProductList, ProductItem } from "@shared/services/product";

import { Link } from "@/i18n/navigation";

import { ProductCard } from "@entities/product";
import { Button } from "@seoul-moment/ui";
import { Empty } from "@widgets/empty";
import { SectionWithLabel } from "@widgets/section-with-label";

interface NowOnSaleProps {
  promise: ReturnType<typeof getProductList>;
}

export function NowOnSale({ promise }: NowOnSaleProps) {
  const res = use(promise);

  return (
    <SectionWithLabel
      className={cn("w-7xl pt-[100px]", "max-sm:w-full max-sm:pt-[50px]")}
      label={
        <div
          className={cn(
            "mb-[30px] flex w-full items-end justify-between",
            "max-sm:mb-5 max-sm:px-5",
          )}
        >
          <h3 className="text-title-2 max-sm:text-title-4">
            <b>Now On Sale</b>
          </h3>
        </div>
      }
    >
      <NowOnSaleContents data={res.data.list} />
    </SectionWithLabel>
  );
}

interface NowOnSaleContentsProps {
  data: ProductItem[];
}

export function NowOnSaleContents({ data }: NowOnSaleContentsProps) {
  const t = useTranslations();
  const isEmpty = data.length === 0;

  if (isEmpty) {
    return (
      <Empty
        className="h-[360px] w-full max-sm:h-60"
        description={t("no_product_found")}
        icon={
          <PackageSearchIcon
            className="text-black/30"
            height={24}
            role="img"
            width={24}
          />
        }
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-[60px]",
        "max-sm:gap-10 max-sm:px-5",
      )}
    >
      <div
        className={cn(
          "grid w-full grid-cols-6 gap-x-[22px] gap-y-10",
          "max-sm:scrollbar-hide max-sm:grid-cols-2 max-sm:gap-5 max-sm:overflow-x-auto",
        )}
      >
        {data.map((product) => (
          <Link
            className="flex-none"
            href={`/product/${product.id}`}
            key={product.id}
          >
            <ProductCard
              data={product}
              hideExtraInfo
              imageClassName="w-full h-[195px] max-sm:w-full max-sm:h-[150px]"
            />
          </Link>
        ))}
      </div>
      <Link className="max-sm:w-full" href="/product">
        <Button
          className={cn(
            "text-body-2 h-12 w-[116px] border-black/20 font-semibold",
            "max-sm:w-full",
          )}
          variant="outline"
        >
          {t("more")}
        </Button>
      </Link>
    </div>
  );
}
