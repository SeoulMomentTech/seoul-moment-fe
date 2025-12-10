"use client";

import { PackageSearchIcon } from "lucide-react";

import { useLanguage } from "@shared/lib/hooks";
import { getProductList } from "@shared/services/product";

import { Link } from "@/i18n/navigation";

import { BrandProductCard } from "@entities/brand";
import { useQuery } from "@tanstack/react-query";
import { Empty } from "@widgets/empty";
import { SectionWithLabel } from "@widgets/section-with-label";

interface BrandProductsProps {
  id: number;
}

export default function BrandProducts({ id }: BrandProductsProps) {
  const languageCode = useLanguage();
  const { data: products = [], isPending } = useQuery({
    queryKey: ["brand-products", id],
    queryFn: () =>
      getProductList({ brandId: id, page: 1, count: 4, languageCode }),
    select: (res) => res.data.list,
  });

  if (isPending) return null;

  const shouldShowEmpty = products.length === 0;

  return (
    <SectionWithLabel
      className="mx-auto w-[1280px] py-[100px] max-sm:w-full max-sm:px-[20px] max-sm:py-[50px]"
      label={
        <div className="mb-[30px] flex w-full items-end justify-between max-sm:mb-[20px]">
          <h3 className="text-title-2 max-sm:text-title-4">
            <b>Brand Products</b>
          </h3>
        </div>
      }
    >
      {shouldShowEmpty ? (
        <Empty
          className="h-[360px] w-full max-sm:h-[240px]"
          description="등록된 상품이 없습니다."
          icon={
            <PackageSearchIcon
              className="text-black/30"
              height={24}
              width={24}
            />
          }
        />
      ) : (
        <div className="max-sm:scrollbar-hide flex gap-[20px] max-sm:gap-[16px] max-sm:overflow-x-auto max-sm:overflow-y-hidden">
          {products.map((product) => (
            <Link href={`/product/${product.id}`} key={product.id}>
              <BrandProductCard {...product} />
            </Link>
          ))}
        </div>
      )}
    </SectionWithLabel>
  );
}
